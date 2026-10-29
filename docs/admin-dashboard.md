# Dashboard quản trị

Mở `/admin/dashboard` bằng tài khoản có role Admin. `/admin` và đường dẫn quản lý nhạc cũ `/admin/music` chuyển đến dashboard. Nhạc nền phía khách hàng vẫn hoạt động theo cấu hình hiện có; chỉ giao diện quản lý nhạc được bỏ khỏi admin.

## Cách tính

- Doanh thu đã thu = tiền hàng thu thành công − tiền hàng đã xác nhận hoàn toàn bộ trong kỳ. Phí giao hàng được thống kê riêng. Đây không phải lợi nhuận.
- Đơn phát sinh tính theo ngày tạo đơn. Đơn đã thanh toán, khách mua và số lượng bán tính theo ngày thu tiền. Đơn thiệp số được đồng bộ vào commerce sau khi thanh toán; không đại diện cho các phiên thanh toán bỏ dở.
- Thời điểm thu/hoàn mới là lúc hệ thống xác nhận giao dịch; không suy diễn giờ giao dịch ngân hàng nếu nguồn thanh toán chưa cung cấp thời điểm đó.
- Một đơn thiệp số tính một thiệp, không phụ thuộc `OrderItems`. Không cộng thêm số tiền từ database Cards vào doanh thu commerce.
- Lưu snapshot giá trị, tên và số lượng khi thu tiền. Đổi tên/giá hoặc ngừng bán sản phẩm không đổi báo cáo cũ. Hoàn tiền dùng snapshot khoản thu gốc; số lượng bán và số lượng hoàn hiển thị riêng. Hiện chỉ có xác nhận hoàn toàn bộ, không tự thực hiện hoàn tiền qua ngân hàng/PayOS.
- Đơn đã thu rồi bị hủy vẫn nằm trong tiền đã thu cho đến khi admin xác nhận đã hoàn tiền. Không được đổi khoản đã thu/hoàn về chưa thanh toán. Endpoint giả lập thanh toán chỉ dành cho Admin trong Development.
- Lưu trữ đơn qua thao tác cũ DELETE chỉ ẩn khỏi danh sách admin, không xóa lịch sử, đổi trạng thái xử lý hay hoàn kho. Các báo cáo vẫn tính đơn đã lưu trữ.
- Bộ lọc ngày bao gồm cả ngày đầu/cuối theo giờ Việt Nam. Lưu UTC trong database và truy vấn khoảng nửa mở `[start, end)`. Giới hạn 366 ngày. So sánh với kỳ liền trước cùng số ngày; kỳ có hôm nay có thể chưa kết thúc.
- Báo cáo hệ thống là số liệu hiện tại, độc lập loại đơn/phương thức thanh toán. Khách mới là khách đang hoạt động được tạo trong khoảng ngày chọn. Sản phẩm là sản phẩm có `IsActive`; tồn kho chỉ tính loại có sẵn.

## Dữ liệu cũ và triển khai

Migration mới `AddAdminRevenueReporting` thêm sổ `order_financial_events`, snapshot `order_financial_lines`, thời điểm thanh toán/hoàn tiền và cờ lưu trữ. Không thay đổi migration đã áp dụng hoặc xóa dữ liệu phụ thuộc FK. SQL backfill được nhúng từ `databases/Reporting/001_backfill_financial_history.sql`.

Ngày thanh toán của thiệp số cũ lấy từ thời điểm mua đã được đồng bộ. Đơn sản phẩm cũ không có ngày thu/hoàn xác thực được giữ `null`, hiện ở cảnh báo lịch sử chưa đầy đủ và không được gán tùy ý vào kỳ hoặc file CSV. Những đơn đã bị xóa trước nâng cấp không thể khôi phục từ dữ liệu hiện tại. Tên hàng ở snapshot backfill là tên còn lưu lúc nâng cấp, còn số tiền và số lượng lấy từ đơn gốc.

Deploy backend và frontend cùng phiên bản. Presentation chạy EF migration khi khởi động. Docker context là root repository, bao gồm thư mục `databases/Reporting`. Các truy vấn commerce được thực hiện trong Infrastructure của commerce; Gateway chỉ lấy tồn lượng thiệp qua CardService thuộc database Cards. Nếu Cards chưa cấu hình, phần này báo chưa khả dụng, không hiển thị số 0 giả.

Ngưỡng tồn kho mặc định là 5 cho từng sản phẩm. Mở chi tiết “Sản phẩm đang bán” hoặc “Sản phẩm sắp hết hàng” để chỉnh riêng từng sản phẩm, kể cả ngưỡng 0. Ngưỡng NFC mặc định 10, có thể cấu hình `Reporting__NfcLowStockThreshold` trên backend.

## Kiểm thử

```powershell
$env:REPORTING_TEST_CONNECTION = '<disposable local PostgreSQL connection>'
dotnet test backend/src/CraftVision.Infrastructure.Tests --filter FullyQualifiedName~ReportingTests
dotnet build backend/src/CraftVision.Presentation
cd frontend
npm run test:dashboard
npx tsc --noEmit
npm run build -- --webpack
```

Integration test tạo schema riêng trong database test, dựng schema commerce trước nâng cấp với dữ liệu cũ, chạy migration thực tế rồi kiểm tra thu/hoàn/lưu trữ, snapshot, phân trang, múi giờ, phân quyền, tổng biểu đồ và CSV. Chỉ bỏ các embedding/index AI không liên quan trong baseline test để PostgreSQL local không cần pgvector. Không dùng database production cho test. CSV dùng UTF-8 BOM và vô hiệu hóa ô có thể bị Excel coi là công thức.
