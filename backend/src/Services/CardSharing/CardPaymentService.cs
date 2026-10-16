using System.Text.Json;
using CraftVision.BuildingBlocks.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CraftVision.CardSharing;

public sealed record CardPaymentView(string Status, int Amount, string? CheckoutUrl);
public static class CardPrices
{
    private static readonly Dictionary<string, int> Prices = Load();
    private static Dictionary<string, int> Load()
    {
        using var stream = typeof(CardPrices).Assembly.GetManifestResourceStream("CardSharing.prices.json")!;
        return JsonSerializer.Deserialize<Dictionary<string, int>>(stream)!;
    }
    public static int For(string slug) => Prices.TryGetValue(slug, out var amount) ? amount : throw new CardError(400, "Mẫu thiệp chưa có giá thanh toán.");
}

public sealed class CardPaymentService(CardDatabase db, CardService cards, IPaymentProvider provider, IConfiguration config)
{
    public static bool IsFullyPaid(CardPayment payment, PaymentReceipt receipt) =>
        receipt.OrderCode == payment.OrderCode && receipt.Amount == payment.Amount && receipt.AmountPaid >= payment.Amount &&
        receipt.Status == "PAID" && !string.IsNullOrWhiteSpace(receipt.Id) &&
        (payment.LinkId is null || payment.LinkId == receipt.Id);

    private static CardPaymentView View(StoredCard card, CardPayment? payment) => new(
        card.PaidAt.HasValue ? "PAID" : payment?.Status ?? "UNPAID",
        payment?.Amount ?? CardPrices.For(JsonSerializer.Deserialize<JsonElement>(card.DraftJson).GetProperty("template").GetString()!),
        card.PaidAt.HasValue ? null : payment?.CheckoutUrl);

    private async Task Refresh(StoredCard card, CardPayment payment, CancellationToken ct)
    {
        var receipt = await provider.Get(payment.OrderCode, ct);
        if (receipt.OrderCode != payment.OrderCode || receipt.Amount != payment.Amount ||
            (payment.LinkId is not null && payment.LinkId != receipt.Id))
            throw new CardError(503, "Thông tin thanh toán không khớp. Vui lòng liên hệ hỗ trợ.");
        if (IsFullyPaid(payment, receipt))
        {
            card.PaidAt ??= DateTime.UtcNow;
            payment.Status = "PAID";
        }
        else payment.Status = receipt.Status is "CANCELLED" or "EXPIRED" ? receipt.Status : "PENDING";
        await db.SaveChangesAsync(ct);
    }

    public async Task<CardPaymentView> Status(Guid owner, Guid id, CancellationToken ct)
    {
        var card = await cards.Find(owner, id, ct);
        var payment = await db.Payments.SingleOrDefaultAsync(p => p.CardId == id, ct);
        if (!card.PaidAt.HasValue && payment is not null)
        {
            try { await Refresh(card, payment, ct); }
            catch (CardError) { throw; }
            catch { throw new CardError(503, "Chưa xác minh được thanh toán với PayOS. Vui lòng thử lại."); }
        }
        return View(card, payment);
    }

    public async Task<CardPaymentView> Checkout(Guid owner, Guid id, CancellationToken ct)
    {
        var card = await cards.Find(owner, id, ct);
        if (card.PaidAt.HasValue) return View(card, null);
        var slug = JsonSerializer.Deserialize<JsonElement>(card.DraftJson).GetProperty("template").GetString()!;
        var origin = config["FrontendUrl"]?.TrimEnd('/');
        if (!Uri.TryCreate(origin, UriKind.Absolute, out var frontend) || frontend.Scheme is not ("https" or "http"))
            throw new CardError(503, "Chưa cấu hình địa chỉ website cho thanh toán.");

        // Persist the intent before contacting PayOS. A timeout always retries the same order code.
        await using (var intent = await db.Database.BeginTransactionAsync(ct))
        {
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({id.ToString()}, 0))", ct);
            var existing = await db.Payments.SingleOrDefaultAsync(p => p.CardId == id, ct);
            if (existing is null)
            {
                db.Payments.Add(new CardPayment { CardId = id, Amount = CardPrices.For(slug) });
                await db.SaveChangesAsync(ct);
            }
            await intent.CommitAsync(ct);
        }
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({id.ToString()}, 0))", ct);
        var payment = await db.Payments.SingleAsync(p => p.CardId == id, ct);
        await db.Entry(payment).ReloadAsync(ct);
        await db.Entry(card).ReloadAsync(ct);
        if (card.PaidAt.HasValue) return View(card, payment);
        try
        {
            if (payment.CheckoutUrl is not null)
            {
                await Refresh(card, payment, ct);
                if (payment.Status is "CANCELLED" or "EXPIRED")
                {
                    // A terminal unpaid order can be replaced; retain pending orders on all errors.
                    db.Payments.Remove(payment); await db.SaveChangesAsync(ct);
                    payment = new CardPayment { CardId = id, Amount = CardPrices.For(slug) };
                    db.Payments.Add(payment); await db.SaveChangesAsync(ct);
                    await tx.CommitAsync(ct);
                    await tx.DisposeAsync();
                    return await Checkout(owner, id, ct);
                }
            }
            if (!card.PaidAt.HasValue && payment.CheckoutUrl is null)
            {
                var returnUrl = $"{origin}/cards/{slug}/edit?card={id}&payment=return";
                var cancelUrl = $"{origin}/cards/{slug}/edit?card={id}&payment=cancel";
                var link = await provider.Create(payment.OrderCode, payment.Amount, returnUrl, cancelUrl, ct);
                if (!Uri.TryCreate(link.CheckoutUrl, UriKind.Absolute, out var url) || url.Scheme != "https" ||
                    !(url.Host == "payos.vn" || url.Host.EndsWith(".payos.vn", StringComparison.OrdinalIgnoreCase)) || string.IsNullOrWhiteSpace(link.Id))
                    throw new CardError(503, "PayOS chưa trả về liên kết thanh toán hợp lệ.");
                payment.LinkId = link.Id; payment.CheckoutUrl = link.CheckoutUrl;
                await db.SaveChangesAsync(ct);
            }
            await tx.CommitAsync(ct);
            return View(card, payment);
        }
        catch (CardError) { throw; }
        catch { throw new CardError(503, "Không thể mở thanh toán PayOS. Vui lòng thử lại; thiệp vẫn được lưu."); }
    }
}
