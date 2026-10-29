# Kế hoạch thư viện hướng dẫn handmade và chatbot RAG

- Ngày lưu: 29/10/2026.
- Ngày dự kiến bắt đầu: 30/10/2026.
- Trạng thái: Đã chốt phạm vi với người dùng; chưa triển khai tính năng này.
- Cơ sở rà soát: Mã nguồn trong repository; chưa đối chiếu database production.

## 1. Các lựa chọn đã được người dùng xác nhận

| Hạng mục | Lựa chọn |
| --- | --- |
| Nguồn nội dung ban đầu | Chưa có; cần xây kho nội dung từ đầu |
| Nhóm sản phẩm ưu tiên | Hạt nhựa ủi và hoa kẽm nhung |
| Định dạng hướng dẫn | Video, bài hướng dẫn có ảnh và PDF tải xuống |
| Khi kho chưa có kết quả phù hợp | Tìm thêm trên Internet, ghi rõ nguồn chưa được admin duyệt |
| Quyền truy cập | Người dùng đã đăng nhập; miễn phí |
| Phạm vi đợt đầu | Bản gọn: admin quản lý nội dung, chatbot trả đúng video và bài có ảnh |

PDF cơ bản được giữ trong đợt đầu để đáp ứng lựa chọn định dạng. AI tự soạn tài liệu hoàn chỉnh và bố cục booklet riêng cho từng yêu cầu để giai đoạn sau.

## 2. Kết quả rà soát mã nguồn

- Giao diện chat khách hàng gọi `/api/gift-chat/suggestions`.
- Hệ thống đã có Gemini, embeddings, PostgreSQL/pgvector và dữ liệu nguyên liệu/hướng dẫn.
- `GeminiSuggestionGenerator.cs` đang gán `VideoUrl` thành link tìm kiếm YouTube; giao diện `frontend/src/app/chat/page.tsx` cũng ưu tiên link tìm kiếm. Cần sửa cả hai để giữ video cụ thể.
- `GenerateDetailedPlanCommand.cs` vẫn dùng `Mocked Suggestion`, chưa lấy đúng lựa chọn của người dùng.
- `databases/seed_data/tutorials.json` có 3 hướng dẫn, chưa phải bộ nội dung hoàn chỉnh và chưa xác minh tình trạng video thực tế.
- Bộ đọc seed trong `KnowledgeRetrievalService.cs` chưa ánh xạ tên trường snake_case như `video_url`, `estimated_minutes` sang thuộc tính C# tương ứng.
- `KnowledgeTutorialRepository.FindSimilarAsync` nhận nhưng chưa áp dụng `similarityThreshold`; cần đánh giá cả luồng `KnowledgeRepository` mà chatbot hiện sử dụng.
- Nội dung embedding còn sơ lược; cần thống nhất hai implementation embedding, model, số chiều và quy trình lập lại chỉ mục.
- Chưa có luồng hoàn chỉnh quản lý ảnh theo từng bước, xuất bản hướng dẫn và PDF cho tính năng này.
- Trang video dùng chung của thiệp phục vụ hướng dẫn sử dụng/thanh toán; thư viện handmade cần quản lý riêng.

## 3. Luồng khách hàng

1. Khách đăng nhập và nhập yêu cầu, ví dụ: “Tôi muốn làm móc khóa trái tim bằng hạt nhựa ủi”.
2. Chatbot xác định loại sản phẩm, nguyên liệu, kỹ thuật và các điều kiện khách nêu.
3. Nếu có liên kết sản phẩm với hướng dẫn phù hợp, ưu tiên liên kết đó; tiếp theo tìm theo từ khóa và ý nghĩa trong thư viện đã xuất bản.
4. Lọc và xếp hạng kết quả; không trả một hướng dẫn chỉ vì nó là kết quả gần nhất.
5. Nếu yêu cầu chưa rõ, hỏi thêm hoặc cho khách chọn mẫu.
6. Trả thẻ hướng dẫn gồm ảnh thành phẩm, mô tả, độ khó, thời gian, nguyên liệu và nguồn.
7. Cho phép mở video cụ thể, xem các bước có ảnh và tải PDF khi nội dung tương ứng đã sẵn sàng.
8. Khi kho nội bộ chưa có nội dung phù hợp, tìm thêm trên Internet theo mục 5.

Nhãn nội dung nội bộ: **Admin đã duyệt**. Việc tìm hướng dẫn không phụ thuộc tồn kho; gợi ý mua sản phẩm/nguyên liệu được xử lý riêng.

## 4. Màn hình quản trị “Hướng dẫn handmade”

- Danh sách, tìm kiếm và bộ lọc nhóm sản phẩm/trạng thái.
- Tạo, sửa, xem trước, lưu nháp, xuất bản và ngừng hiển thị.
- Trường dữ liệu: tên, tên gọi khác, nhóm sản phẩm, ảnh thành phẩm, mô tả, độ khó, thời gian, nguyên liệu và dụng cụ kèm số lượng.
- Video: URL/video ID cụ thể và thông tin nguồn.
- Từng bước: số thứ tự, nội dung, hình ảnh và chú thích.
- Liên kết sản phẩm: một sản phẩm có thể có nhiều hướng dẫn.
- Lưu nguồn tham khảo và phiên bản nội dung; dùng ảnh/nội dung có quyền sử dụng cho bài và PDF.
- Danh sách nguồn Internet được đề xuất để admin chọn biên tập thành nội dung nội bộ; kết quả tìm kiếm không tự động được duyệt.

## 5. Tìm kiếm Internet khi thiếu nội dung

- Chỉ gọi khi kết quả nội bộ chưa đủ phù hợp.
- Có thể dùng Gemini Google Search grounding để trả kết quả có dẫn nguồn; kiểm tra khả năng của model/cấu hình trước khi tích hợp.
- Hiển thị tên nguồn, liên kết và nhãn **Nguồn bên ngoài — chưa được admin duyệt**.
- Giữ URL từ kết quả thực tế; không cho AI tự tạo video ID hoặc đường dẫn tài liệu.
- Kiểm tra thông tin video khi có thể. Có thể sử dụng YouTube Data API để tra video ID; metadata không thay thế việc kiểm tra độ đúng của nội dung.
- Nếu tìm kiếm lỗi hoặc không có kết quả phù hợp, thông báo rõ và ghi nhận yêu cầu thiếu nội dung.
- Nguồn bên ngoài được giới thiệu bằng tóm tắt và liên kết; không tự chuyển toàn bộ bài/ảnh bên ngoài thành PDF của hệ thống.
- Có giới hạn lượt gọi và bộ nhớ đệm để kiểm soát chi phí; nội dung truy xuất là dữ liệu tham khảo, không phải chỉ dẫn điều khiển chatbot.

## 6. Dữ liệu và PDF

- Các nhóm dữ liệu dự kiến: hướng dẫn, nguyên liệu/dụng cụ, các bước, ảnh/tệp, liên kết sản phẩm, nguồn và phiên bản.
- Phản hồi AI dùng ID hợp lệ; backend lấy URL video, ảnh và tệp từ dữ liệu đã lưu.
- PDF dùng chung nội dung đã duyệt với bài trên website, gồm ảnh thành phẩm, nguyên liệu, các bước có ảnh và liên kết/QR mở video.
- Dùng mẫu bố cục cố định; tạo lại theo phiên bản nội dung thay vì gọi AI tạo tài liệu mỗi lần khách hỏi.
- Kiểm tra đăng nhập ở backend cho bài, API và PDF; không chỉ ẩn nút trên giao diện.
- Giữ Gemini và PostgreSQL/pgvector hiện có; chưa cần fine-tune ở đợt đầu.

## 7. Xây kho nội dung ban đầu

Đề xuất khởi đầu với 10 hướng dẫn: 5 mẫu hạt nhựa ủi và 5 mẫu hoa kẽm nhung. Đây là đề xuất số lượng, chưa phải bộ nội dung đã có hay cam kết thời gian hoàn thành.

- Hạt nhựa ủi: mẫu bố trí hạt, bảng màu, số lượng và ảnh từng công đoạn.
- Hoa kẽm nhung: số lượng nguyên liệu, ảnh tạo từng bộ phận và ảnh lắp ráp.
- Tìm nguồn, chuẩn bị ảnh và kiểm tra thao tác là phần công việc riêng cần thực hiện.
- Không xuất bản dữ liệu giả hoặc nội dung chưa đủ ảnh/các bước dưới nhãn đã duyệt.

## 8. Checklist triển khai

- [ ] Kiểm tra trạng thái Git và các thay đổi hiện có trước khi sửa mã.
- [ ] Thiết kế và ghi API mới trong `api-specs` trước khi triển khai backend.
- [ ] Sửa link video, mapping seed và luồng dùng dữ liệu giả lập.
- [ ] Thống nhất embedding, bổ sung ngưỡng phù hợp, lập chỉ mục cho nội dung thực.
- [ ] Thiết kế dữ liệu, API và phân quyền; dùng forward migration nếu cần thay đổi schema.
- [ ] Xây giao diện admin quản lý hướng dẫn và ảnh từng bước.
- [ ] Chuẩn bị, kiểm tra và xuất bản bộ nội dung ban đầu.
- [ ] Tích hợp kết quả hướng dẫn vào chatbot và trang đọc trên điện thoại/máy tính.
- [ ] Bổ sung PDF cơ bản theo phiên bản nội dung.
- [ ] Bổ sung tìm kiếm Internet, dẫn nguồn, bộ nhớ đệm và giới hạn lượt gọi.
- [ ] Kiểm thử truy xuất, link video, ảnh, PDF và quyền truy cập.

Mã frontend nằm trong `frontend/src`; backend tuân thủ cấu trúc Services/BuildingBlocks và Gateway của repository. Không sửa migration lịch sử; kiểm tra migration mới trên database có dữ liệu nếu phát sinh migration.

## 9. Tiêu chí nghiệm thu

- Tìm đúng hướng dẫn cho các mẫu đã có, bao gồm tên gọi khác và truy vấn có dấu/không dấu.
- Không nhầm hạt nhựa ủi với kỹ thuật hạt cườm hoặc hoa kẽm nhung với loại hoa dùng nguyên liệu khác.
- Giữ đúng video cụ thể; không đổi sang trang tìm kiếm khi đã có video.
- Bài có đủ nguyên liệu, các bước và ảnh cần thiết; PDF khớp phiên bản bài.
- Nguồn ngoài luôn có dẫn nguồn và nhãn chưa duyệt; không tự thành nội dung nội bộ đã xuất bản.
- Khi không tìm thấy hoặc dịch vụ tìm kiếm lỗi, trả trạng thái rõ ràng, không bịa nội dung có sẵn.
- Người chưa đăng nhập không truy cập được nội dung/tệp được bảo vệ bằng URL trực tiếp.
- Admin có thể ngừng hiển thị; nội dung đó không tiếp tục được chatbot giới thiệu như hướng dẫn đang xuất bản.

## 10. Tiếp tục công việc ngày mai

Có thể dùng yêu cầu sau:

> Hãy đọc `docs/handmade-ai-rag-plan.md` và triển khai kế hoạch đã chốt. Kiểm tra mã nguồn và trạng thái Git hiện tại trước, bắt đầu từ API spec, sửa luồng video/truy xuất rồi xây thư viện hướng dẫn admin. Phân biệt nội dung đã duyệt và nguồn Internet chưa duyệt; chỉ xuất bản hướng dẫn có nội dung thật.

## Tài liệu kỹ thuật đã tham khảo

- [pgvector: hybrid search](https://github.com/pgvector/pgvector#hybrid-search)
- [Gemini embeddings](https://ai.google.dev/gemini-api/docs/embeddings)
- [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Gemini grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search)
- [YouTube Data API: videos.list](https://developers.google.com/youtube/data/reference/rest/v3/videos/list)
