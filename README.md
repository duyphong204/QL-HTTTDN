<div align="center">
  <img src="https://via.placeholder.com/150/09f/fff.png?text=QL_HTTTDN" alt="Logo" width="120" height="120">
  <h1 align="center">Hệ Thống Quản Lý Thông Tin Doanh Nghiệp (Enterprise ERP)</h1>
  <p align="center">
    <strong>Giải pháp ERP toàn diện xây dựng trên Kiến trúc Microservices (NestJS Monorepo)</strong>
    <br />
    Tích hợp Quản trị Nhân sự (HR), Quản lý Kho (Warehouse), Kinh doanh (Sales) và Bán hàng trực tuyến.
  </p>

  <!-- Badges -->
  <p align="center">
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

---

## 📋 Mục Lục

- [🎯 Giới Thiệu](#-giới-thiệu)
- [🛠 Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [🏗 Kiến Trúc Hệ Thống (Microservices)](#-kiến-trúc-hệ-thống-microservices)
- [📂 Cấu Trúc Mã Nguồn (Monorepo)](#-cấu-trúc-mã-nguồn-monorepo)
- [✨ Các Điểm Nhấn Kỹ Thuật (Technical Highlights)](#-các-điểm-nhấn-kỹ-thuật-technical-highlights)
- [🚀 Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
- [🔧 Cấu Hình Môi Trường](#-cấu-hình-môi-trường)
- [📚 API Documentation](#-api-documentation)

---

## 🎯 Giới Thiệu

**QL_HTTTDN** là hệ thống ERP (Enterprise Resource Planning) được thiết kế chuyên biệt cho quy mô doanh nghiệp vừa và nhỏ (SME), hoạt động chủ yếu trong lĩnh vực phân phối, bán lẻ và thương mại điện tử. 

Hệ thống được chuyển đổi (refactor) từ kiến trúc Monolithic sang kiến trúc **Microservices chuẩn mực**, đảm bảo tính mở rộng cao (Scalability), độ tin cậy (Reliability), và tính nhất quán dữ liệu (Data Consistency) theo chuẩn công nghiệp thực tế.

---

## 🛠 Công Nghệ Sử Dụng

### Backend (Microservices)
- **Framework:** NestJS (v10+)
- **Architecture:** Microservices Monorepo (TCP Transport)
- **Message Broker:** RabbitMQ (Event-driven & Saga Pattern)
- **Database:** PostgreSQL (Database-per-service pattern)
- **Caching:** Redis (Tối ưu Report/Dashboard)
- **ORM:** Prisma
- **Auth:** JWT (JSON Web Tokens) qua API Gateway
- **Validation:** class-validator, class-transformer

### Frontend
- **Core:** React 19 (TypeScript) + Vite
- **UI & Styling:** Tailwind CSS 4, Shadcn/UI, Radix UI
- **State Management:** Zustand
- **Networking:** Axios
- **Khác:** Recharts (Báo cáo), React Hook Form, Sonner

### DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose
- **Task Runner:** npm scripts (concurrently)

---

## 🏗 Kiến Trúc Hệ Thống (Microservices)

Hệ thống được vận hành xoay quanh một **API Gateway** làm điểm vào duy nhất, điều phối request xuống các Service con thông qua giao thức TCP nội bộ và RabbitMQ.

```mermaid
graph TD
    Client[Client / Browser] -->|REST / HTTP| Gateway(API Gateway)
    
    Gateway -->|TCP| Auth[Auth Service]
    Gateway -->|TCP| HR[HR Service]
    Gateway -->|TCP| Warehouse[Warehouse Service]
    Gateway -->|TCP| Sales[Sales Service]
    Gateway -->|TCP| Report[Report Service]

    Sales -.->|RabbitMQ Events| Warehouse
    Sales -.->|RabbitMQ Events| Report
    
    Auth --> DB1[(DB: db_auth)]
    HR --> DB2[(DB: db_hr)]
    Warehouse --> DB3[(DB: db_warehouse)]
    Sales --> DB4[(DB: db_sales)]
    Report --> DB5[(DB: db_report)]
    Report --> Redis[(Redis Cache)]
```

---

## 📂 Cấu Trúc Mã Nguồn (Monorepo)

Dự án được quản lý dưới dạng **NestJS Monorepo**, giúp chia sẻ code (Shared Library) dễ dàng giữa các Microservices nhưng vẫn giữ được sự độc lập khi Build và Deploy.

```bash
QL_HTTTDN/
├── backend/
│   ├── apps/
│   │   ├── api-gateway/         # API Gateway (REST -> TCP proxy & JWT decode)
│   │   ├── auth-service/        # Quản lý Users, Đăng nhập, Token
│   │   ├── hr-service/          # Quản lý Nhân sự, Chấm công, Tính Lương
│   │   ├── sales-service/       # Quản lý Đơn hàng, Giỏ hàng, Khuyến mãi
│   │   ├── warehouse-service/   # Quản lý Sản phẩm, Tồn kho, Phiếu nhập
│   │   └── report-service/      # Xử lý số liệu thống kê & Caching Redis
│   │
│   ├── libs/
│   │   └── common/              # Shared thư viện (DTO, Guard, Decorator, PrismaClient, RMQ)
│   │
│   ├── prisma/                  # Prisma Schema & Migrations
│   ├── package.json             # Scripts (start:all, build:all)
│   └── nest-cli.json
│
├── frontend/                    # Source code React Vite UI
├── docker-compose.yml           # Định nghĩa hạ tầng Postgres, Redis, RabbitMQ
└── README.md
```

---

## ✨ Các Điểm Nhấn Kỹ Thuật (Technical Highlights)

Hệ thống được tối ưu hóa khắt khe theo tiêu chuẩn **Senior Architect**:

1. **Saga Pattern (Choreography):**
   - Đảm bảo tính nhất quán dữ liệu phân tán. Khi Đơn hàng (Sales) được tạo, sự kiện trừ kho được bắn sang Warehouse qua RabbitMQ. Nếu Warehouse trừ kho thất bại, sự kiện bù trừ (Compensation Event `warehouse.stock_failed`) sẽ được bắn ngược lại để Sales tự động Hủy đơn.

2. **Pessimistic Locking & Transaction:**
   - Xử lý triệt để bài toán **Race Condition** (nhiều người mua cùng 1 mặt hàng tại cùng 1 thời điểm) bằng Transaction và Locking (`FOR UPDATE` / Prisma `$transaction`) trong tính năng Xuất/Nhập kho và Tính Lương.

3. **Database-Per-Service:**
   - Đảm bảo tính lỏng lẻo (Loose Coupling). Mỗi Service sở hữu một DB riêng (Auth DB, Sales DB, HR DB,...), cấm tuyệt đối các service Join bảng chéo của nhau (Cross-DB Joins).

4. **Bảo Mật API Gateway:**
   - Tích hợp `AuthMiddleware` tại Gateway để chặn và giải mã JWT token (Stateless), bóc tách `userId` và inject vào TCP Payload đẩy xuống các microservices nội bộ.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường
- **Node.js** v22+
- **Docker** & **Docker Compose**

### Bước 1: Khởi Chạy Hạ Tầng (Infrastructure)
Bao gồm 5 instance PostgreSQL, 1 RabbitMQ, và 1 Redis.
```bash
cd QL_HTTTDN
docker-compose up -d
```
*Đợi khoảng 30s để RabbitMQ và Postgres chuyển sang trạng thái "healthy".*

### Bước 2: Khởi Tạo Database (Migration & Seeding)
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
# Hoặc chạy seed (nếu có): npx prisma db seed
```

### Bước 3: Chạy Toàn Bộ Hệ Thống Microservices
Lệnh này sẽ dùng `concurrently` để chạy API Gateway và 5 Microservices cùng một lúc (mỗi service có màu log khác nhau).
```bash
# Ở thư mục backend/
npm install
npm run start:all
```
*Hệ thống Backend (API Gateway) sẽ chạy ở cổng `http://localhost:3000`.*

### Bước 4: Chạy Frontend (React)
Mở một cửa sổ Terminal mới:
```bash
cd frontend
npm install
npm run dev
```
*Giao diện Web sẽ chạy ở cổng `http://localhost:5173`.*

---

## 🔧 Cấu Hình Môi Trường (.env)

Tạo file `backend/.env`:
```env
# Database kết nối tới Docker Infra
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/ql_htttdn_db?schema=public"

# JWT Config
JWT_SECRET=supersecret_jwt_key_enterprise_2026
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Microservices Ports
PORT=3000
AUTH_SERVICE_PORT=3001
HR_SERVICE_PORT=3002
WAREHOUSE_SERVICE_PORT=3003
SALES_SERVICE_PORT=3004
REPORT_SERVICE_PORT=3005

# RabbitMQ & Redis
RABBITMQ_URL=amqp://guest:guest@localhost:5672
REDIS_URL=redis://localhost:6379

# Các cấu hình Cloudinary / Thanh toán MOMO, VNPAY...
```

---

## 📚 API Documentation

**Base Gateway URL:** `http://localhost:3000/api/v1`

Các API được chia theo module proxy:
* `POST /auth/login`
* `GET /auth/me`
* `GET /employees`, `GET /salaries` (HR Service)
* `GET /products`, `POST /stock-ins` (Warehouse Service)
* `GET /orders`, `POST /cart/items` (Sales Service)

Chi tiết vui lòng truy cập Swagger UI tại: `http://localhost:3000/api/docs` (Nếu đã cấu hình OpenAPI).

---

## 📖 Tài Liệu Bổ Sung (Documentation)

Xem tài liệu phân tích thiết kế chi tiết về dự án (Sơ đồ Use Case, Database Schema, Thiết kế luồng) tại Google Docs:

📄 **[Tài Liệu Đồ Án Quản Lý HTTT Doanh Nghiệp](https://docs.google.com/document/d/1XqtkOd1yMQn5PyFbvHDQ_iRZfTD2NIHiVMYGJ8HG__A/edit?tab=t.0#heading=h.id13odx6zz9x)**

