# CraftVision 3D — Presentation Rules

## 1. Communication contract

- Audience mặc định: giảng viên, hội đồng EXE201 và các bên đánh giá MVP.
- Mục tiêu: trình bày vấn đề, giải pháp, bằng chứng sản phẩm, kết quả MVP, giới hạn và bước tiếp theo.
- Ngôn ngữ slide và thuyết trình: tiếng Việt; thuật ngữ sản phẩm có thể giữ tiếng Anh khi cần.
- Mỗi slide chỉ có một `page job`: một câu mô tả điều khán giả phải hiểu sau slide đó.
- Phân biệt rõ ba lớp bằng chứng:
  - Số liệu do nhóm tổng hợp.
  - Bằng chứng giao diện được chụp từ hệ thống.
  - Nhận định hoặc giả thuyết cần kiểm chứng thêm.
- Không biến ảnh giao diện thành bằng chứng cho số liệu kinh doanh nếu màn hình không trực tiếp hiển thị số liệu đó.

## 2. Nội dung và narrative

- Xây narrative và page job trước khi thiết kế layout.
- Trình tự mặc định: vấn đề khách hàng → giải pháp → phạm vi MVP → hành trình sử dụng → kết quả → caveat → bước tiếp theo.
- Title ngắn, cụ thể, mô tả đúng nội dung slide; không dùng khẩu hiệu chung chung.
- Không bỏ qua caveat làm thay đổi cách hiểu kết quả.
- Số liệu phải giữ nguyên đơn vị, kỳ đo, mẫu số và phạm vi so sánh.
- Phân biệt rõ:
  - Merchandise GMV và doanh thu thiệp 3D.
  - GMV, số tiền đã thu và lợi nhuận.
  - Đơn hàng website và đơn hàng tất cả kênh.
  - Số liệu tại kỳ báo cáo và trạng thái giao diện tại ngày chụp.
- Không tự suy diễn product-market fit, lợi nhuận hoặc tăng trưởng nếu chưa có baseline và dữ liệu kiểm chứng.
- Persona phải được ghi là persona minh họa nếu không dựa trên một người đã phỏng vấn.
- Mọi nguồn dữ liệu và ảnh chụp phải được ghi trong speaker notes của slide sử dụng nguồn đó.

## 3. Thiết kế theo nhận diện CraftVision 3D

- Tỉ lệ: 16:9 widescreen.
- Phong cách: tối giản, cao cấp, nhiều khoảng thở; ưu tiên một bố cục chính thay vì lưới card dày đặc.
- Nguồn nhận diện chính:
  - `frontend/src/app/globals.css`.
  - `frontend/src/app/home/page.tsx`.
  - Ảnh chụp hệ thống trong `slide/screenshots/`.
- Bảng màu đề xuất:
  - Plum nền đậm: `#12050E`, `#240A1B`, `#2B1023`.
  - Rose/coral nhấn: `#FDA4AF`, `#FFD0D7`, `#FF6B73`.
  - Gold ấm: `#F0A860`, `#F5CF7A`.
  - Cream nền sáng: `#FFF9ED`.
  - Chocolate chữ/nền phụ: `#3D1B16`, `#4A0B19`.
- Font ưu tiên: Plus Jakarta Sans cho title, Inter cho body; dùng font thay thế tương thích nếu máy thiếu font.
- Slide mở đầu và slide trải nghiệm 3D có thể dùng nền plum/ảnh toàn khung; slide dữ liệu ưu tiên nền cream để tăng khả năng đọc.
- Dùng ảnh giao diện thật làm hero hoặc evidence panel; không lặp lại cùng một ảnh giữa các slide.
- Không dùng ảnh giao diện bị lỗi tải, rỗng dữ liệu hoặc màn hình đăng nhập để chứng minh tính năng phía sau đăng nhập.
- Biểu đồ, bảng và sơ đồ phải native/editable trong PowerPoint.
- Không chụp ảnh bảng số liệu để thay cho bảng hoặc biểu đồ native.
- Tránh đoạn văn dài; speaker notes chứa phần diễn giải chi tiết.

## 4. Quy tắc ảnh chụp hệ thống

- Chỉ dùng ảnh do hệ thống thật hiển thị và ghi ngày chụp trong speaker notes.
- Không chỉnh sửa nội dung ảnh theo cách làm thay đổi bằng chứng; chỉ được crop, cân sáng hoặc che dữ liệu nhạy cảm.
- Mỗi ảnh có một mục đích: nhận diện, chứng minh hành trình, chứng minh tính năng hoặc minh họa kết quả.
- Ảnh có thông tin tài khoản, địa chỉ, số điện thoại, mã thanh toán hoặc dữ liệu khách hàng phải được che trước khi đưa vào deck.
- Ảnh chụp ngày khác kỳ báo cáo phải ghi chú rõ để tránh so sánh sai thời điểm.

## 5. Data integrity và caveat bắt buộc

- Không gộp các số liệu mâu thuẫn trước khi xác minh.
- Nếu chưa xác minh được, hiển thị caveat trong speaker notes và dùng cách diễn đạt trung tính trên slide.
- Dữ liệu hiện cần xác minh trước khi dựng deck cuối:
  - `9` đơn online và `VND 270,000` trong phần tổng quan so với `8` đơn website và `VND 205,000` trong bảng kênh.
  - `54` mẫu thiệp trong kỳ báo cáo so với `55` mẫu đang hiển thị trên website tại ngày chụp.
- Giữ nguyên `61 đơn vị bán + 1 quà tặng`; không diễn đạt thành 62 đơn vị bán.
- Không gọi `VND 1,199,000` là lợi nhuận. Đây là tiền đã thu theo tài liệu tổng hợp; chi phí chưa được khấu trừ.
- Không khẳng định conversion rate khi chưa có số lượt truy cập đủ tin cậy.

## 6. Quy trình có gate

1. Trình bày communication contract, narrative, page jobs và lựa chọn template.
2. Chờ người dùng xác nhận gate bắt buộc.
3. Sau khi gate được duyệt, hoàn thiện file Markdown gồm nội dung slide và speaker notes.
4. Dựng PPTX với chart, table và diagram native/editable.
5. Chạy content review, visual review và quality checker.
6. Sửa lỗi tràn chữ, chồng lấn, tương phản, sai nguồn và sai phạm vi số liệu.
7. Xuất PPTX cuối cùng và bàn giao cùng file Markdown, ảnh được sử dụng và danh sách caveat còn mở.

## 7. Definition of done

- Mỗi slide có page job rõ ràng và không trùng vai trò với slide khác.
- Mọi claim định lượng truy được về nguồn trong speaker notes.
- Không có ảnh lặp lại, ảnh lỗi hoặc ảnh chứa dữ liệu nhạy cảm chưa che.
- Biểu đồ, bảng và sơ đồ có thể chỉnh sửa trong PowerPoint.
- Deck giữ đúng tone plum–rose–gold–cream của hệ thống.
- PPTX qua visual review và quality checker; không có overflow hoặc overlap.

