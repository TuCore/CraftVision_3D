# Kế hoạch triển khai CraftVision 3D Mobile (Flutter) — Technical Spec

## 0. Tổng quan Kiến trúc
Ứng dụng CraftVision 3D Mobile được xây dựng bằng **Flutter**, tuân theo kiến trúc **Feature-first Clean Architecture**.
Việc tách biệt các tầng giúp code dễ bảo trì, dễ test và độc lập hoàn toàn với UI, Database, hay Third-party services.

## 1. Cấu trúc tổng thể `lib/`

```
lib/
├─ main.dart
├─ app.dart
├─ core/                   # Chứa các thành phần dùng chung toàn cục
│  ├─ config/
│  ├─ constants/
│  ├─ error/
│  ├─ network/
│  ├─ storage/
│  ├─ router/
│  ├─ theme/
│  ├─ l10n/
│  ├─ utils/
│  └─ widgets/
└─ features/               # Chứa các nghiệp vụ (Features) của app
   ├─ auth/
   ├─ landing/
   ├─ home/
   ├─ shop/
   ├─ cart/
   ├─ checkout/
   ├─ payment/
   ├─ orders/
   ├─ profile/
   ├─ settings/
   ├─ chat/
   ├─ greeting/
   ├─ studio/
   ├─ gift/
   ├─ manifest/
   ├─ create/
   └─ legal/
```

## 2. Mô hình 3 Lớp (Clean Architecture) cho mỗi Feature

Các Feature phức tạp (như `auth`, `shop`, `checkout`, `orders`, `profile`...) đều tuân thủ chặt chẽ mô hình 3 lớp. 
Quy tắc phụ thuộc: **Presentation → Domain ← Data**. Tầng `domain` là trung tâm và không phụ thuộc vào bất kỳ framework bên ngoài nào (kể cả Flutter hay Dio).

### A. Tầng Data (`data/`)
Giao tiếp với API, Local Database và xử lý JSON.
- `datasources/`: Nơi định nghĩa các API calls (`RemoteDataSource`) hoặc truy xuất local DB (`LocalDataSource`).
- `models/`: Chứa các class DTO (Data Transfer Object) để parse JSON (dùng `freezed` + `json_serializable`).
- `repositories/`: Chứa các class Implementation (thực thi) của Interface Repository định nghĩa ở tầng Domain.

### B. Tầng Domain (`domain/`)
Chứa Business Logic cốt lõi. Không được chứa import liên quan tới giao diện (flutter/material) hay third-party HTTP client.
- `entities/`: Chứa các class đối tượng kinh doanh lõi (VD: `User`, `Product`, `Order`).
- `repositories/`: Chứa các Abstract class (Interface) quy định các hàm mà tầng Data phải implement.

### C. Tầng Presentation (`presentation/`)
Quản lý UI và State.
- `providers/`: Chứa các state management (dùng `flutter_riverpod` - AsyncNotifier, StateNotifier).
- `screens/`: Chứa các giao diện toàn màn hình (Page/Screen).
- `widgets/`: Chứa các components nhỏ chỉ dùng riêng trong feature đó.

## 3. Cấu trúc các Feature Rút gọn

Để tránh over-engineering, các Feature đơn giản sẽ không bắt buộc phải có đủ 3 lớp:

1. **Chỉ chứa UI & Providers (Có gọi local data nhẹ)**
   - `features/home/`: Trưng bày UI, gọi file json asset.
   - `features/payment/`: Điều hướng WebView.
2. **Hoàn toàn chỉ chứa UI (Không có nghiệp vụ Data/Domain)**
   - `features/create/`: Orchestrator UI (Menu điều phối các luồng AI).
   - `features/landing/`: Màn hình tĩnh.
   - `features/legal/`: Màn hình điều khoản tĩnh.

## 4. Công nghệ (Tech Stack) cốt lõi
- **State Management**: `flutter_riverpod`
- **Routing**: `go_router` (Sử dụng `ShellRoute` cho Bottom Navigation bar).
- **HTTP Client**: `dio` (kèm Interceptors xử lý token, retry).
- **JSON Parsing**: `freezed`, `json_serializable`
- **Local Storage**: `flutter_secure_storage` (cho JWT), `shared_preferences` (cho cấu hình nhẹ).
- **3D Viewer**: `model_viewer_plus`
- **Theming**: Tích hợp Material 3 với `ThemeExtension` dựa trên Design System của CraftVision (OKLCH).
