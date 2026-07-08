# Báo cáo các lỗi đã gặp và cách khắc phục

Tài liệu này tổng hợp lại toàn bộ những lỗi phát sinh trong quá trình phát triển dự án CraftVision 3D, nguyên nhân gây ra lỗi và cách khắc phục tương ứng để làm tài liệu tham khảo sau này.

---

### 1. Lỗi Gemini không thể đọc được ảnh (Lỗi 404 Not Found)
- **Mô tả lỗi:** Backend báo lỗi `HttpRequestException: Response status code does not indicate success: 404 (Not Found)` khi Gemini cố gắng đọc ảnh được người dùng tải lên thông qua đường hầm Cloudflare Tunnel.
- **Nguyên nhân:** Next.js proxy đóng vai trò làm cổng giao tiếp, nó đã chuyển tiếp (rewrite) các đường dẫn `/api/*` về Backend, nhưng lại bỏ sót thư mục `/uploads/`. Do đó, khi Gemini truy cập đường link ảnh public từ thư mục uploads, Next.js không biết phải tìm ở đâu và trả về 404.
- **Cách khắc phục:** Sửa cấu hình `next.config.ts` ở Frontend, thêm luật chuyển tiếp cho thư mục `/uploads/:path*` trỏ thẳng về Backend.

### 2. Lỗi giao diện Settings không cập nhật Tên và Email
- **Mô tả lỗi:** Khi truy cập trang Settings, Tên và Email vẫn bị hardcode là "Nguyễn Minh" và "minh@craft.vn" dù đã lấy được dữ liệu chuẩn từ LocalStorage ở trong hàm `useEffect`.
- **Nguyên nhân:** Các ô chữ (Input) trong React sử dụng thuộc tính `defaultValue` chỉ nhận giá trị ở lần render (khởi tạo) đầu tiên. Khi `useEffect` lấy xong dữ liệu và cập nhật state, component không tự động cập nhật nội dung của ô Input.
- **Cách khắc phục:** Bổ sung thuộc tính `key={value}` vào các component `<Field />` trên giao diện, ép React phải hủy và khởi tạo lại ô Input mới kèm theo dữ liệu chính xác.

### 3. Cảnh báo Hydration Mismatch (Lỗi đỏ của React)
- **Mô tả lỗi:** Console của trình duyệt báo đỏ `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties` và chỉ ra sự khác biệt ở thuộc tính `__gcrremoteframetoken`.
- **Nguyên nhân:** Một số tiện ích mở rộng (Extension) của trình duyệt như Google Account hoặc chặn quảng cáo đã tự ý nhúng thêm đoạn mã vào thẻ `<html>` trước khi React (Next.js) kịp khởi động. Khi React đối chiếu với mã HTML trên Server thì thấy không khớp và báo lỗi.
- **Cách khắc phục:** Thêm thuộc tính `suppressHydrationWarning` vào thẻ `<html>` và `<body>` bên trong file `app/layout.tsx`. Lỗi này hoàn toàn vô hại.

### 4. Lỗi Google Sign-In: Trình duyệt không hỗ trợ (The browser is not supported)
- **Mô tả lỗi:** Console báo `[GSI_LOGGER]: The browser is not supported` và khung đăng nhập Google One-Tap không hiển thị.
- **Nguyên nhân:** Trang web đang được mở bằng trình duyệt ẩn danh chặn quá khắt khe (Brave), trình duyệt nhúng bên trong IDE, hoặc bị chặn cookie bên thứ 3. Hệ thống bảo mật của Google từ chối mở đăng nhập trên các trình duyệt không đủ tiêu chuẩn này.
- **Cách khắc phục:** Mở trang web bằng trình duyệt chuẩn (Chrome, Edge, Firefox, Safari) cài trên máy tính cá nhân.

### 5. Lỗi Google Sign-In: Cửa sổ Popup bị chặn (Failed to open popup window)
- **Mô tả lỗi:** Console báo `Failed to open popup window on url: ... Maybe blocked by the browser?`
- **Nguyên nhân:** Trình duyệt web có cài đặt chế độ chặn các cửa sổ bật lên (Pop-up blocker) để chống quảng cáo rác, khiến Google Sign-In không thể nhảy ra cửa sổ chọn tài khoản.
- **Cách khắc phục:** Cho phép hiển thị Cửa sổ bật lên (Pop-up and Redirects) trên thanh địa chỉ của trình duyệt cho trang web hiện tại.

### 6. Lỗi Google Sign-In: Cảnh báo FedCM get() rejects...
- **Mô tả lỗi:** Console báo `FedCM get() rejects with NotAllowedError` hoặc `AbortError`.
- **Nguyên nhân:** React đang ở chế độ Development (Strict Mode) nên tự động gọi khởi tạo Nút Đăng nhập 2 lần. Cả 2 yêu cầu cùng gọi Google API nên Google chủ động hủy cái thứ hai đi vì lý do bảo mật.
- **Cách khắc phục:** Đây là cảnh báo mặc định vô hại trong quá trình code. Lỗi sẽ tự động biến mất khi build code lên môi trường Production. Không cần sửa chữa gì thêm.

### 7. Lỗi Gemini AI Parse JSON (JsonReaderException)
- **Mô tả lỗi:** Visual Studio báo lỗi Backend ngừng hoạt động `Failed to parse JSON response from Gemini. Schema was likely violated.` kèm theo `Expected end of string, but instead reached end of data.` ở file `GeminiPlanGenerator.cs`.
- **Nguyên nhân:** Gemini sinh ra văn bản quá dài và chạm ngưỡng Token giới hạn, khiến đoạn mã JSON trả về bị cắt cụt giữa chừng. Kèm theo đó, Gemini có thể bọc thêm các ký tự markdown như ```json xung quanh chuỗi.
- **Cách khắc phục:** Tăng ngưỡng `MaxOutputTokens = 8192` trong cấu hình gửi đi, và bổ sung các dòng code xử lý chuỗi (Trim, Substring) để cắt bỏ hoàn toàn các thẻ Markdown rác trước khi Deserialize.

### 8. Lỗi Gemini Quá Tải (Lỗi 429 Too Many Requests)
- **Mô tả lỗi:** Hệ thống văng lỗi `Response status code does not indicate success: 429 (Too Many Requests)` khi tạo Plan/Suggestion.
- **Nguyên nhân:** Vượt quá giới hạn Request mỗi phút của gói API Gemini miễn phí.
- **Cách khắc phục:** Tạm dừng gửi yêu cầu và chờ 1-2 phút, hoặc nâng cấp tài khoản Google AI Studio sang hạng mức trả phí (Pay-as-you-go).

### 9. Lỗi trùng lặp dữ liệu Database (duplicate key value violates unique constraint)
- **Mô tả lỗi:** Backend ném ra lỗi `DbUpdateException` khi đăng nhập Google hoặc tạo tài khoản, nguyên nhân sâu xa là `23505: duplicate key value violates unique constraint "ix_users_email"`.
- **Nguyên nhân:** Lỗi Race Condition (Xung đột tài nguyên). Người dùng click đúp (ấn liên tục 2 lần) vào nút Đăng nhập/Đăng ký. Yêu cầu thứ nhất chưa kịp lưu vào DB thì yêu cầu thứ 2 đã được xử lý và nhảy vào bước `INSERT`, dẫn đến việc 2 yêu cầu cùng cố tạo một bản ghi có email giống hệt nhau.
- **Cách khắc phục:**
  - Frontend (`auth/page.tsx`): Thêm điều kiện `if (loading) return;` vào các hàm xử lý click để chặn ấn đúp chuột.
  - Backend (`AuthService.cs`): Bọc khối lệnh `SaveChangesAsync` bằng `try/catch` bắt lỗi `DbUpdateException` để xử lý êm ái thay vì văng exception đỏ màn hình.

### 10. Lỗi ChunkLoadError (Turbopack)
- **Mô tả lỗi:** Báo lỗi `unhandledRejection: ChunkLoadError: Failed to load chunk /_next/static/chunks...` trên màn hình trình duyệt.
- **Nguyên nhân:** Code Frontend bằng Next.js (Turbopack) được dịch và chia thành nhiều mảnh (chunk). Khi server khởi động lại hoặc file bị sửa nhiều, bộ nhớ đệm (cache) của trình duyệt giữ lại các đường dẫn cũ. Khi gọi các mảnh cũ không còn tồn tại nữa thì nó sẽ báo lỗi.
- **Cách khắc phục:** Hard Refresh trang web (`Ctrl + F5`) hoặc tắt Terminal Frontend đi chạy lại lệnh `npm run dev`.

### 11. Lỗi Google Sign-In: Sai đường dẫn Origin (The given origin is not allowed)
- **Mô tả lỗi:** Console báo `[GSI_LOGGER]: The given origin is not allowed for the given client ID.`
- **Nguyên nhân:** Đường link hiện tại bạn đang truy cập (ví dụ: link từ Cloudflare Tunnel mới tạo, hoặc link Ngrok) chưa được khai báo là "miền an toàn" trong thiết lập Client ID trên Google Cloud Console.
- **Cách khắc phục:** Đăng nhập vào Google Cloud Console -> Chọn mục Credentials -> Mở OAuth Client ID của bạn -> Thêm đường link hiện tại vào phần **Authorized JavaScript origins** và **Authorized redirect URIs** rồi nhấn Save.

### 12. Lỗi trình duyệt Zalo: zaloJSV2 is not defined
- **Mô tả lỗi:** Console báo `Uncaught ReferenceError: zaloJSV2 is not defined`.
- **Nguyên nhân:** Bạn đang mở đường link trang web trực tiếp ở bên trong ứng dụng chat Zalo trên điện thoại (Zalo In-App Browser). Trình duyệt của Zalo tự động chèn thêm đoạn mã `zaloJSV2` vào mọi trang web nhưng nó bị lỗi nội bộ.
- **Cách khắc phục:** Lỗi này hoàn toàn vô hại và do app Zalo gây ra, không liên quan đến code của bạn. Bạn nên bấm chọn "Mở bằng trình duyệt ngoài" (Safari/Chrome) khi nhận link qua Zalo.

### 13. Lỗi sập kết nối API Backend (ECONNRESET / socket hang up)
- **Mô tả lỗi:** Màn hình Frontend hoặc Terminal báo đỏ: `Failed to proxy http://localhost:5192/api/... Error: socket hang up` kèm theo mã lỗi `ECONNRESET`.
- **Nguyên nhân:** Frontend cố gắng chuyển tiếp yêu cầu (ví dụ: xin gợi ý quà tặng) sang cho Backend, nhưng Backend đột nhiên "bốc hơi" (bị mất kết nối) giữa chừng. Thường do bạn lỡ tay ấn Stop (Tắt) Backend trên Visual Studio, hoặc đoạn code Backend ném ra một lỗi cực kỳ nghiêm trọng khiến máy chủ Kestrel tự động sập (Crash).
- **Cách khắc phục:** Mở Visual Studio lên kiểm tra xem có dòng lỗi đỏ nào báo dừng chương trình không, sau đó nhấn **Stop** và **Play** để khởi động lại máy chủ Backend.

---
*Ghi chú: Tài liệu này được AI tự động tổng hợp từ nhật ký debug để phục vụ cho việc bảo trì dự án trong tương lai.*
