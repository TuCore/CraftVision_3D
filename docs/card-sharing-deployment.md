# Lưu thiệp và link công khai

## Luồng sử dụng

1. Mở `/cards`, chọn **Cá nhân hóa**, đăng nhập bằng tài khoản hiện có.
2. Điền lời chúc, ảnh/album, nhạc và các mục riêng của mẫu.
3. **Lưu lên server** giữ bản nháp riêng tư. **Xuất bản & tạo link** lưu rồi tạo bản công khai.
4. Sao chép link `/love-gift/s/{token}`. Người nhận không cần đăng nhập.
5. Mở `/cards/mine` để sửa thiệp đã lưu trên thiết bị khác.
6. **Cập nhật bản công khai** giữ nguyên link và thay nội dung. Lưu bản nháp đơn thuần không đổi bản đã xuất bản.
7. **Thu hồi link** chặn yêu cầu mới. Xuất bản lại tạo token mới. Không thể thu hồi bản người nhận đã tải hoặc chụp lại.

Link localhost chỉ dùng thử trên máy phát triển. Link gửi cho người khác phải được tạo từ domain frontend đã deploy.

## Cấu hình production (Vercel + backend hiện có)

Frontend vẫn gọi cùng origin `/api/*`; Next.js rewrite chuyển tới Gateway. Không gọi thẳng service.

Trên Vercel đặt `NEXT_PUBLIC_API_URL=https://<domain-backend>` (không thêm `/api`) rồi redeploy vì rewrite được tạo lúc build.

Trên host backend đặt các biến môi trường sau bằng giá trị thật, không commit secrets:

```text
ConnectionStrings__Cards=Host=<postgres-host>;Port=5432;Database=<dedicated-cards-database>;Username=<cards-user>;Password=<secret>;SSL Mode=Require
CloudinarySettings__CloudName=<cloud-name>
CloudinarySettings__ApiKey=<api-key>
CloudinarySettings__ApiSecret=<api-secret>
CloudinarySettings__UploadFolder=craftvision/uploads
```

Tạo database PostgreSQL **riêng cho CardSharing**, cùng máy chủ PostgreSQL cũng được. Tài khoản database cần quyền tạo bảng/index khi khởi động lần đầu. Không trỏ `Cards` vào database đơn hàng. Cấu hình JWT/AI/payment và kết nối legacy hiện có vẫn cần giữ cho host Presentation.

**Docker/Render:** build context phải là **root repository**, Dockerfile `backend/Dockerfile`. Nếu Render đang đặt Root Directory là `backend`, đổi thành root repository; Docker Context là `.`. Build bằng:

```sh
docker build -f backend/Dockerfile -t craftvision-backend .
```

Lý do: project CardSharing nhúng schema từ `/api-specs/card-fields.json` và SQL từ `/databases/CardSharing/001_initial.sql`. Khi khởi động, module chạy SQL tạo bảng/index nếu chưa có; không xóa/chỉnh dữ liệu legacy. Các thay đổi schema tiếp theo phải bổ sung script tiến tới và cơ chế version tương ứng, không sửa lịch sử đã triển khai.

Nếu chưa có `ConnectionStrings__Cards`, host vẫn chạy nhưng API thiệp trả 503 có thông báo. Nếu có connection nhưng không truy cập được DB/không đủ quyền, startup thất bại để tránh báo lưu thành công giả.

## Kiến trúc và giới hạn

- `/backend/src/Services/CardSharing`: business logic, validator, DbContext riêng, Cloudinary adapter.
- `/backend/src/Gateway/CardSharingController.cs`: adapter HTTP và JWT; hiện được host Presentation compile vì Gateway riêng của repository còn là placeholder. Tách host về sau không đổi URL frontend.
- Không query bảng users/orders của service khác; owner lấy từ JWT được host xác thực.
- CardSharing phục vụ bộ thiệp cá nhân hóa hiện tại; chưa cấp quyền sản phẩm trả phí/NFC và chưa tích hợp thanh toán cho 54 mẫu.
- Tối đa 100 thiệp/tài khoản, 256 MiB media/tài khoản, 8 MiB/tệp, 256 KiB JSON. Chưa có giao diện xóa vĩnh viễn media; nội dung không dùng nữa vẫn tính vào quota. Cần bổ sung cơ chế dọn media có thời gian chờ nếu triển khai quy mô lớn.
- Media lưu dạng Cloudinary `authenticated`, chỉ server giữ URL ký. Gateway chỉ trả byte khi owner đăng nhập hoặc file được tham chiếu bởi ít nhất một bản công khai. Nếu cùng ảnh được dùng trong nhiều thiệp đang công khai, thu hồi một thiệp không khóa ảnh của các thiệp còn lại.
- [Cloudinary authenticated delivery](https://cloudinary.com/documentation/control_access_to_media) yêu cầu URL ký cho cả bản gốc và bản biến đổi. Không bật CDN cache cho `/api/cards/*`; API trả `Cache-Control: no-store` và public viewer đặt noindex.
- Backup riêng database Cards và media Cloudinary. Redeploy backend không làm mất nội dung.

## Kiểm thử

Máy phát triển hiện tại đã có database `craftvision_cards_local`; kết nối được lưu trong .NET user-secrets của Presentation. Khởi động backend ở môi trường Development sẽ đọc cấu hình này. Trên máy khác cần tạo database riêng và đặt `ConnectionStrings:Cards` bằng `dotnet user-secrets set` hoặc biến môi trường tương ứng; không sao chép mật khẩu vào Git.

Đặt `CARDS_TEST_CONNECTION` vào **database PostgreSQL local riêng**, rồi chạy:

```sh
dotnet test backend/src/Services/CardSharing.Tests
dotnet build backend/src/CraftVision.Presentation
cd frontend
npm run test:cards
npx tsc --noEmit
npm run build
```

Integration test tạo owner ngẫu nhiên, kiểm tra snapshot, quyền sở hữu, media riêng tư, revision conflict, thu hồi/đổi token và khởi động trên dữ liệu có sẵn; dọn dữ liệu của chính test theo thứ tự child → parent. Không chạy trên production.

Sau deploy: đăng nhập, tạo thiệp có ảnh/nhạc, xuất bản, mở link ở cửa sổ ẩn danh; sửa bản nháp và xác nhận link chưa đổi nội dung; cập nhật bản công khai; thu hồi và xác nhận link/media không dùng ở thiệp khác trả 404.

Khi thay fields trong catalog, cập nhật `api-specs/card-fields.json`; test frontend kiểm tra đồng bộ toàn bộ 54 schema.
