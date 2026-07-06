# Cấu trúc Thư mục và Kiến trúc Dự án CraftVision 3D

Tài liệu này mô tả chi tiết sơ đồ tổ chức thư mục của toàn bộ dự án **CraftVision 3D**, theo chuẩn Monorepo và Clean Architecture kết hợp Microservices. 

---

## 🌳 Sơ đồ Tổng quan (Monorepo Root)

Dưới đây là cấu trúc các thư mục và file nằm ở tầng ngoài cùng của dự án (Root level):

```text
CraftVision_3D/
├── .agents/              # Cấu hình quy tắc cho AI Agents
├── .github/              # Cấu hình DevOps (CI/CD) và Git
├── api-specs/            # Hợp đồng API (OpenAPI/Swagger)
├── assets/               # Tài nguyên thô (3D, UI/UX)
├── backend/              # Mã nguồn Backend (.NET Microservices)
├── databases/            # Script và dữ liệu liên quan đến DB
├── docs/                 # Tài liệu kỹ thuật dự án
├── frontend/             # Mã nguồn Frontend (Next.js/React)
├── infrastructure/       # IaC - Infrastructure as Code (Terraform)
├── monitoring/           # Cấu hình giám sát hệ thống (Grafana/Serilog)
├── prototypes/           # Nơi chứa các bản demo, POC tạm thời
├── scripts/              # Chứa các script tiện ích (.bat, .ps1, .sh)
├── docker-compose.yml    # File khởi chạy toàn bộ môi trường local
├── .gitignore            # Khai báo các file/thư mục không đưa lên Git
└── README.md             # File giới thiệu tổng quan dự án
```

---

## 🔍 Chi tiết từng thành phần

### 1. `/.agents/`
- **Tác dụng:** Nơi lưu trữ các quy định, luật lệ dành cho AI (như GitHub Copilot, Cursor, Gemini) khi tham gia hỗ trợ code.
- **File nổi bật:**
  - `AGENTS.md`: Chứa các quy tắc ép buộc AI phải tuân thủ Clean Architecture, không được viết lẫn lộn code Frontend và Backend, giữ kỷ luật Monorepo.

### 2. `/.github/`
- **Tác dụng:** Chứa cấu hình quản lý mã nguồn và CI/CD (Continuous Integration / Continuous Deployment) của GitHub.
- **Bên trong:**
  - `workflows/`: Chứa các pipelines tự động hóa:
    - `ci-backend.yml`: Tự động Build & Test backend C# khi có mã nguồn mới.
    - `ci-frontend.yml`: Tự động Linter & Build frontend Next.js.
    - `cd-docker.yml`: Tự động build Docker Image và đẩy (deploy) lên Docker Hub/Cloud khi merge vào nhánh chính.
  - `PULL_REQUEST_TEMPLATE.md`: Biểu mẫu bắt buộc developer phải điền (Checklist kiểm tra API, Database, Testing) trước khi xin gộp code.
  - `dependabot.yml`: Bot tự động quét lỗ hổng và cập nhật các thư viện cũ (NPM, NuGet) hàng tuần.
  - `CODEOWNERS`: Quy định người chịu trách nhiệm review code (Ví dụ: sửa code backend thì Backend Team phải kiểm duyệt).

### 3. `/api-specs/`
- **Tác dụng:** Nơi áp dụng nguyên tắc **API-First Design**. Chứa các file đặc tả API (ví dụ: `openapi.yaml`, `swagger.json`). Mọi thiết kế API giữa Frontend và Backend phải được thống nhất ở đây trước khi code.

### 4. `/assets/`
- **Tác dụng:** Chứa các tài nguyên thiết kế thô.
- **Bên trong:**
  - `3d-models/`: Chứa các file 3D gốc (GLTF, FBX, OBJ).
  - `ui-ux/`: Chứa các bản thiết kế Figma, Mockups đồ họa.

### 5. `/backend/` (Khối lõi .NET - Clean Architecture)
- **Tác dụng:** Nơi chứa toàn bộ mã nguồn xử lý logic hệ thống, tương tác cơ sở dữ liệu. Dự án áp dụng chặt chẽ mô hình **Clean Architecture**.
- **Lộ trình và Luồng viết code (Từ trong ra ngoài):** `Domain` -> `Application (Interfaces)` -> `Infrastructure (Implementations)` -> `Application (Services)` -> `Presentation (Controllers)`.
- **Bên trong:**
  - `tests/`: Nơi chứa mã kiểm thử (Unit Test, Integration Test) độc lập.
  - `src/`: Nơi chứa mã nguồn thực thi:
    - `CraftVision.sln`: File Solution tổng hợp toàn bộ các project.
    
    #### 5.1. `CraftVision.Domain/` (Tầng Cốt Lõi)
    - **Tác dụng:** Chứa các đối tượng nghiệp vụ cốt lõi, hoàn toàn KHÔNG phụ thuộc vào bất kỳ thư viện hoặc framework nào (kể cả EF Core).
    - **Thành phần & Naming Convention:**
      - `Entities/`: Chứa các class đại diện cho các bảng trong CSDL. Ví dụ: `KnowledgeMaterial.cs`, `KnowledgeTutorial.cs`.
      - `Enums/`: Định nghĩa các kiểu dữ liệu Enum.

    #### 5.2. `CraftVision.Application/` (Tầng Ứng Dụng - Khai báo Hợp đồng & Logic)
    - **Tác dụng:** Tầng này **chỉ khai báo Interface** (hợp đồng) để các tầng ngoài implement, tuyệt đối không chứa logic gọi DB hay API ngoài. Chứa các quy tắc nghiệp vụ (Business Rules).
    - **Thành phần & Naming Convention:**
      - `Interfaces/Repositories/`: Nơi khai báo hợp đồng tương tác với DB. 
        - Lớp: `IKnowledgeMaterialRepository.cs` (Khai báo hàm thêm, sửa, tìm kiếm vector).
      - `Interfaces/Providers/`: Nơi khai báo hợp đồng tương tác với API bên thứ 3 (AI, Payment). 
        - Lớp: `IEmbeddingProvider.cs` (Khai báo hàm lấy Vector).
      - `Services/`: Nơi chứa Business Logic thực tế. Lớp này đứng giữa (Orchestrator), tiêm (inject) các Interface vào để hoàn thành 1 luồng công việc.
        - Lớp: `KnowledgeRetrievalService.cs` (Nhận text -> Gọi `IEmbeddingProvider` biến chữ thành vector -> Gọi `IKnowledgeMaterialRepository` chọc xuống DB tìm nguyên liệu giống vector đó -> Trả về kết quả).

    #### 5.3. `CraftVision.Infrastructure/` (Tầng Hạ Tầng - Triển khai thực tế)
    - **Tác dụng:** Nơi triển khai (Implement) các Interface đã khai báo ở tầng Application. Đây là nơi đụng trực tiếp tới Entity Framework Core, SQL, và gọi HTTP Request (kéo API Key Gemini/ChatGPT về).
    - **Thành phần & Naming Convention:**
      - `Data/`: Chứa cấu hình kết nối DB (`ApplicationDbContext.cs`).
      - `Repositories/`: Nơi viết code SQL/EF Core thực sự.
        - Lớp: `KnowledgeMaterialRepository.cs` (Implement `IKnowledgeMaterialRepository`, dùng EF Core gọi hàm `.CosineDistance()` của pgvector để tính toán vector).
      - `Providers/`: Nơi viết code gọi HTTP Client ra bên ngoài.
        - Lớp: `GeminiEmbeddingProvider.cs` (Implement `IEmbeddingProvider`, có tác dụng kéo API Key từ `appsettings.json` vào để call API thực tế của Google/OpenAI, lấy mảng vector trả về cho Service).

    #### 5.4. `CraftVision.Presentation/` (Tầng Giao Diện Web API)
    - **Tác dụng:** Nơi tiếp nhận Request từ Frontend (người dùng), điều hướng tới tầng Application, và trả về Response (JSON). Tầng này không chứa logic nghiệp vụ.
    - **Thành phần & Naming Convention:**
      - `Controllers/`: Chứa các Endpoints API.
        - Lớp: `KnowledgeBaseController.cs` (Nhận file JSON từ Admin, ném xuống `KnowledgeRetrievalService` để xử lý, sau đó trả HTTP 200 OK về cho Frontend).
      - `Program.cs` & `appsettings.json`: Nơi cấu hình khởi chạy server, tiêm (DI) các Service vào hệ thống, và lưu trữ các biến môi trường nhạy cảm (Database connection string, API Keys của Gemini/OpenAI).

    #### 5.5. Các thư mục khác
    - `Gateway/`: Cổng API duy nhất phân luồng request (Ocelot/YARP).
    - `BuildingBlocks/`: Thư viện dùng chung (Shared Kernel) cho các services.

### 6. `/databases/`
- **Tác dụng:** Lưu trữ cấu trúc CSDL và các script.
- **Bên trong:**
  - `migrations/`: Chứa lịch sử thay đổi cấu trúc bảng (Migration SQL scripts).

### 7. `/docs/`
- **Tác dụng:** Thư viện tài liệu của dự án.
- **Bên trong:**
  - `01_SRS/`: Đặc tả yêu cầu phần mềm.
  - `02_SDS/`: Đặc tả thiết kế phần mềm.
  - `03_Architecture/`: Chứa tài liệu thiết kế hệ thống (gồm cả tài liệu này).
  - Và các thư mục `04_UseCases`, `05_ERD`, `08_API`, `09_Deployment`.

### 8. `/frontend/`
- **Tác dụng:** Chứa mã nguồn giao diện tương tác phía người dùng (Client-side) dùng React / Next.js.
- Chịu trách nhiệm hiển thị không gian 3D (Three.js/WebGL) và kết nối tới Backend API.

### 9. `/infrastructure/`
- **Tác dụng:** Quản lý cấu trúc máy chủ, cloud (DevOps).
- **Bên trong:**
  - `terraform/`: Chứa các đoạn code tự động hóa thiết lập máy chủ trên Cloud (IaC - Infrastructure as Code).

### 10. `/monitoring/`
- **Tác dụng:** Cấu hình đo lường, giám sát hệ thống khi dự án chạy thực tế.
- **Bên trong:**
  - `dashboards/`: Cấu hình đồ thị Grafana, hệ thống Log tập trung (Serilog, ELK).

### 11. Các File Cấu Hình (Root Configs)
- **`docker-compose.yml`**: Chìa khóa để chạy hệ thống ở local. Bằng lệnh `docker-compose up`, hệ thống sẽ tự dựng DB, Caching, RabbitMQ, Backend, Frontend.
- **`.gitignore`**: Chặn không tải các thư mục rác hoặc dữ liệu nhạy cảm lên Git.
- **`README.md`**: Bộ mặt của dự án, giới thiệu chung để developer mới vào nắm được cách cài đặt.
