# Bộ mẫu thiệp 3D và chia sẻ công khai

## Các đường dẫn

- `/cards`: 54 mẫu, tìm kiếm, lọc theo 9 nhóm dịp, demo trong điện thoại.
- `/cards/[slug]/edit`: input riêng theo mẫu, ảnh, album, danh sách kỷ niệm, nhạc, màu và phong thư.
- `/love-gift/[slug]`: trải nghiệm toàn màn hình với dữ liệu mẫu.
- `/love-gift/[slug]?draft=1`: xem bản nháp lưu trên thiết bị hiện tại.
- `/love-gift/[slug]?preview=1`: chế độ nhúng trong điện thoại.
- `/love-gift/[slug]?artwork=1`: cảnh tĩnh ở trạng thái hoàn thành, dùng chụp ảnh đại diện.
- `/love-gift`: giữ nguyên thiệp hoa hồng đã triển khai trước đó.
- `/cards/mine`: thiệp đã lưu trên tài khoản.
- `/love-gift/s/[token]`: bản công khai đã xuất bản, người nhận không cần đăng nhập.

## Luồng sử dụng

1. Chọn mẫu và mở **Cá nhân hóa**.
2. Sửa lời chúc/ảnh, các chi tiết riêng của mẫu, phong thư và màu.
3. **Lưu & xem thử** để cập nhật khung điện thoại bằng bản nháp vừa lưu.
4. Mở toàn màn hình hoặc tải tệp `.craftcard.json` để sao lưu/chuyển thiết bị.
5. Trên thiết bị khác, mở đúng mẫu trong trình chỉnh sửa và nhập tệp.

Bản nháp nằm trong IndexedDB của trình duyệt. Link `?draft=1` không truyền dữ liệu sang thiết bị khác và không phải link chia sẻ công khai. Nếu không tìm thấy bản nháp, giao diện thông báo rõ rồi hiển thị bản mẫu.

## Cấu trúc

- `catalog.ts`: nguồn cấu hình 54 mẫu; slug, dịp, nội dung mẫu, model, thao tác, input và kiểm tra dữ liệu.
- `models.ts`: model Three.js dạng cách điệu và chuyển động theo tiến trình. Các mẫu dùng chung các khối hình cơ bản nhưng có tổ hợp/cảnh riêng.
- `CardScene.tsx`: vòng render, ánh sáng, điều khiển xoay, phong thư 3D, thu hồi tài nguyên GPU, phương án khi WebGL không khả dụng.
- `CardExperience.tsx`: trạng thái bắt đầu → tương tác → kết quả → phong thư → đọc thư; album, nhạc do người dùng chọn và phát lại.
- `CardEditor.tsx`: biểu mẫu có schema, danh sách có thể sắp xếp, kiểm tra dữ liệu và preview sau khi lưu.
- `storage.ts`: IndexedDB, nhập/xuất theo phiên bản, giới hạn định dạng/dung lượng ảnh và nhạc.
- `legacy.ts`: ánh xạ ID cửa hàng hiện tại sang cảnh phù hợp; không đổi ID và giá cũ.
- `public/cards/previews`: 54 ảnh WebP được chụp từ model thật.

## Phạm vi và giới hạn

Đã có backend lưu bản nháp, upload media, thanh toán QR qua PayOS và xuất bản/cập nhật/thu hồi link. Bản nháp và xem thử miễn phí; link công khai yêu cầu backend xác nhận thanh toán riêng cho thiệp. Xem cấu hình và cách dùng trong [hướng dẫn triển khai](../../../../docs/card-sharing-deployment.md). Chưa có mật khẩu truy cập hay hẹn giờ gửi.

Model dùng hình học procedural, chưa đạt mức tài sản 3D chân thực. Tương tác có ba kiểu: chạm theo bước, kéo thanh điều khiển và giữ; có nút thay thế cho bàn phím. Một số chi tiết trong ý tưởng ban đầu (ví dụ kéo thả từng vật đúng vị trí, nhân vật diễn xuất, đường ray nhiều ga và âm thanh môi trường riêng) cần tiếp tục trau chuốt. Dữ liệu riêng được đưa vào nhãn trên model ở các vị trí được hỗ trợ và phần kỷ niệm trong thư; không phải mọi trường đều biến đổi hình học 3D.

Ảnh được thu nhỏ tối đa 1000 px trước khi lưu, giữ nguyên nội dung ảnh; chưa có giao diện crop từng ảnh. Nhạc nhận MP3/WAV/OGG tối đa 8 MB, chỉ phát sau tương tác của người nhận. Chưa tích hợp dịch tự động hay sinh lời chúc AI. Nội dung gợi ý bằng tiếng Việt.

## Kiểm tra

```sh
npm run test:cards
npx tsc --noEmit
npx eslint src/features/cards src/app/cards 'src/app/love-gift/[slug]'
npm run build
```

Kiểm tra trình duyệt: mọi slug phải hiện canvas, đi tới phong thư, đọc/đóng thư và phát lại; bản nháp phải giữ đúng người nhận sau tải lại; demo trong iframe phải không điều hướng khung điện thoại sang trang chủ. Kiểm tra desktop và mobile, giảm chuyển động, nhập file không hợp lệ và tải ảnh/nhạc.

Hợp đồng API nằm trong `/api-specs/card-sharing.yaml`; frontend chỉ gọi qua Gateway.
