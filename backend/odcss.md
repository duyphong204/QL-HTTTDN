# ODCSS - BACKEND REFACTORING GUIDELINES & STANDARDS

Tài liệu này định nghĩa toàn bộ quy chuẩn (Standards), kiến trúc (Architecture), tối ưu hóa cơ sở dữ liệu (Database Optimization), mã nghiệp vụ (Business Logic), và bảo mật (Security) cho quá trình refactor backend của hệ thống **QL_HTTTDN**.

---

## 1. KIẾN TRÚC TỔNG THỂ (ARCHITECTURE)

### 1.1. Monorepo & Microservices
Dự án sử dụng NestJS theo kiến trúc **Monorepo Microservices**.
- **API Gateway (`apps/api-gateway`)**: Entry point duy nhất cho các clients. Làm nhiệm vụ Routing, Authentication, Request Validation, Rate Limiting, Logging.
- **Microservices (`apps/*-service`)**: Tách biệt theo domain logic (Auth, HR, Sales, Warehouse, Report).
- **Shared Libraries (`libs/common`)**: Chứa các modules dùng chung như Config, Database (Prisma), Logger, Exceptions, DTOs, Decorators, và Utilities.

### 1.2. Clean Architecture Layering (Trong mỗi Service)
Mỗi service (hoặc module) phải tuân thủ việc tách biệt các lớp (Layers):
1. **Controller Layer**: 
   - Chỉ nhận Request từ Gateway/Message Broker.
   - Gọi Service để xử lý.
   - Trả về Response chuẩn hóa.
2. **Service Layer (Business Logic)**:
   - Chứa toàn bộ logic nghiệp vụ, tính toán, kiểm tra điều kiện.
   - Không gọi trực tiếp Prisma mà thông qua Repository Layer (nếu logic phức tạp) hoặc chỉ tương tác với DB thông qua các custom Prisma Service thuần túy.
3. **Data Access Layer (Repository)**:
   - Chứa các câu query Prisma. Không để rò rỉ (leak) query Prisma lên tầng Controller.

---

## 2. QUY TẮC VIẾT CODE (CODING STANDARDS)

### 2.1. Quy ước Đặt Tên (Naming Convention)
- **Files/Folders**: Sử dụng `kebab-case`. Ví dụ: `user-profile.controller.ts`, `auth-service`.
- **Classes/Interfaces/Types**: Sử dụng `PascalCase`. Ví dụ: `CreateUserDto`, `UserRepository`.
- **Variables/Functions**: Sử dụng `camelCase`. Ví dụ: `getUserById`, `userData`.
- **Constants/Enums**: Sử dụng `UPPER_SNAKE_CASE`. Ví dụ: `MAX_UPLOAD_SIZE`, `OrderStatus.PENDING`.

### 2.2. DTO & Validation
- **Bắt buộc** sử dụng DTO cho toàn bộ Request Body và Query.
- Sử dụng `@nestjs/swagger` để document API.
- Cấu hình `ValidationPipe` toàn cục:
  ```typescript
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Lược bỏ các trường không có trong DTO
    forbidNonWhitelisted: true, // Báo lỗi nếu gửi trường dư thừa
    transform: true // Tự động ép kiểu (vd: string -> number)
  }));
  ```

### 2.3. Linter & Formatter
- Tuân thủ nghiêm ngặt ESLint và Prettier (`npm run lint` / `npm run format`).
- Không có lỗi type `any` (sử dụng type rõ ràng).

---

## 3. TỐI ƯU HÓA DATABASE (DATABASE OPTIMIZATION)

### 3.1. Tối ưu Schema & Indexes
- Các trường thường xuyên dùng để tìm kiếm (`WHERE`), sắp xếp (`ORDER BY`), hoặc liên kết (`JOIN`/Prisma relations) cần được đánh index.
  ```prisma
  model User {
    id    Int    @id @default(autoincrement())
    email String @unique
    @@index([email])
  }
  ```

### 3.2. Prisma Best Practices
- **Tránh N+1 Problem**: KHÔNG sử dụng vòng lặp (map/for) để query DB. Dùng `include` hoặc gộp mảng ID để query một lần (`in: [id1, id2]`).
- **Lấy đúng dữ liệu cần thiết**: Sử dụng `select` để chỉ lấy các trường cần thiết, giảm thiểu memory.
- **Phân trang (Pagination)**: Tất cả API Get List đều phải có phân trang (`skip`, `take`).
- **Connection Pooling**: Cấu hình URL với pgbouncer (hoặc pool) nếu triển khai production lên Cloud.

---

## 4. TỐI ƯU NGHIỆP VỤ (BUSINESS LOGIC)

### 4.1. Refactor Fat Services
- Tuân thủ **Single Responsibility Principle (SRP)**. Nếu một file Service quá dài (> 500 dòng) hoặc làm nhiều việc, cần tách thành các Service nhỏ hơn, hoặc sử dụng CQRS pattern.

### 4.2. Quản Lý Lỗi Thống Nhất (Unified Error Handling)
- Tuyệt đối không ném lỗi chung chung. Sử dụng các Exception mặc định của NestJS hoặc tạo Custom Exception.
- Xây dựng **Global Exception Filter** để trả về format thống nhất:
  ```json
  {
    "statusCode": 400,
    "message": "Invalid input data",
    "error": "Bad Request",
    "timestamp": "2026-09-02T10:00:00Z"
  }
  ```

### 4.3. Logging
- Thay thế `console.log` bằng Logger của NestJS hoặc thư viện chuyên dụng như `winston`/`pino`.
- Phân biệt rõ `log`, `warn`, `error`, `debug`. Error luôn kèm theo Stack Trace và context (UserId, RequestId).

---

## 5. BẢO MẬT (SECURITY)

### 5.1. Xác Thực & Phân Quyền (Authentication & Authorization)
- Sử dụng Access Token (JWT) thời gian sống ngắn, và Refresh Token (có thể lưu DB hoặc Redis để thu hồi).
- Triển khai **Global Guard** hoặc Role-based Guard (`@Roles('ADMIN')`) cho các API nhạy cảm.

### 5.2. Bảo Vệ Ứng Dụng
- **Helmet**: Sử dụng `helmet()` để bảo mật HTTP Headers (chống XSS, Clickjacking).
- **Rate Limiting**: Cấu hình `@nestjs/throttler` ở API Gateway.
- **CORS**: Cấu hình nguồn gốc (origin) rõ ràng, không để `*` trên môi trường Production.
- **Mã Hóa**: Passwords phải được hash bằng `bcrypt` với cost >= 10. Không để lọt các secrets, keys ra console log.

---

## 6. LỘ TRÌNH REFACTOR & THỰC THI

1. **Giai đoạn 1**: 
   - Khởi tạo thư mục `libs/common` (DTO, Filters, Interceptors chung).
   - Thiết lập chuẩn ESLint, Prettier.
   - Refactor API Gateway: Thêm Helmet, Rate Limit, Global Validation.
2. **Giai đoạn 2**:
   - Refactor tầng Database, thiết lập Prisma Module chung.
   - Audit lại các Schema và thêm Index.
3. **Giai đoạn 3**:
   - Tái cấu trúc từng Microservice (Auth -> HR -> Sales -> Warehouse -> Report).
   - Tách Controller & Service, loại bỏ logic query khỏi Controller.
4. **Giai đoạn 4**:
   - Hoàn thiện Error Handling & Logging.
   - Chạy test kiểm tra tốc độ (Load Test/Stress Test cơ bản).
