# Hướng dẫn sử dụng bộ công cụ API (API-First Design)

Dự án **CraftVision 3D** áp dụng triết lý API-First Design. Thư mục `/api-specs` không chỉ chứa tài liệu mà là một **Workspace tự động hóa**.

## 🚀 0. Cài đặt ban đầu
Để sử dụng được các "ma thuật" này, máy bạn cần có [Node.js](https://nodejs.org/).
Mở terminal, trỏ vào thư mục `/api-specs` và chạy:
```bash
cd api-specs
npm install
```

---

## 🎩 1. Tự động sinh Code Frontend (Auto Code Generation)
Công cụ sử dụng: **Orval**
- **Vấn đề:** Frontend phải viết tay các API Call rất mất thời gian và dễ sai type.
- **Giải pháp:** Chạy lệnh:
  ```bash
  npm run generate:frontend
  ```
- **Kết quả:** Orval sẽ đọc file `openapi.yaml`, sau đó tự động tạo ra thư mục `frontend/src/api/generated/` chứa 100% code TypeScript và **React Query Hooks** (ví dụ: `useLoginMutation`, `useGetProjects`). Frontend chỉ việc dùng ngay lập tức!

---

## 🎭 2. Dựng Server Giả (Mock Server)
Công cụ sử dụng: **Prism**
- **Vấn đề:** Frontend không thể code nếu Backend chưa code xong API và chưa có dữ liệu.
- **Giải pháp:** Chạy lệnh:
  ```bash
  npm run mock
  ```
- **Kết quả:** Một server ảo sẽ chạy ở `http://127.0.0.1:4010`. Khi Frontend gọi `GET http://127.0.0.1:4010/api/v1/projects`, Prism sẽ tự động đọc schema trong YAML và sinh ra dữ liệu JSON Fake trả về y như thật. Frontend và Backend giờ đây có thể code song song 100%.

---

## 👮 3. Tự động Test Hợp đồng (Contract Testing)
Công cụ sử dụng: **Dredd**
- **Vấn đề:** Làm sao biết Code C# Backend bạn vừa viết trả về đúng chuẩn JSON đã hứa trong `openapi.yaml`?
- **Giải pháp:** Chạy backend của bạn lên ở cổng 5000, sau đó chạy lệnh:
  ```bash
  npm run test:contract
  ```
- **Kết quả:** Dredd sẽ tự động phân tích `openapi.yaml`, gửi các HTTP Request tương ứng vào Backend của bạn, và đối chiếu xem các trường JSON trả về có đúng kiểu dữ liệu hay không. Trượt (Fail) nếu code Backend sai đặc tả.

---

## 🚪 4. Cấu hình API Gateway
Nằm trong thư mục `/api-specs/gateway-config/`.
- File `ocelot.json` được "biên dịch" từ các Routes trong OpenAPI.
- Thay vì Backend Team phải config tay các policy như *Chứng thực (Authentication)* hay *Giới hạn request (Rate Limiting)*, API Gateway (Ocelot) sẽ đọc file cấu hình này và tự động bảo vệ các API Services nằm phía sau nó.
