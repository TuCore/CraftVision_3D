# CraftVision 3D — Gate đề xuất trước khi dựng deck

## 1. Communication contract

- **Audience giả định:** giảng viên/hội đồng EXE201 và người đánh giá MVP.
- **Mục tiêu:** báo cáo kết quả MVP, chứng minh sản phẩm đang hoạt động, trình bày giới hạn dữ liệu và đề xuất ưu tiên tiếp theo.
- **Thời lượng giả định:** 8–10 phút, khoảng 10–11 slide.
- **Ngôn ngữ:** slide và speaker notes bằng tiếng Việt.
- **Deliverables sau khi duyệt gate:**
  - `slide/deck_content_and_speaker_notes.md`.
  - File PPTX 16:9.
  - Thư mục ảnh chụp đã chọn và crop cho slide.
  - Speaker notes có nguồn cho từng claim định lượng và từng ảnh.
- **Nguyên tắc bằng chứng:** số liệu trong hai tài liệu do nhóm cung cấp được xem là nguồn nội bộ; ảnh live chỉ chứng minh giao diện/tính năng, không tự chứng minh doanh thu hay chuyển đổi.

## 2. Narrative đề xuất

**Luận điểm trung tâm:** CraftVision 3D đã ghép quà handmade, cá nhân hóa bằng AI và thiệp 3D/NFC thành một hành trình phygital hoàn chỉnh; MVP cho thấy nhu cầu mua thực tế và mức tương tác ban đầu, nhưng dữ liệu vận hành còn phân tán và chưa đủ để kết luận lợi nhuận.

Mạch kể:

1. Sinh viên muốn quà có ý nghĩa nhưng bị giới hạn bởi ý tưởng, kỹ năng, thời gian và ngân sách.
2. CraftVision 3D kết nối quà vật lý với trải nghiệm số để giải quyết cùng một hành trình tặng quà.
3. MVP đã triển khai đủ các bước chính: khám phá, cá nhân hóa, mua, chạm NFC/QR và xem thiệp 3D.
4. Kết quả ban đầu cho thấy giao dịch đa kênh và tương tác lặp lại với quà NFC.
5. Bằng chứng còn giới hạn bởi dữ liệu thủ công, chênh lệch số liệu giữa các bảng và chưa có chi phí để tính lợi nhuận.
6. Giai đoạn tiếp theo tập trung vào hợp nhất dữ liệu, hoàn tất đơn hàng, kiểm chứng trải nghiệm và đo unit economics.

## 3. Page jobs và cấu trúc deck

| Slide | Title dự kiến | Page job | Evidence/visual chính |
|---:|---|---|---|
| 1 | CraftVision 3D — Kết quả MVP | Đặt bối cảnh báo cáo và nhận diện sản phẩm | Hero hệ thống, tối giản |
| 2 | Người dùng mục tiêu | Làm rõ nhóm 18–22 tuổi, nhu cầu và giới hạn ngân sách | Persona minh họa + 4 pain points |
| 3 | Mô hình quà tặng phygital | Giải thích cách handmade, AI, thiệp 3D và NFC tạo thành một giải pháp | Sơ đồ native/editable |
| 4 | Phạm vi MVP | Cho thấy những gì đã được đưa vào thử nghiệm | 16 sản phẩm active, thiệp 3D, NFC; ảnh thư viện thiệp |
| 5 | Hành trình trải nghiệm | Chứng minh luồng từ chọn mẫu đến mở quà số | Gallery → editor → NFC/QR → cảnh 3D |
| 6 | Kết quả MVP | Tóm tắt các chỉ số trọng yếu mà không trộn phạm vi | 31 tài khoản, 33 đơn, 61 đơn vị + 1 quà, GMV và tiền đã thu |
| 7 | Hiệu quả theo kênh | So sánh đóng góp đơn hàng, GMV và trạng thái thanh toán | Biểu đồ cột + bảng rút gọn native |
| 8 | Sản phẩm dẫn đầu | Chỉ ra nhóm sản phẩm tạo doanh thu chính | Custom iron-on keychains: VND 565,000, 35.4% GMV |
| 9 | Tương tác NFC | Trình bày mức sử dụng ban đầu của quà thông minh | 6 tag assigned, 35 scans, 5.83 scans/tag |
| 10 | Sáu tuần triển khai | Nối tiến độ đội nhóm với các mốc MVP | Timeline/Gantt native từ ClickUp; đang chờ nguồn |
| 11 | Giới hạn và ưu tiên tiếp theo | Kết thúc bằng caveat và việc cần làm có thể kiểm chứng | Dữ liệu phân tán, VND 445,000 pending, chưa có unit economics |

## 4. Template đề xuất

### Hướng thiết kế được chọn: **CraftVision Editorial Phygital**

- Tỉ lệ 16:9, bố cục editorial có một điểm nhìn chính trên mỗi slide.
- Nền chính luân phiên:
  - Plum đậm cho cover, solution và 3D/NFC.
  - Cream sáng cho persona, metrics, chart và next steps.
- Accent rose/coral dùng cho điểm nhấn; gold dùng tiết chế cho nhãn và đường dẫn thị giác.
- Plus Jakarta Sans cho heading, Inter cho body.
- Hình ảnh lớn, crop sạch; tối đa một ảnh hero hoặc một cụm evidence có chủ đích trên mỗi slide.
- Không dùng dashboard/card grid làm phong cách mặc định.
- Chart, table, customer journey và Gantt được dựng native/editable.
- Speaker notes chứa lời thuyết trình và nguồn; slide chỉ giữ nội dung cần nhìn.

### Brand source

- `frontend/src/app/globals.css`.
- `frontend/src/app/home/page.tsx`.
- Giao diện live tại `https://craft-vision-3d.vercel.app` được chụp ngày 23/10/2026.

### Palette

| Vai trò | Màu |
|---|---|
| Dark background | `#12050E`, `#240A1B`, `#2B1023` |
| Primary accent | `#FDA4AF`, `#FFD0D7`, `#FF6B73` |
| Warm accent | `#F0A860`, `#F5CF7A` |
| Light background | `#FFF9ED` |
| Dark text | `#3D1B16`, `#4A0B19` |

## 5. Ảnh đã chụp và đề xuất sử dụng

| File | Trạng thái | Vai trò dự kiến |
|---|---|---|
| `screenshots/01-home-hero.jpg` | Dùng | Cover hoặc slide giải pháp |
| `screenshots/04-card-gallery.jpg` | Dùng | Phạm vi MVP, website đang hiển thị 55 mẫu |
| `screenshots/06-3d-greeting-experience.jpg` | Dùng chọn lọc | Trạng thái mở phong thư |
| `screenshots/07-3d-card-opened.jpg` | Dùng | Bằng chứng trải nghiệm 3D hoạt động |
| `screenshots/08-card-editor.jpg` | Dùng | Bằng chứng cá nhân hóa nội dung và preview |
| `screenshots/02-shop-catalog.jpg` | Không dùng | Trang cửa hàng đang không trả dữ liệu sản phẩm |
| `screenshots/03-ai-assistant.jpg` | Không dùng | Vision Plus chuyển sang màn hình đăng nhập, không chứng minh trải nghiệm AI sau đăng nhập |
| `screenshots/05-card-3d-demo.jpg` | Dự phòng | Khung demo có vùng preview trống ở thời điểm chụp |

## 6. Caveat dữ liệu cần giữ hoặc xác minh

1. Phần tổng quan ghi `9` đơn online và `VND 270,000`; bảng theo kênh ghi `8` đơn website và `VND 205,000`.
2. Tài liệu ghi `54` mẫu thiệp tại kỳ báo cáo; website hiển thị `55` mẫu vào ngày 23/10/2026. Đề xuất ghi hai snapshot thời gian riêng, không coi đây là lỗi nếu có một mẫu được bổ sung sau kỳ đo.
3. `VND 1,595,000` là merchandise GMV; `VND 49,000` là payment value của thiệp 3D độc lập; tổng combined GMV là `VND 1,644,000`.
4. `VND 1,199,000` là tiền đã thu theo tài liệu, không phải lợi nhuận.
5. Chưa có dữ liệu chi phí vật liệu, lao động, đóng gói và vận hành nên chưa thể kết luận margin hoặc profitability.
6. Persona Linh là persona minh họa, không phải hồ sơ người dùng đã phỏng vấn.
7. Chưa có nguồn ClickUp/Gantt sáu tuần và chưa có số lượt truy cập website đáng tin cậy trong hai tài liệu.

## 7. Gate cần xác nhận

Vui lòng xác nhận:

- Communication contract và thời lượng 8–10 phút.
- Narrative và cấu trúc 11 slide.
- Template `CraftVision Editorial Phygital` và palette plum–rose–gold–cream.
- Cách xử lý chênh lệch `54`/`55` mẫu thiệp theo hai thời điểm.
- Số đúng cho đơn online và online GMV: `9 / VND 270,000` hay `8 / VND 205,000`.
- Cung cấp link/export/ảnh ClickUp cho Gantt sáu tuần và dữ liệu website traffic nếu muốn đưa hai phần này vào deck.

Sau khi gate được duyệt, mới tiếp tục viết nội dung slide hoàn chỉnh, speaker notes và dựng PPTX.
