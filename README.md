# Hệ Thống Quản Lý Thông Tin Doanh Nghiệp (QL_HTTTDN)

> Giải pháp quản lý toàn diện cho doanh nghiệp thương mại, tích hợp các module Nhân sự, Kho hàng, Kinh doanh và nền tảng bán hàng trực tuyến.

## 📋 Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Công Nghệ](#công-nghệ)
- [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- [Tính Năng & Phân Quyền](#tính-năng--phân-quyền)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Cấu Hình Biến Môi Trường](#cấu-hình-biến-môi-trường)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [Tài Khoản Mặc Định](#tài-khoản-mặc-định)
- [API Documentation](#api-documentation)
- [Documentation](#documentation)
- [Đóng Góp](#đóng-góp)

---

## 🎯 Giới Thiệu

**QL_HTTTDN** là một hệ thống quản lý thông tin doanh nghiệp (ERP Lite) được thiết kế cho các doanh nghiệp vừa và nhỏ (SME) hoạt động trong lĩnh vực thương mại điện tử và phân phối hàng hóa.

### Đối Tượng Sử Dụng

| Vai Trò | Mô Tả |
|---------|-------|
| **Admin** | Ban giám đốc - Quản lý toàn bộ hệ thống, nhân sự, kho và báo cáo |
| **HR Manager** | Quản lý nhân sự, lương, phép, thống kê nhân sự |
| **Warehouse Manager** | Quản lý sản phẩm, danh mục, nhà cung cấp, phiếu nhập/xuất kho |
| **Sales Manager** | Quản lý đơn hàng, phiếu xuất, khuyến mãi, báo cáo doanh số |
| **Employee** | Xem hồ sơ cá nhân, xin phép, xem bảng lương |
| **Customer** | Khách hàng mua hàng trực tuyến, theo dõi đơn hàng |

---

## 🛠 Công Nghệ

### Backend
- **Runtime:** Node.js
- **Framework:** NestJS 10+
- **Database:** PostgreSQL 14+
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** class-validator, class-transformer
- **File Upload:** Cloudinary

### Frontend
- **Library:** React 19+
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn/ui + Radix UI
- **State Management:** Zustand
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Notifications:** Sonner
- **Forms:** React Hook Form

### DevOps & Tools
- **Build Tool:** Vite
- **Package Manager:** npm
- **Linting:** ESLint
- **Code Formatter:** Prettier
- **Version Control:** Git

---

## 🏗 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                    │
├─────────────────────────────────────────────────────────────┤
│  Admin Portal │ HR Portal │ Warehouse │ Sales │ Ecommerce  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Axios + JWT
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (NestJS + Prisma)                │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│  Auth Module │ HR Module    │ Warehouse    │ Sales Module   │
│              │              │ Module       │                │
├──────────────┴──────────────┴──────────────┴─────────────────┤
│                    Shared Services                           │
│  (Database, Cache, File Upload, Logging)                    │
└─────────────────────────────────┬──────────────────────────┘
                                  │
                                  ▼
                        ┌─────────────────────┐
                        │   PostgreSQL DB     │
                        │   + Cloudinary      │
                        └─────────────────────┘
```

---

## ✨ Tính Năng & Phân Quyền

### 1️⃣ Module Quản Lý Nhân Sự (HR)

**Người dùng:** Admin, HR Manager

| Tính Năng | Trang | Quyền |
|-----------|-------|-------|
| Quản lý nhân viên | `/hr/employees` | Thêm, sửa, xóa, xem chi tiết |
| Quản lý lương | `/hr/salaries` | Tính lương, xuất bảng, duyệt |
| Duyệt phép năm | `/hr/leave-requests` | Xem, duyệt, từ chối đơn |
| Thống kê nhân sự | `/hr/statistics` | Xem báo cáo thống kê, biểu đồ |
| Báo cáo HR | `/hr/reports` | Xuất báo cáo theo tháng/quý/năm |

**Người dùng:** Employee, Sales Manager, Warehouse Manager

| Tính Năng | Trang | Quyền |
|-----------|-------|-------|
| Xin phép | `/employee/leave-request` | Gửi đơn xin phép, theo dõi |
| Hồ sơ cá nhân | `/employee/profile` | Xem và cập nhật thông tin |
| Bảng lương | `/employee/salary` | Xem bảng lương cá nhân |

---

### 2️⃣ Module Quản Lý Kho (Warehouse)

**Người dùng:** Admin, Warehouse Manager

| Tính Năng | Trang | Quyền |
|-----------|-------|-------|
| Danh mục sản phẩm | `/warehouse/categories` | Tạo, sửa, xóa danh mục |
| Quản lý sản phẩm | `/warehouse/products` | CRUD sản phẩm, cập nhật giá |
| Nhà cung cấp | `/warehouse/suppliers` | Quản lý thông tin NCC |
| Phiếu nhập kho | `/warehouse/import-slips` | Tạo, duyệt phiếu nhập |
| Báo cáo kho | `/warehouse/reports` | Tồn kho, nhập/xuất, trendline |

---

### 3️⃣ Module Quản Lý Kinh Doanh (Sales)

**Người dùng:** Admin, Sales Manager

| Tính Năng | Trang | Quyền |
|-----------|-------|-------|
| Đơn hàng | `/sales/orders` | Xem, xác nhận, hủy đơn |
| Phiếu xuất kho | `/sales/export-slips` | Tạo, duyệt phiếu xuất |
| Khuyến mãi | `/admin/promotions` | Tạo, sửa, xóa promotion |
| Báo cáo bán hàng | `/sales/reports` | Doanh thu, lợi nhuận, top sản phẩm |

---

### 4️⃣ Module Quản Trị Hệ Thống (Admin)

**Người dùng:** Admin

| Tính Năng | Trang | Quyền |
|-----------|-------|-------|
| Dashboard | `/admin/dashboard` | Xem tổng quan hệ thống |
| Quản lý khách hàng | `/admin/users` | Quản lý tài khoản khách hàng |
| Báo cáo tổng hợp | `/admin/reports` | Báo cáo toàn hệ thống |

---

### 5️⃣ Portal Bán Hàng Trực Tuyến (Ecommerce)

**Người dùng:** Customer (chưa đăng nhập hoặc đã đăng nhập)

| Tính Năng | Trang | Quyền |
|-----------|-------|-------|
| Trang chủ | `/` | Xem danh sách sản phẩm, banner |
| Danh sách sản phẩm | `/products` | Lọc, tìm kiếm, phân trang |
| Chi tiết sản phẩm | `/products/:id` | Xem thông tin, đánh giá, mua |
| Giỏ hàng | `/cart` | Thêm, xóa, cập nhật số lượng |
| Thanh toán | `/checkout` | Nhập địa chỉ, chọn phương thức |
| Đơn hàng của tôi | `/orders` | Theo dõi đơn hàng, hủy |
| Hồ sơ khách hàng | `/profile` | Cập nhật thông tin cá nhân |
| Về chúng tôi | `/about` | Thông tin doanh nghiệp |
| Liên hệ | `/contact` | Form liên hệ |

---

## 📁 Cấu Trúc Dự Án

```
QL_HTTTDN/
├── backend/
│   ├── src/
│   │   ├── auth/              # Module xác thực & phân quyền
│   │   ├── hr/                # Module Nhân sự
│   │   ├── warehouse/         # Module Kho hàng
│   │   ├── sales/             # Module Kinh doanh
│   │   ├── users/             # Module Khách hàng
│   │   ├── common/            # Hằng số, enum, filter, interceptor
│   │   ├── prisma/            # Database layer
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.ts            # Data seeding
│   │   └── migrations/        # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # Các trang theo module
│   │   │   ├── admin/
│   │   │   ├── hr/
│   │   │   ├── warehouse/
│   │   │   ├── sales/
│   │   │   ├── employee/
│   │   │   ├── customer/
│   │   │   └── auth/
│   │   ├── components/        # Tái sử dụng UI components
│   │   ├── layouts/           # Layout templates
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand state management
│   │   ├── services/          # API service functions
│   │   ├── types/             # TypeScript types
│   │   ├── api/               # Axios configuration
│   │   ├── routes/            # Route configuration
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example               # Template biến môi trường
├── .gitignore
├── README.md                  # File này
└── package.json               # Root package (optional)
```

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

- **Node.js:** v18.0.0 hoặc cao hơn
- **npm:** v9.0.0 hoặc cao hơn
- **PostgreSQL:** v14 hoặc cao hơn
- **Git:** v2.0 hoặc cao hơn

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd QL_HTTTDN
```

### Bước 2: Cài Đặt Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### Bước 3: Tạo File Biến Môi Trường

Tạo file `.env` trong thư mục `backend/` (tham khảo `.env.example`):

```bash
cp backend/.env.example backend/.env
```

---

## 🔧 Cấu Hình Biến Môi Trường

### Backend Environment (`.env`)

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ql_htttdn_db

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRATION=7d

# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Cloudinary (File Upload)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_password
```

### Frontend Environment (tùy chọn `frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your_cloud_name
```

---

## ▶️ Chạy Ứng Dụng

### 1️⃣ Tạo & Cập Nhật Database

```bash
cd backend

# Tạo migration mới (nếu cần)
npx prisma migrate dev --name init

# Hoặc chỉ áp dụng migration hiện có
npx prisma migrate deploy

# Xem database trực quan (tùy chọn)
npx prisma studio
```

### 2️⃣ Chạy Backend (Development)

```bash
cd backend
npm run start:dev
```

Máy chủ sẽ khởi động tại: **http://localhost:3000**

API endpoints: **http://localhost:3000/api**

### 3️⃣ Chạy Frontend (Development)

Mở terminal khác:

```bash
cd frontend
npm run dev
```

Ứng dụng web sẽ khởi động tại: **http://localhost:5173**

### 4️⃣ Build Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 👤 Tài Khoản Mặc Định

Sau khi chạy migration, hệ thống sẽ tự động tạo các tài khoản demo:

| Email | Mật Khẩu | Vai Trò | Chuyên Dùng Trang |
|-------|----------|--------|------------------|
| admin@example.com | admin123 | Admin | `/admin/dashboard` |
| hr@example.com | hr123 | HR Manager | `/hr/employees` |
| warehouse@example.com | warehouse123 | Warehouse Manager | `/warehouse/products` |
| sales@example.com | sales123 | Sales Manager | `/sales/orders` |
| employee@example.com | employee123 | Employee | `/employee/profile` |
| customer@example.com | customer123 | Customer | `/products` |

> ⚠️ **Bảo Mật:** Thay đổi mật khẩu mặc định trước khi triển khai lên Production.

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
Tất cả các request cần gửi JWT token trong header:

```bash
Authorization: Bearer {token}
```

### Endpoint Chính

#### Auth
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/refresh` - Làm mới token
- `POST /auth/logout` - Đăng xuất

#### HR
- `GET /hr/employees` - Danh sách nhân viên
- `POST /hr/employees` - Tạo nhân viên
- `GET /hr/salaries` - Danh sách lương
- `GET /hr/leave-requests` - Đơn xin phép

#### Warehouse
- `GET /warehouse/products` - Danh sách sản phẩm
- `POST /warehouse/products` - Tạo sản phẩm
- `GET /warehouse/import-slips` - Phiếu nhập

#### Sales
- `GET /sales/orders` - Danh sách đơn hàng
- `GET /sales/export-slips` - Phiếu xuất

> Xem chi tiết tại: `/api/docs` (Swagger UI)

---

## 📖 Documentation

Xem tài liệu chi tiết về dự án tại đây:

📄 **[Tài Liệu Đồ Án Hệ Thống](https://docs.google.com/document/d/1XqtkOd1yMQn5PyFbvHDQ_iRZfTD2NIHiVMYGJ8HG__A/edit?usp=sharing)**

*Tài liệu bao gồm:*
- Phân tích yêu cầu chi tiết
- Thiết kế cơ sở dữ liệu
- Sơ đồ use case & DFD
- Hướng dẫn sử dụng từng module

---

## 📊 Tính Năng Nâng Cao

✅ **Hoàn thiện:**
- Xác thực & phân quyền dựa trên role
- Quản lý nhân sự (lương, phép)
- Quản lý kho (nhập, xuất, tồn)
- Quản lý đơn hàng & doanh số
- Portal ecommerce
- Báo cáo & thống kê
- Thông báo Toast

## 👥 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

**Last Updated:** May 2026 | **Version:** 1.0.0
