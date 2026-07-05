# Hướng dẫn Kết nối Database và Backend (C# .NET)

Tài liệu này hướng dẫn bạn cách khởi chạy Database PostgreSQL bằng Docker và kết nối nó với dự án Backend .NET bằng Entity Framework Core (EF Core).

## 1. Khởi chạy Database bằng Docker

Tại thư mục gốc của dự án `CraftVision_3D`, nơi chứa file `docker-compose.yml`, hãy chạy lệnh sau trong Terminal/Command Prompt:

```bash
docker-compose up -d
```

- **Lưu ý:** Lần đầu tiên chạy, Docker sẽ tự động đọc và thực thi các file `.sql` trong thư mục `databases/` để tạo sẵn các bảng và cấu hình (schema) cho database.
- Để xem database có đang chạy hay không: `docker-compose ps`
- Để dừng database: `docker-compose down`
- Để dừng và xóa sạch toàn bộ data (khi muốn chạy lại script tạo DB từ đầu): `docker-compose down -v`

## 2. Thông tin Kết nối Database

Bạn có thể dùng thông tin này để kết nối thông qua các công cụ quản lý CSDL (DBeaver, pgAdmin) hoặc cấu hình trong Backend:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `craftvision_db`
- **Username**: `craftvision_user`
- **Password**: `craftvision_password`

**Chuỗi kết nối (Connection String) chuẩn cho .NET:**
```text
Host=localhost;Port=5432;Database=craftvision_db;Username=craftvision_user;Password=craftvision_password;
```

## 3. Cấu hình Backend (.NET Entity Framework Core)

### 3.1. Cài đặt các gói NuGet cần thiết

Mở Terminal tại thư mục Backend của bạn và chạy các lệnh sau để cài đặt các thư viện cần thiết cho PostgreSQL và pgvector (để dùng tính năng embedding cho AI):

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package pgvector
dotnet add package Microsoft.EntityFrameworkCore.Design
```

### 3.2. Cấu hình `appsettings.json`

Thêm chuỗi kết nối vào file `appsettings.json` của project Backend:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=craftvision_db;Username=craftvision_user;Password=craftvision_password;"
  }
}
```

### 3.3. Tạo ApplicationDbContext

Tạo class `ApplicationDbContext.cs` để đại diện cho database và khai báo các bảng dưới dạng `DbSet<T>`:

```csharp
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore; // Thư viện hỗ trợ tính năng pgvector

namespace CraftVision.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Ví dụ: Khai báo ánh xạ các Model với bảng trong CSDL
        // public DbSet<User> Users { get; set; }
        // public DbSet<KnowledgeMaterial> KnowledgeMaterials { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Đăng ký extension "vector" và "pgcrypto" với PostgreSQL
            modelBuilder.HasPostgresExtension("vector");
            modelBuilder.HasPostgresExtension("pgcrypto");

            // Đăng ký các kiểu ENUM (nếu có, dựa theo cấu trúc file schema.txt)
            modelBuilder.HasPostgresEnum("user_tier_enum", new[] { "Free", "Premium" });
            modelBuilder.HasPostgresEnum("difficulty_enum", new[] { "Easy", "Medium", "Hard" });
        }
    }
}
```

### 3.4. Đăng ký DbContext vào hệ thống (`Program.cs`)

Trong file `Program.cs` (hoặc `Startup.cs`), thêm đoạn code sau để đăng ký DbContext và cấu hình sử dụng PostgreSQL có hỗ trợ Vector:

```csharp
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, o => o.UseVector())
);
```

## 4. Cách gửi lệnh Query từ Backend

Khi đã cấu hình xong, bạn có thể Inject `ApplicationDbContext` vào các Controller hoặc Service để thực hiện truy vấn (query) dữ liệu.

Ví dụ, tạo một file `MaterialsService.cs` để lấy dữ liệu từ bảng `knowledge_materials`:

```csharp
using Microsoft.EntityFrameworkCore;
using Pgvector; // Chứa kiểu dữ liệu Vector
using Pgvector.EntityFrameworkCore; // Chứa các phương thức extension để tính khoảng cách vector

namespace CraftVision.Backend.Services
{
    public class MaterialsService
    {
        private readonly ApplicationDbContext _dbContext;

        public MaterialsService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // 1. Lấy danh sách Material cơ bản (LINQ thuần)
        public async Task<List<KnowledgeMaterial>> GetActiveMaterialsAsync()
        {
            return await _dbContext.KnowledgeMaterials
                .Where(m => m.IsActive == true)
                .ToListAsync();
        }

        // 2. Tìm kiếm Cosine Similarity (Dùng cho chức năng AI / pgvector RAG)
        public async Task<List<KnowledgeMaterial>> FindSimilarMaterialsAsync(float[] queryEmbedding)
        {
            var vector = new Vector(queryEmbedding);

            // Truy vấn lấy top 5 vật liệu có khoảng cách Cosine gần nhất
            // Đây là sức mạnh của extension pgvector kết hợp EF Core
            return await _dbContext.KnowledgeMaterials
                .Where(m => m.IsActive == true)
                .OrderBy(m => m.Embedding.CosineDistance(vector))
                .Take(5)
                .ToListAsync();
        }
    }
}
```

## 5. Tổng kết quy trình làm việc (Workflow)

1. **Docker**: Đảm bảo container DB luôn đang chạy (`docker-compose up -d`).
2. **Entity (Model)**: Viết các class C# (`User`, `KnowledgeMaterial`...) ánh xạ đúng với các bảng đã tạo bằng file SQL.
3. **DbContext**: Đăng ký các Model thành các `DbSet` trong file DbContext.
4. **Service/Repository**: Dùng LINQ để truy vấn (Select, Insert, Update, Delete) thông qua DbContext. EF Core sẽ tự động dịch các lệnh LINQ thành câu lệnh truy vấn SQL gửi đến PostgreSQL.
