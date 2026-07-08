# 🚀 BẢN ĐẶC TẢ KIẾN TRÚC & KẾ HOẠCH TRIỂN KHAI TRIPO3D AI

**Phiên bản:** 3.0 (Strict Production-Ready)  
**Nền tảng:** .NET Core (Clean Architecture), EF Core, PostgreSQL / SQL Server  
**Trọng tâm tối ưu:** Bỏ qua bước upload trung gian (Direct URL), Idempotency, Transactional Consistency, Distributed Locking cho Worker.

---

## 1. TỔNG QUAN LUỒNG XỬ LÝ (WORKFLOW)

### 1.1. Luồng Image-to-3D (Sử dụng Direct URL)
Tripo3D cho phép truyền trực tiếp URL ảnh thay vì tải ảnh về và upload lại. Yêu cầu ảnh phải public (Cloudinary/AWS S3 public read) và < 20MB.

**Trình tự thực thi chuẩn (Transactional Boundary):**
1. **Client** gọi API kèm `UploadedFileId` và `IdempotencyKey`.
2. **Backend (Application Layer)**:
   - Validate `IdempotencyKey` (Nếu trùng -> Trả về kết quả cũ).
   - Validate IDOR: Kiểm tra `UploadedFileId` có đúng thuộc về `UserId` đang request không.
   - Validate SSRF: Kiểm tra domain của URL ảnh có nằm trong Whitelist (vd: `res.cloudinary.com`) không.
3. **Mở DB Transaction**:
   - Trừ Credit của User trong bảng `UserQuotas`.
   - Tạo bản ghi `Ai3dRequests` với `Status = 'queued'`, `TripoTaskId = NULL`.
4. **Gọi API Tripo3D (HTTP POST)** truyền URL ảnh.
   - **NẾU THÀNH CÔNG:** Cập nhật `TripoTaskId` vào bản ghi -> **Commit Transaction**.
   - **NẾU THẤT BẠI (Lỗi mạng, 4xx, hết ví):** Rollback Credit -> Cập nhật bản ghi thành `Status = 'failed'`, lưu `ErrorMessage` -> **Commit Transaction** (Lưu vết lỗi, người dùng không mất tiền).
5. Trả về `InternalTaskId` cho Client để bắt đầu Polling.

---

## 2. PAYLOAD GIAO TIẾP TRIPO3D API

Cấu trúc JSON chính xác cần gửi sang endpoint `POST https://api.tripo3d.ai/v2/openapi/task`:

**Với Text-to-3D:**
```json
{
  "type": "text_to_model",
  "prompt": "A highly detailed cyberpunk robot, 4k resolution",
  "model_version": "v2.5-20250123"
}
```

**Với Image-to-3D (Direct URL):**
```json
{
  "type": "image_to_model",
  "file": {
    "type": "jpg", 
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1/user-images/abc.jpg"
  },
  "model_version": "v2.5-20250123"
}
```
*(Ghi chú: type trong node file có thể là png, jpg, hoặc jpeg tùy thuộc vào metadata của file gốc).*

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU (ENTITY FRAMEWORK)

### 3.1. Entity Configuration (Ai3dRequest.cs)

| Tên Cột | Kiểu | Cấu hình EF / Index | Ý nghĩa |
|---|---|---|---|
| Id | Guid | [Key] | Khóa chính nội bộ |
| UserId | Guid | [ForeignKey] | ID người dùng tạo request |
| TaskType | string | HasMaxLength(20) | TextTo3D hoặc ImageTo3D |
| TripoTaskId | string | HasMaxLength(255), IsUnique | ID do Tripo trả về (Null nếu lỗi từ bước 1) |
| Status | string | HasMaxLength(50) | queued, running, success, failed, ... |
| IdempotencyKey | string | HasMaxLength(128), IsUnique | Chống gọi API 2 lần (Double-submit) |
| LockedBy | string | HasMaxLength(128) | Tên/ID của Worker đang xử lý Task này |
| LockedUntil | DateTime? | | Thời gian hết hạn khóa (Tránh kẹt Task) |
| CreditCost | int | | Số Credit đã trừ |
| ResultModelUrl | string | | Link file .glb khi AI render xong |

### 3.2. Index Tối Ưu Cho Background Worker
Để worker lấy dữ liệu cực nhanh mà không cần quét toàn bộ bảng (Table Scan):
```csharp
// Trong DbContext OnModelCreating:
builder.Entity<Ai3dRequest>()
       .HasIndex(x => new { x.Status, x.LockedUntil })
       .HasFilter("[Status] IN ('queued', 'running')"); // SQL Server Syntax
```

---

## 4. INFRASTRUCTURE: CƠ CHẾ BACKGROUND WORKER (DISTRIBUTED LOCK)

Để giải quyết bài toán Race Condition khi bạn có 2+ server (hoặc 2+ container) cùng chạy Worker ngầm, ta sử dụng cú pháp cập nhật trực tiếp (Bulk Update) trong EF Core 7/8 hoặc Raw SQL để "dành quyền" xử lý (Claim Task).

**Cơ chế Claim Task an toàn (3dTaskProcessorService.cs)**
```csharp
public async Task ProcessPendingTasksAsync(string workerId, CancellationToken ct)
{
    var lockTime = DateTime.UtcNow.AddMinutes(2); // Khóa trong 2 phút
    var now = DateTime.UtcNow;

    // 1. Dành quyền (Claim) các task đang chờ và chưa bị khóa bởi worker khác
    // Dùng ExecuteUpdateAsync (EF Core 7+) để khóa record atomically ở mức Database
    await _dbContext.Ai3dRequests
        .Where(x => (x.Status == "queued" || x.Status == "running") 
                 && (x.LockedUntil == null || x.LockedUntil < now))
        .Take(10) // Xử lý batch 10 task mỗi lần
        .ExecuteUpdateAsync(s => s
            .SetProperty(p => p.LockedBy, workerId)
            .SetProperty(p => p.LockedUntil, lockTime), ct);

    // 2. Kéo các task ĐÃ ĐƯỢC KHÓA BỞI WORKER NÀY lên RAM để gọi API
    var tasksToProcess = await _dbContext.Ai3dRequests
        .Where(x => x.LockedBy == workerId && x.LockedUntil == lockTime)
        .ToListAsync(ct);

    foreach (var task in tasksToProcess)
    {
        // 3. Gọi HTTP GET https://api.tripo3d.ai/v2/openapi/task/{task.TripoTaskId}
        var tripoResult = await _tripoClient.GetTaskStatusAsync(task.TripoTaskId, ct);
        
        task.Status = tripoResult.Data.Status;
        task.Progress = tripoResult.Data.Progress;
        
        if (task.Status == "success") {
            task.ResultModelUrl = tripoResult.Data.Result.ModelUrl;
            task.LockedUntil = null; // Mở khóa
        }
        else if (new[] { "failed", "cancelled", "banned", "expired" }.Contains(task.Status)) {
            task.ErrorMessage = tripoResult.Data.ErrorMsg;
            task.LockedUntil = null;
            
            // [QUAN TRỌNG]: Hoàn lại tiền cho user
            await _quotaService.RefundCreditAsync(task.UserId, task.CreditCost, ct);
        }
        else {
            // Task vẫn đang running -> Tính toán ETA và gia hạn thời gian khóa (LockedUntil)
            var leftTimeSec = tripoResult.Data.RunningLeftTime ?? 30;
            task.LockedUntil = DateTime.UtcNow.AddSeconds(Math.Max(leftTimeSec, 30));
        }
    }

    await _dbContext.SaveChangesAsync(ct);
}
```

---

## 5. APPLICATION LAYER (VALIDATION & SERVICES)

Logic tạo Task (Ví dụ cho Image-to-3D) đặt tại Layer này đảm bảo tính đóng gói của Clean Architecture:

```csharp
public async Task<Result<Ai3dTaskStatusDto>> CreateImageTaskAsync(Guid userId, CreateImageTo3dRequestDto request, CancellationToken ct)
{
    // 1. Idempotency Check
    var existingTask = await _dbContext.Ai3dRequests.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey);
    if (existingTask != null) return MapToDto(existingTask);

    // 2. IDOR & SSRF Validation
    var fileRecord = await _dbContext.UploadedFiles.FirstOrDefaultAsync(x => x.Id == request.UploadedFileId);
    if (fileRecord == null || fileRecord.UserId != userId) 
        return Result.Fail("Không tìm thấy ảnh hoặc bạn không có quyền truy cập ảnh này.");
        
    if (!fileRecord.Url.Contains("res.cloudinary.com")) 
        return Result.Fail("Nguồn ảnh không được phép (SSRF Protection).");

    // 3. Transaction
    using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
    try 
    {
        // 3.1. Trừ tiền (Tạm tính)
        int cost = _config.ImageTo3DCreditCost;
        await _quotaService.DeductCreditAsync(userId, cost, ct);

        // 3.2. Lưu DB trạng thái ban đầu
        var newTask = new Ai3dRequest {
            UserId = userId,
            TaskType = "ImageTo3D",
            Status = "queued",
            IdempotencyKey = request.IdempotencyKey,
            CreditCost = cost,
            UploadedFileId = request.UploadedFileId,
            ModelVersion = _config.DefaultModelVersion
        };
        _dbContext.Ai3dRequests.Add(newTask);
        await _dbContext.SaveChangesAsync(ct);

        // 3.3. Gọi API Tripo (Tránh giữ lock DB quá lâu, nên EF SaveChanges trước)
        var tripoResponse = await _tripoClient.CreateImageToModelTaskAsync(fileRecord.Url, ct);

        if (tripoResponse.IsSuccess) {
            newTask.TripoTaskId = tripoResponse.TaskId;
        } else {
            // Khởi tạo thất bại -> Trả lại tiền và đánh dấu Failed
            newTask.Status = "failed";
            newTask.ErrorMessage = tripoResponse.ErrorMsg ?? "Lỗi kết nối AI Provider";
            await _quotaService.RefundCreditAsync(userId, cost, ct);
        }

        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success(MapToDto(newTask));
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync(ct);
        _logger.LogError(ex, "Lỗi Transaction khi tạo 3D Task");
        return Result.Fail("Lỗi hệ thống khi khởi tạo tác vụ.");
    }
}
```

---

## 6. QUẢN LÝ RESILIENCE (IHttpClientFactory & Polly)

Cấu hình tại Program.cs hoặc DependencyInjection.cs để API Gateway không bị sập theo Tripo khi có sự cố mạng.

```csharp
services.AddHttpClient<ITripoClient, TripoClient>(client =>
{
    client.BaseAddress = new Uri(configuration["Tripo3D:BaseUrl"]);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", configuration["Tripo3D:ApiKey"]);
    client.Timeout = TimeSpan.FromSeconds(15); // Không chờ quá lâu để tránh nghẽn thread
})
// Retry 3 lần nếu gặp lỗi mạng tạm thời hoặc 5xx, giãn cách 1s, 2s, 4s
.AddTransientHttpErrorPolicy(policy => policy.WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))))
// Ngắt mạch (Circuit Breaker) nếu lỗi liên tục 5 lần -> Ngừng gọi trong 30 giây
.AddTransientHttpErrorPolicy(policy => policy.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
```
