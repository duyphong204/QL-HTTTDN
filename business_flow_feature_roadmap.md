# Business Flow and Feature Roadmap - QL_HTTTDN

## 1. Muc tieu tai lieu

Tai lieu nay tong hop:
- Cau truc thu muc va cong nghe cua du an.
- Flow xu ly tu backend den frontend theo role.
- Doi chieu yeu cau do an voi hien trang code.
- Danh sach chuc nang can lam tiep theo muc uu tien.

---

## 2. Tong quan cong nghe va kien truc

### 2.1 Backend
- Framework: NestJS
- ORM: Prisma
- Database: PostgreSQL
- Auth: JWT Access Token + Refresh Token Cookie
- Pattern: Controller -> Service -> Prisma
- Middleware: Logging middleware global

### 2.2 Frontend
- Framework: React + TypeScript + Vite
- UI: TailwindCSS + shadcn/ui + lucide-react
- State: Zustand stores theo module
- HTTP: Axios + interceptor refresh token
- Router: react-router-dom + ProtectedRoute + role-based menu

### 2.3 App flow tong quat
1. User dang nhap qua auth API.
2. Frontend luu access token, backend luu refresh token hash.
3. Frontend goi API qua axiosInstance; khi 401 thi tu dong refresh token.
4. UI role-based duoc phan qua ProtectedRoute va route config.
5. Page -> Store -> API -> Backend Controller -> Service -> Prisma -> DB.

---

## 3. Cau truc thu muc chinh

### 3.1 Backend modules
- Auth: dang ky, dang nhap, refresh, profile, logout.
- Users: admin quan ly user (CRUD + role + filter/search/sort/pagination).
- HR:
  - Employees
  - Leave Requests
  - Salaries
- Warehouse:
  - Categories
  - Suppliers
  - Products
  - Stock In
- Sales:
  - Orders

### 3.2 Frontend pages/stores
- Admin pages: dashboard, user management, supplier management, report.
- HR pages: employee management, leave approval, salary management, hr statistics.
- Employee pages: profile, leave request, my salary.
- Warehouse pages: products, import slips, warehouse report.
- Sales pages: export slips, sales report.
- Stores: auth, user, hr, employee, product, supplier, stockIn, sales.

---

## 4. Flow nghiep vu backend -> frontend theo module

## 4.1 Auth flow
1. Frontend login page goi auth API login.
2. Backend xac thuc user, tra access token, set refresh token cookie.
3. Frontend checkAuth goi refresh + profile de khoi tao session.
4. ProtectedRoute chan truy cap neu khong dung role.

## 4.2 Admin - User management flow
1. Admin page goi user store fetchUsers.
2. Store goi user API /users voi params: search, role, isActive, sort, page.
3. Backend users service tra ve data + meta phan trang.
4. UI hien thi danh sach, tim kiem, sap xep, loc, tao/sua/xoa user.
5. Role update qua endpoint /users/:id/role.

## 4.3 Employee flow
### A. Xem/sua thong tin ca nhan
1. Employee profile page goi /employees/me.
2. Update profile goi PATCH /employees/me.
3. Backend update profile theo userId.

### B. Gui don nghi
1. Employee leave page goi create leave request.
2. DTO backend validate type: SICK, ANNUAL, MATERNITY, RESIGNATION.
3. Service tao don voi status PENDING.
4. Employee xem danh sach don cua chinh minh qua /leave-requests/me.

### C. Xem luong va in bang luong
1. Employee salary page goi /salaries/me?month&year.
2. Backend tra danh sach luong theo userId employee.
3. UI filter thang/nam, hien thi cong thuc thanh phan luong.
4. In bang luong dung window.print.

## 4.4 HR Manager flow
### A. Quan ly nhan su
1. HR page goi employees list.
2. Tao nhan vien tao user + profile + employee + jobHistory.
3. Sua nhan vien dong jobHistory cu, tao jobHistory moi theo moc thoi gian.
4. Xoa nhan vien la nghi viec mem: set resignDate, dong job history, doi role user.

### B. Duyet don nghi
1. HR page load /leave-requests.
2. Duyet tu choi qua /leave-requests/:id/status.
3. Service cap nhat status va approvedById.

### C. Tinh luong
1. HR tinh luong qua /salaries/calculate.
2. Service tinh amount = baseSalary + bonus - deduction.
3. Luu bang luong theo employeeId, month, year.

### D. Thong ke HR
1. /employees/statistics/hr-report tra thong ke tong nhan su, nghi viec, tong luong/thuong thang hien tai.

## 4.5 Warehouse Manager flow
### A. Quan ly san pham
1. Product page goi /products voi filter/search/sort/pagination.
2. CRUD product co upload image qua cloudinary.

### B. Quan ly nha cung cap
1. Supplier page goi /suppliers voi search/sort/pagination.
2. CRUD supplier qua suppliers API.

### C. Lap phieu nhap kho
1. Import slip page tao phieu /stock-ins.
2. Service tao details + cap nhat ton kho + tinh gia von binh quan (MAC).

### D. Bao cao kho
1. Warehouse report page goi /products/report/stats theo thang/nam.
2. Service thong ke gia tri nhap, tong ton, danh sach san pham sap het.

## 4.6 Sales Manager flow
### A. Lap phieu xuat
1. Sales page tao order qua /orders.
2. Service kiem tra ton, tru ton kho, tao order va order details.

### B. Bao cao kinh doanh
1. /orders/stats cho thong ke theo thang (hoac year mac dinh thang hien tai).
2. /orders/period cho thong ke theo quy/nam.

---

## 5. Doi chieu yeu cau do an voi hien trang

## 5.1 ADMIN

Yeu cau:
- Giao dien Admin tach biet voi HR/Warehouse/Sales.
- Xem/tim kiem nang cao/sap xep/loc products, suppliers.
- Quan ly user (them xoa sua phan quyen).
- Tao va xem bao cao theo thoi gian.

Hien trang:
- User management: Da co CRUD + role + filter/search/sort/pagination.
- Product management: Da co search/filter/sort/pagination.
- Supplier management: Da co search/sort/pagination.
- Bao cao: Da co sales report theo thoi gian.
- Tach biet giao dien: Chua tach shell hoan toan, hien dang dung chung AppLayout va loc menu theo role.

Ket luan ADMIN: Dat phan lon, can hoan thien tach biet giao dien va chuan hoa report tong hop da module.

## 5.2 NHAN VIEN

Yeu cau:
- Xem/sua thong tin cua minh.
- Nop don nghi phep, om, thai san, nghi viec.
- Xem cach tinh luong + luong thang.
- In bang luong theo thang.
- In bang luong theo nam.

Hien trang:
- Profile me: Da co.
- Leave request 4 loai: Da co.
- Salary me theo month/year: Da co.
- Print payroll month/year: Da co bang window.print.

Luu y logic can sua:
- Delete leave request hien tai chua check owner day du o controller/service theo user context.
- Schema comment LeaveRequest type trong prisma chua cap nhat day du (thieu RESIGNATION trong comment).

Ket luan NHAN VIEN: Dat chuc nang chinh, can fix mot so logic bao mat/nhat quan.

## 5.3 NGUOI QUAN LY (HR_MANAGER)

Yeu cau:
- Them/xoa nhan su.
- Thay doi chuc vu co moc thoi gian, luong thay doi theo.
- Tinh luong theo quy dinh.
- Duyet don nghi.
- Thong ke thang/nam tinh hinh nhan su luong thuong.

Hien trang:
- Them/xoa nhan su: Da co.
- Thay doi chuc vu + luu lich su: Da co jobHistory with start/end.
- Tinh luong: Da co calculate salary.
- Duyet don nghi: Da co.
- Thong ke: Moi ro thong ke thang hien tai, chua co bo loc month/year linh hoat tai API.

Ket luan HR_MANAGER: Dat core flow, thieu thong ke theo khoang thoi gian linh hoat.

## 5.4 QUAN LY KHO

Yeu cau:
- Quan ly thong tin san pham (gia, ton, gia nhap).
- Them/xoa/sua san pham.
- Lap phieu nhap.
- Them/sua/xoa/tim kiem nha cung cap.
- Bao cao thang/nam san pham.

Hien trang:
- Product CRUD + ton kho + costPrice: Da co.
- Stock-in: Da co va co cap nhat gia von.
- Supplier CRUD + search: Da co mot phan, nhung quyen xoa supplier hien de ADMIN only.
- Bao cao kho thang/nam: Da co.

Ket luan WAREHOUSE: Dat phan lon, can sua quyen xoa supplier cho dung yeu cau quan ly kho.

## 5.5 QUAN LY KINH DOANH

Yeu cau:
- Lap phieu xuat.
- Thong ke so luong xuat theo thang/quy/nam.
- Thong ke loi nhuan theo thang/quy/nam.

Hien trang:
- Backend orders tao phieu xuat + thong ke month + period(quarter/year): Da co.
- Frontend sales report co UI month/quarter/year.

Khoang trong quan trong:
- Sales module chua duoc import vao AppModule backend, nguy co endpoint orders khong duoc mount.
- Frontend orderApi goi cac endpoint GET /orders, PATCH /orders/:id/status nhung backend chua khai bao cac route nay.
- UI quarter/year hien tai van goi endpoint /orders/stats chu yeu, chua su dung day du /orders/period.

Ket luan SALES: Chua dong bo backend-frontend, can uu tien fix wiring va endpoint map.

---

## 6. Danh sach can lam (Backlog theo uu tien)

## P0 - Bat buoc lam ngay
1. Import sales order module vao backend app module de kich hoat /orders API.
2. Dong bo order API contract giua frontend va backend:
   - Bo endpoint frontend khong ton tai hoac bo sung backend endpoint tuong ung.
   - Chuyen report quarter/year sang dung /orders/period.
3. Fix bao mat delete leave request:
   - Controller delete can role EMPLOYEE.
   - Service delete phai check don thuoc employee dang dang nhap.
4. Chinh quyen xoa supplier cho WAREHOUSE_MANAGER (neu theo dung yeu cau nghiep vu).

## P1 - Hoan thien nghiep vu
1. Tach biet giao dien Admin voi cac role quan ly bang layout/shell rieng.
2. Them API thong ke HR theo month/year linh hoat.
3. Chuan hoa luong explanation cho employee (hien thi cong thuc ro rang hon tren UI).
4. Chuyen cac page con goi API truc tiep (report pages) ve store de dong bo architecture.

## P2 - Nang cao
1. Dashboard report tong hop cho Admin theo custom date range.
2. Export PDF/Excel cho luong, report kho, report sales.
3. Bo sung audit log viewer cho admin tu SystemLog.

---

## 7. Ke hoach trien khai de xuat

## Sprint 1 (On dinh he thong)
- Fix backend wiring sales module.
- Fix frontend-backend endpoint mismatch sales.
- Fix security leave delete ownership.
- Fix supplier delete role.

## Sprint 2 (Hoan thien yeu cau do an)
- Tach role-based layouts.
- Bo sung HR statistics theo month/year.
- Hoan thien report period quarter/year cho sales UI.

## Sprint 3 (Bao cao va in an)
- Mau in payroll month/year chuan A4.
- Export report (PDF/Excel).
- Admin report tong hop da module.

---

## 8. Definition of Done

- Tat ca flow role chay thong suot tren duong dan frontend va endpoint backend tuong ung.
- Khong con endpoint frontend goi sai route backend.
- Tat ca thao tac nghiep vu quan trong co phan quyen va ownership check.
- Cac trang danh sach co search/filter/sort/pagination nhat quan.
- Cac yeu cau do an duoc danh dau Dat/Partial/Missing ro rang, co task dong backlog.
