# HỆ THỐNG THÔNG TIN QUẢN LÝ DOANH NGHIỆP THƯƠNG MẠI (QL_HTTTDN)

Dự án xây dựng hệ thống quản lý cho một doanh nghiệp thương mại, tích hợp đầy đủ các module Quản lý Nhân sự, Kho, Kinh doanh và Website Bán hàng (Ecommerce).

---

## 1. GIỚI THIỆU DOANH NGHIỆP
- **Tên doanh nghiệp:** Công ty Thương mại & Dịch vụ TechFlow
- **Hoạt động:** Kinh doanh các thiết bị điện tử, công nghệ và linh kiện máy tính.
- **Mô hình:** Doanh nghiệp vừa và nhỏ (SME).
- **Nhân sự:** Bao gồm Ban Giám đốc (Admin), Quản lý Nhân sự, Quản lý Kho, Nhân viên bán hàng và Khách hàng.

## 2. KHẢO SÁT HỆ THỐNG THÔNG TIN
### Bảng câu hỏi khảo sát (15 câu)
1. Quy trình quản lý nhân viên hiện tại có đang sử dụng phần mềm hỗ trợ nào không?
2. Cách thức chấm công và tính lương đang được thực hiện như thế nào?
3. Nhân viên có thể tự xem bảng lương và xin nghỉ phép trực tuyến không?
4. Quy trình nhập hàng từ nhà cung cấp diễn ra như thế nào?
5. Làm thế nào để kiểm soát lượng hàng tồn kho thực tế so với sổ sách?
6. Doanh nghiệp có hệ thống cảnh báo khi hàng trong kho sắp hết không?
7. Quy trình tiếp nhận đơn hàng và xuất kho đang được thực hiện ra sao?
8. Việc báo cáo doanh thu theo tháng/quý/năm mất bao lâu để thực hiện?
9. Doanh nghiệp có đang quản lý thông tin nhà cung cấp một cách tập trung không?
10. Hệ thống hiện tại có hỗ trợ phân quyền truy cập cho từng bộ phận không?
11. Khách hàng có thể tương tác hoặc mua hàng trực tuyến không?
12. Việc tính toán lợi nhuận sau khi trừ chi phí nhập hàng có chính xác không?
13. Hệ thống có cơ chế sao lưu dữ liệu khi gặp sự cố không?
14. Các báo cáo thống kê hiện tại có trực quan và dễ hiểu không?
15. Mong muốn lớn nhất của doanh nghiệp khi triển khai hệ thống mới là gì?

## 3. PHÂN TÍCH HỆ THỐNG
### Bài toán mô tả chi tiết:
Hệ thống cần quản lý toàn diện các quy trình từ nhân sự (tuyển dụng, lương, phép), kho (nhập, tồn, NCC) đến kinh doanh (xuất, doanh thu, lợi nhuận). Đặc biệt, hệ thống phải cung cấp giao diện riêng biệt cho Admin, Quản lý và Khách hàng.

### Sơ đồ hệ thống (DFD):
- **Sơ đồ Ngữ cảnh:** Khách hàng, Nhân viên, Nhà cung cấp tương tác với Hệ thống QL_HTTTDN.
- **DFD Mức đỉnh:** Phân chia thành 4 phân hệ chính: Quản lý Nhân sự, Quản lý Kho, Quản lý Kinh doanh, Quản lý Hệ thống.

## 4. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE)
Hệ thống sử dụng PostgreSQL với Prisma ORM. Các bảng chính bao gồm:
- **User/Profile:** Quản lý tài khoản và thông tin cá nhân.
- **Employee/Salary/Leave:** Quản lý nhân sự và các chế độ.
- **Product/Category/Supplier:** Quản lý danh mục hàng hóa.
- **StockIn/StockOut:** Quản lý luồng hàng hóa.
- **Order/OrderDetail:** Quản lý giao dịch bán hàng.

## 5. CÔNG NGHỆ SỬ DỤNG
- **Backend:** NestJS (Node.js framework), Prisma (ORM), JWT (Auth).
- **Frontend:** ReactJS, TypeScript, Tailwind CSS, Shadcn UI.
- **State Management:** Zustand (Tối ưu hóa performance).
- **Database:** PostgreSQL.

## 6. HƯỚNG DẪN CÀI ĐẶT
1. Clone dự án.
2. Cài đặt dependencies: `npm install` ở cả folder `backend` và `frontend`.
3. Cấu hình file `.env` (Database URL).
4. Chạy migration: `npx prisma migrate dev`.
5. Start backend: `npm run start:dev`.
6. Start frontend: `npm run dev`.
