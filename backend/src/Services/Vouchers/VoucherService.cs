using CraftVision.Application.DTOs.Order;
using CraftVision.Application.DTOs.Vouchers;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Vouchers;

public sealed class VoucherError(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

public sealed class VoucherService(ApplicationDbContext db, IOrderPricingService pricing, IPayOSService payments) : IWebVoucherService
{
    private async Task LockAsync(Guid id, CancellationToken ct)
    {
        if (db.Database.CurrentTransaction is null) throw new InvalidOperationException("Voucher updates require a transaction.");
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT id FROM vouchers WHERE id = {id} FOR UPDATE", ct);
    }

    private static void Validate(VoucherSettings value)
    {
        VoucherRules.ValidatePercent(value.DiscountPercent);
        if (value.CustomerLimit is < 1 or > 1000000) throw new ArgumentException("Giới hạn khách phải từ 1 đến 1.000.000.");
        if (value.EndsAt.HasValue && value.EndsAt.Value.ToUniversalTime() <= DateTime.UtcNow)
            throw new ArgumentException("Hạn sử dụng phải ở tương lai.");
    }

    private async Task<VoucherView> ViewAsync(Voucher voucher, CancellationToken ct)
    {
        var counts = await db.VoucherUsages.AsNoTracking().Where(u => u.VoucherId == voucher.Id)
            .GroupBy(u => u.Status).Select(g => new { Status = g.Key, Count = g.Count() }).ToListAsync(ct);
        var reserved = counts.FirstOrDefault(x => x.Status == "Reserved")?.Count ?? 0;
        var used = counts.FirstOrDefault(x => x.Status == "Used")?.Count ?? 0;
        return new(voucher.Id, voucher.Code, (int)voucher.DiscountPercent, voucher.CustomerLimit!.Value,
            reserved, used, Math.Max(0, voucher.CustomerLimit.Value - reserved - used), voucher.IsActive,
            voucher.EndsAt.Year >= 9999 ? null : voucher.EndsAt, voucher.CreatedAt, voucher.Revision);
    }

    public async Task<IReadOnlyList<VoucherView>> ListAsync(CancellationToken ct = default)
    {
        var vouchers = await db.Vouchers.AsNoTracking().Where(v => v.CustomerLimit != null).OrderBy(v => v.DiscountPercent).ToListAsync(ct);
        var result = new List<VoucherView>();
        foreach (var voucher in vouchers) result.Add(await ViewAsync(voucher, ct));
        return result;
    }

    public async Task<VoucherView> CreateAsync(Guid admin, VoucherSettings settings, CancellationToken ct = default)
    {
        Validate(settings);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        // Serialize creation for the same percentage, including when no voucher row exists yet.
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(208036, {settings.DiscountPercent})", ct);
        if (await db.Vouchers.AnyAsync(v => v.CustomerLimit != null && v.DiscountPercent == settings.DiscountPercent, ct))
            throw new VoucherError(409, "Mức giảm này đã có mã. Hãy chỉnh sửa mã hiện có.");
        var code = VoucherRules.GenerateCode();
        var voucher = new Voucher { Code = code, DiscountPercent = settings.DiscountPercent,
            CustomerLimit = settings.CustomerLimit, EndsAt = settings.EndsAt?.ToUniversalTime() ?? DateTime.SpecifyKind(DateTime.MaxValue, DateTimeKind.Utc),
            IsActive = settings.IsActive, CreatedBy = admin };
        db.Vouchers.Add(voucher);
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException { SqlState: "23505" })
        { throw new VoucherError(409, "Mã đã tồn tại. Hãy tải lại danh sách."); }
        await tx.CommitAsync(ct);
        return await ViewAsync(voucher, ct);
    }

    public async Task<VoucherView> UpdateAsync(Guid id, VoucherSettings settings, CancellationToken ct = default)
    {
        // An expired code can still be disabled or have its customer limit adjusted.
        VoucherRules.ValidatePercent(settings.DiscountPercent);
        if (settings.CustomerLimit is < 1 or > 1000000) throw new ArgumentException("Giới hạn khách không hợp lệ.");
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await LockAsync(id, ct);
        var voucher = await db.Vouchers.SingleOrDefaultAsync(v => v.Id == id && v.CustomerLimit != null, ct)
            ?? throw new VoucherError(404, "Không tìm thấy mã.");
        if (settings.DiscountPercent != voucher.DiscountPercent) throw new ArgumentException("Không thể đổi phần trăm của mã đã tạo.");
        if (settings.Revision != voucher.Revision) throw new VoucherError(409, "Mã đã được chỉnh sửa. Hãy tải lại.");
        var occupied = await db.VoucherUsages.CountAsync(u => u.VoucherId == id && (u.Status == "Reserved" || u.Status == "Used"), ct);
        if (settings.CustomerLimit < occupied) throw new VoucherError(409, $"Giới hạn phải ít nhất {occupied}, gồm lượt đang giữ và đã dùng.");
        voucher.CustomerLimit = settings.CustomerLimit;
        voucher.EndsAt = settings.EndsAt?.ToUniversalTime() ?? DateTime.SpecifyKind(DateTime.MaxValue, DateTimeKind.Utc);
        voucher.IsActive = settings.IsActive;
        voucher.Revision++;
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return await ViewAsync(voucher, ct);
    }

    public async Task<VoucherUsagePage> UsagesAsync(Guid id, int page, CancellationToken ct = default)
    {
        if (page is < 1 or > 1000000) throw new ArgumentException("Trang không hợp lệ.");
        if (!await db.Vouchers.AnyAsync(v => v.Id == id && v.CustomerLimit != null, ct)) throw new VoucherError(404, "Không tìm thấy mã.");
        var query = db.VoucherUsages.AsNoTracking().Where(u => u.VoucherId == id);
        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(u => u.ReservedAt).ThenBy(u => u.Id).Skip((page - 1) * 20).Take(20)
            .Select(u => new VoucherUsageView(u.Id, u.UserId, u.User!.FullName ?? u.User.Email ?? "Khách hàng",
                u.OrderId, u.Order!.OrderCode, u.Status, u.Order.PaymentStatus.ToString(), u.Order.OrderStatus.ToString(),
                u.Order.DiscountAmount, u.ReservedAt, u.ExpiresAt, u.UsedAt, u.ReleasedAt)).ToListAsync(ct);
        return new(items, total, page);
    }

    private async Task<Voucher> AvailableAsync(Guid user, string code, CancellationToken ct)
    {
        var normalized = code.Trim().ToUpperInvariant();
        if (normalized.Length != 8) throw new ArgumentException("Mã giảm giá gồm 8 ký tự.");
        var voucher = await db.Vouchers.AsNoTracking().SingleOrDefaultAsync(v => v.Code == normalized && v.CustomerLimit != null, ct)
            ?? throw new ArgumentException("Mã giảm giá không tồn tại.");
        if (!voucher.IsActive) throw new ArgumentException("Mã giảm giá đang tạm khóa.");
        if (voucher.StartsAt > DateTime.UtcNow || voucher.EndsAt <= DateTime.UtcNow) throw new ArgumentException("Mã giảm giá chưa có hiệu lực hoặc đã hết hạn.");
        if (await db.VoucherUsages.AnyAsync(u => u.VoucherId == voucher.Id && u.UserId == user && (u.Status == "Reserved" || u.Status == "Used"), ct))
            throw new ArgumentException("Bạn đã sử dụng mã hoặc đang có đơn giữ lượt của mã này.");
        var occupied = await db.VoucherUsages.CountAsync(u => u.VoucherId == voucher.Id && (u.Status == "Reserved" || u.Status == "Used"), ct);
        if (occupied >= voucher.CustomerLimit) throw new ArgumentException("Mã giảm giá đã hết lượt khả dụng.");
        return voucher;
    }

    public async Task<CheckoutQuote> QuoteAsync(Guid user, CreateOrderDto request, CancellationToken ct = default)
    {
        var quote = await pricing.PriceAsync(request, ct);
        if (string.IsNullOrWhiteSpace(request.VoucherCode)) return quote;
        var voucher = await AvailableAsync(user, request.VoucherCode, ct);
        return VoucherRules.Discount(quote, (int)voucher.DiscountPercent, voucher.Code);
    }

    public async Task ReserveAsync(Order order, string code, CancellationToken ct = default)
    {
        var normalized = code.Trim().ToUpperInvariant();
        var id = await db.Vouchers.Where(v => v.Code == normalized && v.CustomerLimit != null).Select(v => (Guid?)v.Id).SingleOrDefaultAsync(ct)
            ?? throw new ArgumentException("Mã giảm giá không tồn tại.");
        await LockAsync(id, ct);
        var voucher = await AvailableAsync(order.UserId, normalized, ct);
        var quote = VoucherRules.Discount(new(order.TotalAmount - order.ShippingFee, order.ShippingFee,
            order.TotalAmount, 0, 0, 0, order.TotalAmount, null, 0, []), (int)voucher.DiscountPercent, voucher.Code);
        order.VoucherCode = quote.VoucherCode; order.DiscountPercent = quote.DiscountPercent;
        order.OriginalTotal = quote.OriginalTotal; order.DiscountAmount = quote.DiscountAmount;
        order.MerchandiseDiscount = quote.MerchandiseDiscount; order.ShippingDiscount = quote.ShippingDiscount;
        order.TotalAmount = quote.TotalAmount;
        order.VoucherUsage = new VoucherUsage { VoucherId = id, UserId = order.UserId, OrderId = order.Id,
            ExpiresAt = order.PaymentMethod == PaymentMethod.BankTransfer && order.TotalAmount > 0 ? DateTime.UtcNow.AddMinutes(30) : null };
        db.VoucherUsages.Add(order.VoucherUsage);
    }

    public async Task SynchronizeAsync(Order order, CancellationToken ct = default)
    {
        if (order.VoucherCode is null) return;
        var usage = order.VoucherUsage ?? await db.VoucherUsages.SingleOrDefaultAsync(u => u.OrderId == order.Id, ct);
        if (usage is null || usage.Status != "Reserved") return;
        // Serializes releases with new reservations and administrative limit updates.
        await LockAsync(usage.VoucherId, ct);
        if (db.Entry(usage).State != EntityState.Added) await db.Entry(usage).ReloadAsync(ct);
        if (usage.Status != "Reserved") return;
        var closed = order.PaymentMethod != PaymentMethod.BankTransfer || order.TotalAmount == 0;
        if (order.OrderStatus == OrderStatus.Cancelled && order.PaymentStatus == PaymentStatus.Unpaid && !closed)
            closed = long.TryParse(order.OrderCode, out var number) && await payments.CloseUnpaidPaymentAsync(number, order.TotalAmount);
        VoucherRules.Transition(usage, order, closed, DateTime.UtcNow);
        order.VoucherUsage = usage;
    }

    public async Task EnsurePayableAsync(Order order, CancellationToken ct = default)
    {
        var usage = await db.VoucherUsages.SingleAsync(u => u.OrderId == order.Id, ct);
        await LockAsync(usage.VoucherId, ct);
        await db.Entry(usage).ReloadAsync(ct); await db.Entry(order).ReloadAsync(ct);
        if (usage.Status != "Reserved" || order.OrderStatus == OrderStatus.Cancelled ||
            (usage.ExpiresAt.HasValue && usage.ExpiresAt <= DateTime.UtcNow))
            throw new InvalidOperationException("Đơn đã hủy hoặc thời gian giữ mã đã hết. Không thể tạo lại thanh toán.");
    }

    public async Task ExpireAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var ids = await db.VoucherUsages.AsNoTracking().Where(u => u.Status == "Reserved" && u.ExpiresAt < now &&
            u.Order!.PaymentStatus == PaymentStatus.Unpaid).OrderBy(u => u.ExpiresAt).Select(u => u.Id).Take(20).ToListAsync(ct);
        foreach (var id in ids)
        {
            db.ChangeTracker.Clear();
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            var usage = await db.VoucherUsages.Include(u => u.Order).SingleAsync(u => u.Id == id, ct);
            await LockAsync(usage.VoucherId, ct);
            await db.Entry(usage).ReloadAsync(ct); await db.Entry(usage.Order!).ReloadAsync(ct);
            var order = usage.Order!;
            if (usage.Status != "Reserved" || order.PaymentStatus != PaymentStatus.Unpaid) continue;
            if (!long.TryParse(order.OrderCode, out var code) || !await payments.CloseUnpaidPaymentAsync(code, order.TotalAmount)) continue;
            order.OrderStatus = OrderStatus.Cancelled; order.Revision++; order.UpdatedAt = DateTime.UtcNow;
            var tags = await db.Gifts.Where(g => g.OrderItem!.OrderId == order.Id).Select(g => g.NfcTag).ToListAsync(ct);
            foreach (var tag in tags.Where(t => t is not null && t.Status == NfcStatus.Reserved))
            { tag!.Status = NfcStatus.Available; tag.LinkedUrl = null; tag.UpdatedAt = DateTime.UtcNow; }
            VoucherRules.Transition(usage, order, true, DateTime.UtcNow);
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        }
    }
}
