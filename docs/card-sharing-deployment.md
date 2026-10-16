# Lưu thiệp và link công khai

## Luồng sử dụng

1. Mở `/cards`, chọn **Cá nhân hóa**, đăng nhập bằng tài khoản hiện có.
2. Điền lời chúc, ảnh/album, nhạc và các mục riêng của mẫu.
3. **Lưu lên server** giữ bản nháp riêng tư. **Thanh toán QR qua PayOS** lưu thiệp rồi mở trang PayOS với giá do backend xác định (29.000–49.000 VND).
   Khi quay lại trình chỉnh sửa, hệ thống truy vấn PayOS để xác nhận đã nhận đủ tiền. Có thể nhấn **Kiểm tra thanh toán** nếu vừa chuyển tiền hoặc đã đóng trang thanh toán. Sau đó nhấn **Xuất bản & tạo link** để tạo bản công khai.
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
PayOS__ClientId=<client-id>
PayOS__ApiKey=<api-key>
PayOS__ChecksumKey=<checksum-key>
FrontendUrl=https://<frontend-domain>
```

Tạo database PostgreSQL **riêng cho CardSharing**, cùng máy chủ PostgreSQL cũng được. Tài khoản database cần quyền tạo bảng/index khi khởi động lần đầu. Không trỏ `Cards` vào database đơn hàng. Cấu hình JWT/AI/payment và kết nối legacy hiện có vẫn cần giữ cho host Presentation.

**Docker/Render:** build context phải là **root repository**, Dockerfile `backend/Dockerfile`. Nếu Render đang đặt Root Directory là `backend`, đổi thành root repository; Docker Context là `.`. Build bằng:

```sh
docker build -f backend/Dockerfile -t craftvision-backend .
```

Lý do: project CardSharing nhúng schema từ `/api-specs/card-fields.json`, bảng giá từ `/api-specs/card-prices.json` và SQL từ `/databases/CardSharing/001_initial.sql`, `002_payments.sql`. Khi khởi động, module chạy các script idempotent theo thứ tự; script 002 thêm cột PaidAt, bảng CardPayments và sequence mã đơn riêng. Không xóa bản nháp hoặc sửa lịch sử migration. Tài khoản database cần quyền ALTER TABLE và CREATE SEQUENCE cho lần nâng cấp này.

Các link đã xuất bản trước đây nhưng chưa thanh toán sẽ trả 404, ảnh/nhạc cũng không còn được truy cập công khai qua link đó. Chủ sở hữu vẫn đọc và sửa bản nháp sau khi đăng nhập; thanh toán thiệp để mở lại quyền chia sẻ. Cần deploy backend và frontend cùng phiên bản để áp dụng việc chặn ở server.

Nếu chưa có `ConnectionStrings__Cards`, host vẫn chạy nhưng API thiệp trả 503 có thông báo. Nếu có connection nhưng không truy cập được DB/không đủ quyền, startup thất bại để tránh báo lưu thành công giả.

## Kiến trúc và giới hạn

- `/backend/src/Services/CardSharing`: business logic, validator, DbContext riêng, Cloudinary adapter.
- `/backend/src/Gateway/CardSharingController.cs`: adapter HTTP và JWT; hiện được host Presentation compile vì Gateway riêng của repository còn là placeholder. Tách host về sau không đổi URL frontend.
- Không query bảng users/orders của service khác; owner lấy từ JWT được host xác thực.
- Mỗi bản thiệp đã lưu có thanh toán riêng, không dùng quyền của đơn hàng/NFC khác. Một lần thanh toán cho phép sửa và xuất bản lại cùng thiệp; không thể đổi template của bản đã lưu. Bản nháp và xem thử trên thiết bị vẫn miễn phí.
- Gateway cung cấp POST/GET `/api/cards/{id}/payment`. CardSharing tự sở hữu dữ liệu thanh toán, không query database orders. Adapter PayOS dùng chung nằm trong `/backend/src/BuildingBlocks/Payments`. Dịch vụ xác minh trực tiếp qua API PayOS khi người dùng quay lại hoặc kiểm tra thanh toán; không phụ thuộc webhook của đơn hàng legacy và không tin query `status`/`code` trên trình duyệt.
- Bảng giá backend đọc `/api-specs/card-prices.json`; frontend có bản sao tại `/frontend/src/data/card-prices.json`, được test kiểm tra khớp đầy đủ 54 mẫu. Khi đổi giá cần cập nhật cả hai file. Số tiền của một giao dịch đã tạo được lưu cố định. Chỉ mở khóa khi mã đơn, payment link ID, số tiền và trạng thái PAID khớp. Khi PayOS lỗi, hệ thống giữ bản nháp và không cấp link công khai.
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

Sau deploy: đăng nhập, tạo thiệp có ảnh/nhạc; xác nhận API publish trả 402 trước khi thanh toán. Mở checkout PayOS, kiểm tra đúng số tiền; hủy và thử lại; hoàn tất giao dịch thử được cho phép, quay lại và xuất bản, mở link ở cửa sổ ẩn danh. Sửa bản nháp và xác nhận link chưa đổi nội dung; cập nhật bản công khai; thu hồi và xác nhận link/media không dùng ở thiệp khác trả 404. Bộ test tự động dùng provider giả lập; không thực hiện giao dịch tiền thật.

Khi thay fields trong catalog, cập nhật `api-specs/card-fields.json`; test frontend kiểm tra đồng bộ toàn bộ 54 schema.
