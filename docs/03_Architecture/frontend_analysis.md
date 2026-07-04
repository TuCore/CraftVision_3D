# 📋 Phân tích Frontend — CraftVision 3D

---

## 1. Ràng buộc bắt buộc về Design (Màu sắc, Font, Cấu trúc)

### 🎨 Hệ thống màu sắc (Design Tokens)

Toàn bộ hệ thống màu được định nghĩa trong [globals.css](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/globals.css) bằng **OKLCH color space** — một hệ thống màu hiện đại, hỗ trợ tốt cho dark mode.

#### Light Mode (`:root`)
| Token | Giá trị OKLCH | Mô tả |
|---|---|---|
| `--background` | `oklch(0.98 0.02 85)` | Nền ấm, hơi vàng nhạt |
| `--foreground` | `oklch(0.28 0.05 45)` | Chữ nâu đậm |
| `--primary` | `oklch(0.74 0.18 55)` | **Cam ấm** — màu chủ đạo |
| `--coral` | `oklch(0.72 0.2 25)` | **San hô / Đỏ cam** — màu nhấn phụ |
| `--butter` | `oklch(0.92 0.12 85)` | **Vàng bơ** — màu phụ trợ |
| `--sage` | `oklch(0.85 0.05 150)` | **Xanh xô thơm** — màu phụ trợ |
| `--clay` | `oklch(0.65 0.1 40)` | **Nâu đất nung** — màu phụ trợ |
| `--destructive` | `oklch(0.63 0.24 27)` | Đỏ cảnh báo |
| `--muted-foreground` | `oklch(0.52 0.04 50)` | Chữ phụ, mờ |
| `--border` | `oklch(0.9 0.02 70)` | Viền nhẹ |

#### Dark Mode (`.dark`)
| Token | Mô tả |
|---|---|
| `--background` | Nền nâu tối `oklch(0.18 0.02 45)` |
| `--primary` | Cam sáng hơn `oklch(0.76 0.2 55)` |
| `--border` | `oklch(1 0 0 / 10%)` — viền trắng 10% |

> [!IMPORTANT]
> Dark mode **đã được khai báo CSS** nhưng **chưa có UI toggle hoạt động**. Trang Settings có mock giao diện Sáng/Tối/Tự động nhưng chưa có logic thực.

#### Gradient & Hiệu ứng đặc biệt
| Utility | Mô tả |
|---|---|
| `--gradient-primary` | `135deg: coral → clay` |
| `--gradient-aurora` | `135deg: hồng → vàng → xanh lá` |
| `--shadow-glow` | Bóng cam phát sáng |
| `--shadow-coral` | Bóng san hô |
| `--shadow-coral-glow` | Bóng san hô phát sáng rộng (`blur` lớn) dành cho hover ảnh và chi tiết |
| `--shadow-soft` | Bóng mềm trung tính |

---

### 🔤 Hệ thống Font chữ

Được khai báo trong [layout.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/layout.tsx):

| Font | CSS Variable | Sử dụng cho |
|---|---|---|
| **Inter** | `--font-sans` | Body text (font mặc định) |
| **Plus Jakarta Sans** | `--font-display` | Headings (h1–h4), tiêu đề nổi bật |

- Cả 2 font đều load subsets: `vietnamese` + `latin`
- Headings có `letter-spacing: -0.02em` (tight)
- Toàn bộ body dùng `antialiased`

---

### 🧊 Hệ thống Utility CSS tự viết

Trong [globals.css](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/globals.css), project tạo các `@utility` riêng (Tailwind v4 syntax):

| Utility class | Mô tả |
|---|---|
| `glass-strong` | Glassmorphism mạnh (70% trắng, blur 12px) |
| `glass-card` | Glassmorphism nhẹ hơn (60% trắng, blur 8px) |
| `btn-hero` | Nút chính: gradient coral-clay, hover lift 6px, tăng brightness, icon animate |
| `gradient-text` | Chữ gradient (coral → clay) |
| `blob` | Hình tròn mờ background (absolute, blur 80px) |
| `shadow-soft` | Bóng nhẹ |
| `shadow-coral-glow` | Bóng phát sáng mạnh |

Animations:
| Class | Hiệu ứng |
|---|---|
| `animate-float` | Lơ lửng lên xuống 6s |
| `animate-pulse-glow` | Phóng to thu nhỏ + thay đổi opacity/blur 4s |
| `animate-fade-up` | Trượt lên mềm mại từ dưới (`translateY`), kết hợp fadeIn. |
| `animate-fade-in-page` | Mở trang mới: `scale(0.98)` lên 1, xoá mờ `blur` mượt mà (0.4s). Dùng cùng `key={pathname}`. |

Hiệu ứng Card Hover (Detail & Shop):
- Nhấc bổng `hover:-translate-y-1.5` (6px)
- Quầng sáng `hover:shadow-coral-glow`
- Quầng halo đằng sau ảnh (Coral Halo `blur-2xl`)
- Ảnh phóng to `hover:scale-110`

---

### 📐 Styling Framework

- **Tailwind CSS v4** + `@tailwindcss/postcss`
- Thư viện UI: **shadcn/ui** (46 components) dựa trên **Radix UI**
- Merge classes bằng `tailwind-merge` + `clsx`
- Animation: `tw-animate-css`

---

## 2. Danh sách các trang đã có

| # | Route | File | Mô tả | Layout |
|---|---|---|---|---|
| 1 | `/` | [page.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/page.tsx) | **Landing page** — giới thiệu sản phẩm, CTA đăng ký | Standalone (không AppShell) |
| 2 | `/auth` | [page.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/auth/page.tsx) | **Đăng nhập / Đăng ký** — form toggle, Google/GitHub OAuth buttons | Standalone |
| 3 | `/home` | [page.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/home/page.tsx) | **Trang chủ sau login** — hero, stats, dự án đang làm, gợi ý ý tưởng | AppShell ✅ |
| 4 | `/chat` | [page.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/chat/page.tsx) | **Chat AI** — giao diện chat, bảng nguyên liệu, link Shopee, video YouTube | AppShell ✅ |
| 5 | `/profile` | [page.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/profile/page.tsx) | **Hồ sơ cá nhân** — cover, avatar, badges, gallery dự án | AppShell ✅ |
| 6 | `/settings` | [page.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/settings/page.tsx) | **Cài đặt** — 7 tabs (Tài khoản, Thông báo, Bảo mật, Giao diện, AI, Thanh toán, Ngôn ngữ) | AppShell ✅ |
| 7 | `/shop` | [page.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/shop/page.tsx) | **Cửa hàng nguyên liệu** — Lưới sản phẩm, animation fade-up so le | AppShell ✅ |
| 8 | `/shop/[id]` | [page.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/shop/[id]/page.tsx) | **Chi tiết sản phẩm** — Ảnh lớn, multi-blob layers, thêm giỏ hàng | AppShell ✅ |
| 9 | `/cart` | [page.tsx](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/cart/page.tsx) | **Giỏ hàng** — Đọc state global, Empty state, tính toán tiền/ship | AppShell ✅ |

> [!NOTE]
> **Tổng cộng 9 trang UI**. Tất cả đều **static/mock data** (18 items trong `mock-products.ts`) — không gọi backend. Trang Giỏ hàng và Icon giỏ hàng giao tiếp thông qua React Context API.

---

## 3. Cấu trúc Source Code Frontend

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, metadata, global styles)
│   │   ├── loading.tsx               # Global loading fallback (Suspense)
│   │   ├── page.tsx                  # Landing page (/)
│   │   ├── favicon.ico               # Favicon
│   │   ├── globals.css               # Design system (colors, fonts, utilities, animations)
│   │   ├── auth/page.tsx             # Login/Register (/auth)
│   │   ├── home/page.tsx             # Dashboard (/home)
│   │   ├── chat/page.tsx             # AI Chat (/chat)
│   │   ├── profile/page.tsx          # User Profile (/profile)
│   │   ├── settings/page.tsx         # Settings (/settings)
│   │   ├── shop/page.tsx             # Shop listing (/shop)
│   │   ├── shop/[id]/page.tsx        # Product details
│   │   ├── cart/page.tsx             # Shopping cart (/cart)
│   │   └── api/                      # Next.js API Route Handlers (stubs)
│   │       ├── auth/login/route.ts   # POST /api/auth/login
│   │       ├── chat/route.ts         # POST /api/chat
│   │       └── projects/route.ts     # GET /api/projects
│   ├── components/
│   │   ├── AppShell.tsx              # Shared layout: header navbar + blob background
│   │   ├── CartProvider.tsx          # React Context lưu trạng thái Cart Global
│   │   ├── FloatingCart.tsx          # Widget giỏ hàng nổi (hiện đã được ẩn khỏi layout)
│   │   ├── TiltCard.tsx              # Component card có hiệu ứng 3D hover
│   │   ├── DIYProjectWidget.tsx      # Widget hiển thị tiến độ dự án thủ công
│   │   └── ui/                       # 46 shadcn/ui components + sonner (Toast)
│   │       ├── button.tsx, input.tsx, label.tsx, switch.tsx, checkbox.tsx ...
│   │       └── sidebar.tsx, dialog.tsx, tabs.tsx, tooltip.tsx ...
│   ├── hooks/
│   │   └── use-mobile.tsx            # Responsive breakpoint hook
│   └── lib/
│       ├── utils.ts                  # cn() utility (clsx + tailwind-merge)
│       ├── mock-products.ts          # Database mock 18 sản phẩm thủ công
│       ├── error-capture.ts          # Error capture utility
│       ├── error-page.ts             # Error page utility
│       └── lovable-error-reporting.ts # Error reporting (Lovable integration?)
├── package.json                      # Next.js 16 + React 19 + TailwindCSS 4
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config
└── postcss.config.mjs               # PostCSS with Tailwind
```

> [!TIP]
> **Tech stack tóm tắt**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui (Radix) + Lucide icons.
> **Các thư viện phụ trợ nổi bật**: `react-hook-form` & `zod` (Xử lý Form), `recharts` (Biểu đồ), `embla-carousel-react` (Slider/Carousel).

---

## 4. Trang nào đã gắn API? — Trạng thái tích hợp

### API Route Handlers đã tạo (stubs)

| API Route | Method | File | Trạng thái |
|---|---|---|---|
| `/api/auth/login` | POST | [route.ts](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/api/auth/login/route.ts) | 🔴 **STUB** — trả dummy JWT token, không kết nối backend |
| `/api/chat` | POST | [route.ts](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/api/chat/route.ts) | 🔴 **STUB** — trả response mẫu hardcoded |
| `/api/projects` | GET | [route.ts](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/frontend/src/app/api/projects/route.ts) | 🔴 **STUB** — trả 2 projects giả |

### Kết nối từ UI → API

> [!CAUTION]
> **KHÔNG CÓ TRANG NÀO GỌI API CẢ.** Tìm kiếm trong toàn bộ source cho `fetch()`, `axios`, `useSWR`, `useQuery`, hay bất kỳ pattern gọi API nào → **0 kết quả**.

| Trang | Gọi API? | Chi tiết |
|---|---|---|
| `/` (Landing) | ❌ | Hoàn toàn static |
| `/auth` | ❌ | Form `onSubmit={e => e.preventDefault()}`, nút Đăng nhập là `<Link href="/home">` — **không gọi API, chỉ redirect** |
| `/home` | ❌ | Tất cả data (projects, stats, ideas) đều **hardcoded trong component** |
| `/chat` | ❌ | Messages, materials, suggestions đều **hardcoded** — không có ô input submit thực |
| `/profile` | ❌ | Thông tin user, badges, gallery đều **hardcoded** |
| `/settings` | ❌ | Các form đều dùng `defaultValue` — **không có handler lưu/submit** |

---

## Tổng kết

| Hạng mục | Trạng thái |
|---|---|
| Design System | ✅ Hoàn chỉnh (OKLCH colors, fonts, glassmorphism, animations) |
| UI Components | ✅ 46 shadcn/ui components + 1 AppShell |
| Pages | ✅ 6 trang UI đẹp |
| API Stubs | ⚠️ 3 route handlers (stub, dummy data) |
| **Tích hợp API thực tế** | 🔴 **Chưa có — 0 trang gọi API** |
| **Dark Mode** | ⚠️ CSS đã khai báo, UI toggle chưa hoạt động |
| **Authentication** | 🔴 Chưa có (form chỉ redirect, không validate/gọi API) |
| **State Management** | ✅ Đã áp dụng **React Context API** (`CartProvider`) cho tính năng Giỏ hàng. |

> [!WARNING]
> Frontend hiện tại là **100% UI mockup**. Đẹp, hoàn chỉnh về mặt giao diện, nhưng chưa có bất kỳ logic nghiệp vụ hay kết nối backend nào.
