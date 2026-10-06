# Nhạc nền toàn website

## Sử dụng

1. Đăng nhập bằng tài khoản có **role Admin** và mở `/admin/music` (menu **Nhạc nền**).
2. Nhập tên bài, tải MP3/WAV/OGG tối đa 15 MiB hoặc nhập URL HTTPS trực tiếp tới file audio công khai. URL trang YouTube/Spotify không phải URL audio.
3. Chọn thứ tự phát và bật **Phát trên website**, rồi lưu. Có thể sửa tên, thay file/URL, thay thứ tự, tắt bài hoặc xóa với xác nhận.
4. Danh sách phát theo thứ tự tăng dần; các bài cùng thứ tự được sắp xếp ổn định theo ID. Hết danh sách sẽ lặp lại.
5. Người nghe dùng nút nhạc ở góc dưới bên trái để bật/tạm dừng, chuyển bài và chỉnh âm lượng. Nếu chưa có bài nào được bật, trình điều khiển được ẩn.

Trình phát đặt ở root layout và giữ nguyên một phần tử audio khi chuyển trang nội bộ, kể cả vào/ra khu vực admin hoặc sau đăng nhập. Việc đổi tên/thứ tự bài không đổi nguồn audio và không làm bài đang nghe phát lại. Khi admin xóa/tắt bài đang phát, trình phát chọn bài còn khả dụng; thay file của bài đang phát sẽ tải nguồn mới từ đầu.

Trình duyệt có thể chặn tự phát âm thanh trước tương tác đầu tiên. Website thử phát tự động, rồi thử lại khi người dùng tương tác hoặc nhấn **Bật nhạc nền**. Không thể bảo đảm có âm thanh ngay khi mở trang trên mọi trình duyệt. Xem [MDN autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

Lựa chọn tạm dừng và âm lượng được lưu trong localStorage. Vị trí bài được lưu trong sessionStorage của tab để tiếp tục sau tải lại trang khi trình duyệt cho phép. Tải lại toàn bộ trang hoặc sang website bên ngoài (ví dụ PayOS) vẫn ngắt âm thanh trong lúc chuyển tài liệu; đây không phải chuyển trang nội bộ. Dữ liệu trình duyệt chỉ lưu tùy chọn nghe, không phải danh sách nhạc của admin.

## Cấu hình triển khai

Tạo **database PostgreSQL riêng** cho dịch vụ Music, rồi cấu hình backend:

```text
ConnectionStrings__Music=Host=<host>;Port=5432;Database=<music-database>;Username=<music-user>;Password=<secret>;SSL Mode=Require
```

Không dùng database orders/users hoặc Cards. Tài khoản Music cần quyền tạo bảng/index cho lần khởi động đầu. File `databases/Music/001_initial.sql` là schema cộng thêm, chạy lặp lại an toàn; không thay đổi migration của hệ thống đơn hàng. File audio tải lên được lưu bằng `bytea` trong database Music, nên cần backup database này và dự trù dung lượng. Không lưu nhạc trên filesystem tạm của Render.

Nếu thiếu kết nối, playlist công khai trả `[]`, website vẫn hoạt động và admin nhận lỗi 503 có hướng dẫn cấu hình. Nếu database gặp lỗi, API trả 503; trình phát giữ bài đang tải được, không thông báo lỗi thay cho nội dung trang. Không có bài mẫu được tự động đưa lên production; admin thêm bài sau khi cấu hình.

Frontend gọi cùng origin `/api/music/*` qua Next.js rewrite đến Gateway hiện có. Giữ `NEXT_PUBLIC_API_URL` trỏ tới Gateway. Adapter `/backend/src/Gateway/MusicController.cs` được host Presentation compile giống CardSharing. Logic và DbContext riêng nằm trong `/backend/src/Services/Music`; không truy vấn bảng của dịch vụ khác.

Docker build dùng root repository làm context và `backend/Dockerfile`; Dockerfile đã copy schema Music vào build. Các giới hạn request của reverse proxy/nền tảng hosting có thể thấp hơn 15 MiB: nếu upload bị 413, dùng file nhỏ hơn hoặc URL audio HTTPS công khai. Gateway hỗ trợ byte ranges cho file tải lên. Các URL bên ngoài cần cho phép trình duyệt truy cập trực tiếp và có thời hạn đủ dài.

## Quyền và đồng bộ

- GET playlist và audio của bài đang bật không yêu cầu đăng nhập. POST/PUT/DELETE và GET danh sách quản trị bắt buộc JWT có role **Admin**, không dựa vào email ở frontend.
- Cập nhật/xóa phải gửi revision hiện tại; xung đột trả 409 và yêu cầu tải lại rồi mở lại bài để chỉnh sửa.
- Thay đổi trong tab admin cập nhật trình phát ngay sau khi lưu; tab khác lấy lại danh sách mỗi 60 giây khi đang hiển thị hoặc khi người dùng quay lại tab. Nếu một lần tải danh sách đang chạy, lần kế tiếp sẽ lấy thay đổi.
- Tắt/xóa ngăn yêu cầu audio mới; không thể thu hồi phần audio người nghe đã tải hoặc bộ nhớ đệm. URL audio bên ngoài vẫn do nhà cung cấp URL quản lý.
- Trình phát bỏ qua bài lỗi, dừng sau một lượt nếu tất cả bài đều lỗi, và cho phép thử lại bằng nút phát.

## Kiểm thử

```powershell
cd frontend
npm run test:music
npx tsc --noEmit
npx eslint src/features/music src/app/admin/music/page.tsx src/app/layout.tsx
npm run build
```

Tại root repository, cấu hình một PostgreSQL test riêng:

```powershell
$env:MUSIC_TEST_CONNECTION='Host=127.0.0.1;Port=<port>;Database=<test-database>;Username=<test-user>;Password=<test-password>'
dotnet test backend/src/Services/Music.Tests
dotnet build backend/src/CraftVision.Presentation
```

Test API tạo schema có tên ngẫu nhiên, kiểm tra xác thực/phân quyền, upload, byte ranges, sửa tên giữ URL, thay nguồn, revision conflict, bật/tắt, xóa và chạy schema lại trên dữ liệu có sẵn. Test chỉ xóa schema riêng do chính test tạo. Không chạy trên database production.

Kiểm tra trên trình duyệt sau triển khai: thêm hai bài; bật nhạc và chuyển qua cửa hàng, giỏ hàng, đăng nhập, admin; xác nhận vị trí phát tiếp tục. Thử tạm dừng rồi chuyển trang, sửa tên bài đang phát, tắt bài đó, xóa hết danh sách và mở trên điện thoại với autoplay bị chặn.
