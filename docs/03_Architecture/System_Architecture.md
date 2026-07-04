# CraftVision 3D - System Architecture

## 1. Tổng quan hệ thống (System Overview)
CraftVision 3D được thiết kế theo kiến trúc **Microservices** (Vi dịch vụ) kết hợp với mô hình **Monorepo** để quản lý toàn bộ mã nguồn (Frontend, Backend, Infrastructure, Config) trong một repository duy nhất. Điều này giúp tối ưu hóa việc quản lý version, CI/CD và đồng bộ hóa các API contract.

Mục tiêu của kiến trúc này là đảm bảo:
- **Khả năng mở rộng (Scalability):** Dễ dàng scale từng service độc lập (vd: AI service cần nhiều GPU, Core service cần nhiều CPU).
- **Tính bảo trì (Maintainability):** Phân tách rõ ràng trách nhiệm (Separation of Concerns).
- **Triển khai độc lập (Independent Deployability):** Frontend và các Backend services có thể được deploy riêng biệt mà không ảnh hưởng tới toàn hệ thống.

---

## 2. Các thành phần chính (Core Components)

### 2.1. Frontend (Client-side)
- **Công nghệ:** Next.js (React Framework).
- **Vai trò:** Cung cấp giao diện người dùng (UI) tương tác, xử lý hiển thị các mô hình 3D (ví dụ thông qua Three.js/WebGL), giao tiếp với Backend thông qua API Gateway.
- **Thư mục:** `/frontend`

### 2.2. Backend (Server-side & Microservices)
Backend được xây dựng trên nền tảng **.NET** (C#) theo chuẩn Clean Architecture và phân chia thành các Microservices:

- **API Gateway (`/backend/src/Gateway`):**
  - Đóng vai trò là cổng giao tiếp duy nhất (Single Entry Point) cho mọi request từ Frontend.
  - Xử lý Routing, Authentication (Xác thực), Authorization (Phân quyền), Rate Limiting (Giới hạn request).
  - Có thể sử dụng **Ocelot** hoặc **YARP**.

- **Core Service (`/backend/src/Services/Core.API`):**
  - Quản lý các nghiệp vụ cốt lõi: Người dùng (Users), Dự án (Projects), Quản lý metadata của file 3D, v.v.
  - Giao tiếp với database chính (PostgreSQL/SQL Server).

- **AI Service (`/backend/src/Services/AI.API`):**
  - Xử lý các tác vụ nặng liên quan đến Trí tuệ nhân tạo (vd: generate model 3D, nhận diện hình ảnh).
  - Có thể giao tiếp với các model AI hoặc external AI APIs (OpenAI, HuggingFace, ...).

- **Building Blocks (`/backend/src/BuildingBlocks`):**
  - Shared Kernel (Thư viện dùng chung) cho tất cả các microservices.
  - Chứa các cấu hình chung như Event Bus (RabbitMQ/Kafka integration), Exceptions handling, Base classes, v.v.

### 2.3. Hệ quản trị Cơ sở dữ liệu (Databases)
- Mỗi microservice sở hữu và quản lý database riêng biệt nhằm đảm bảo tính toàn vẹn và độc lập (Database-per-service pattern).
- **Thư mục:** `/databases/migrations` chứa các kịch bản khởi tạo và cập nhật schema (Entity Framework Core migrations hoặc các script SQL).

### 2.4. Observability (Giám sát & Log)
Nằm tại thư mục `/monitoring`.
- **Logging:** Tập trung log từ mọi service qua **Serilog**.
- **Metrics & Tracing:** Sử dụng **Prometheus** & **Grafana** (dashboards) hoặc **OpenTelemetry** để theo dõi hiệu năng hệ thống.
- **Health Checks:** Đảm bảo các services, databases và message brokers luôn trong trạng thái hoạt động tốt.

---

## 3. Giao tiếp giữa các Service (Inter-Service Communication)
- **Đồng bộ (Synchronous):** Sử dụng gRPC hoặc REST API (HTTP/HTTPS) thông qua Gateway.
- **Bất đồng bộ (Asynchronous):** Sử dụng Message Broker (RabbitMQ hoặc Apache Kafka) thông qua hệ thống Event Bus trong BuildingBlocks để truyền tải các domain events (vd: Khi upload xong file 3D, bắn event để AI service nhảy vào xử lý).

---

## 4. Kiến trúc Hạ tầng (Infrastructure & DevOps)
- **Containerization:** Mọi thành phần đều được Docker hóa. Cấu hình cục bộ nằm tại `docker-compose.yml` (chạy 1 lệnh là có toàn bộ môi trường).
- **CI/CD:** Sử dụng **GitHub Actions** (`/.github/workflows`) để tự động hóa quá trình test, build và deploy.
- **Infrastructure as Code (IaC):** Quản lý tài nguyên Cloud (AWS, Azure) thông qua **Terraform** (`/infrastructure/terraform`), giúp quá trình setup server có thể lặp lại và kiểm soát qua git.

---

## 5. API Contracts
- Nằm tại `/api-specs`.
- Sử dụng chuẩn **OpenAPI / Swagger**. Mọi API đều được thiết kế (design-first) tại đây trước khi implement ở Backend, đảm bảo Frontend team có tài liệu chính xác nhất để tích hợp.

---
*Tài liệu này là cái nhìn tổng quan về kiến trúc. Chi tiết về SDS (Software Design Specification) vui lòng xem tại thư mục `02_SDS/`.*
