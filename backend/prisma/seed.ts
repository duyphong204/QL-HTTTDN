import {
  PrismaClient, Role, LeaveType, LeaveStatus,
  StockInStatus, StockOutStatus, StockOutType,
  SalaryStatus, AttendanceStatus, PromotionType, DetailType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function d(dateStr: string) { return new Date(dateStr); }

async function main() {
  console.log('🗑️  Xoá dữ liệu cũ...');
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.promotionProduct.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.stockOutDetail.deleteMany();
  await prisma.stockOut.deleteMany();
  await prisma.orderDetail.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockInDetail.deleteMany();
  await prisma.stockIn.deleteMany();
  await prisma.salaryDetail.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.jobHistory.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.systemLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Đã xoá sạch\n');

  const pw = await bcrypt.hash('123456', 10);

  // ══════════════════════════════════════════════════════════════
  // USERS
  // ══════════════════════════════════════════════════════════════
  console.log('👤 Tạo Users...');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@gmail.com', password: pw, role: Role.ADMIN, isActive: true,
      profile: { create: { fullName: 'Nguyễn Quản Trị', phone: '0901111111', address: '1 Lý Thái Tổ, HCM', dateOfBirth: d('1985-03-10') } },
    },
  });

  const hr = await prisma.user.create({
    data: {
      email: 'hr@gmail.com', password: pw, role: Role.HR_MANAGER, isActive: true,
      profile: { create: { fullName: 'Trần Nhân Sự', phone: '0902222222', address: '2 Lê Lợi, HCM', dateOfBirth: d('1988-07-15') } },
    },
  });

  const wm = await prisma.user.create({
    data: {
      email: 'warehouse@gmail.com', password: pw, role: Role.WAREHOUSE_MANAGER, isActive: true,
      profile: { create: { fullName: 'Võ Kho Hàng', phone: '0903333333', address: '3 Trần Hưng Đạo, HCM', dateOfBirth: d('1987-11-20') } },
    },
  });

  const sm = await prisma.user.create({
    data: {
      email: 'sales@gmail.com', password: pw, role: Role.SALES_MANAGER, isActive: true,
      profile: { create: { fullName: 'Lê Kinh Doanh', phone: '0904444444', address: '4 Nguyễn Huệ, HCM', dateOfBirth: d('1990-02-28') } },
    },
  });

  const uEmp1 = await prisma.user.create({
    data: {
      email: 'nv001@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true,
      profile: { create: { fullName: 'Phạm Văn An', phone: '0905555551', address: '11 Hai Bà Trưng, HCM', dateOfBirth: d('1995-04-12') } },
    },
  });
  const uEmp2 = await prisma.user.create({
    data: {
      email: 'nv002@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true,
      profile: { create: { fullName: 'Đặng Thị Bích', phone: '0905555552', address: '22 Đinh Tiên Hoàng, HCM', dateOfBirth: d('1998-09-05') } },
    },
  });
  const uEmp3 = await prisma.user.create({
    data: {
      email: 'nv003@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true,
      profile: { create: { fullName: 'Hoàng Minh Cường', phone: '0905555553', address: '33 Phan Đình Phùng, HCM', dateOfBirth: d('1992-12-20') } },
    },
  });
  const uEmp4 = await prisma.user.create({
    data: {
      email: 'nv004@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true,
      profile: { create: { fullName: 'Nguyễn Thị Dung', phone: '0905555554', address: '44 Cách Mạng Tháng 8, HCM', dateOfBirth: d('1996-06-30') } },
    },
  });
  const uEmp5 = await prisma.user.create({
    data: {
      email: 'nv005@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true,
      profile: { create: { fullName: 'Trần Quốc Hùng', phone: '0905555555', address: '55 Võ Thị Sáu, HCM', dateOfBirth: d('1991-01-18') } },
    },
  });

  const c1 = await prisma.user.create({
    data: {
      email: 'customer1@gmail.com', password: pw, role: Role.CUSTOMER, isActive: true,
      profile: { create: { fullName: 'Nguyễn Khách Hàng A', phone: '0908888881', address: '111 Tây Sơn, HCM' } },
      cart: { create: {} },
    },
  });
  const c2 = await prisma.user.create({
    data: {
      email: 'customer2@gmail.com', password: pw, role: Role.CUSTOMER, isActive: true,
      profile: { create: { fullName: 'Lý Khách Hàng B', phone: '0908888882', address: '222 Bùi Thị Xuân, HCM' } },
      cart: { create: {} },
    },
  });
  const c3 = await prisma.user.create({
    data: {
      email: 'customer3@gmail.com', password: pw, role: Role.CUSTOMER, isActive: true,
      profile: { create: { fullName: 'Phạm Khách Hàng C', phone: '0908888883', address: '333 Nguyễn Thái Học, HCM' } },
      cart: { create: {} },
    },
  });

  console.log('✅ 4 managers + 5 employees + 3 customers');

  // ══════════════════════════════════════════════════════════════
  // EMPLOYEES
  // LeaveBalance: usedDays tính cộng dồn từ T3+T4+T5
  //   EMP001: T3 ANNUAL 2d + T4 ANNUAL 2d = 4d
  //   EMP002: không dùng annual = 0d
  //   EMP003: T4 ANNUAL 2d = 2d
  //   EMP004: không approved annual = 0d
  //   EMP005: T5 ANNUAL 2d = 2d
  // ══════════════════════════════════════════════════════════════
  console.log('\n👷 Tạo Employee records...');

  const emp1 = await prisma.employee.create({
    data: {
      userId: uEmp1.id, code: 'EMP001', position: 'Nhân viên kho',
      baseSalary: 8_000_000, joinDate: d('2024-01-15'), department: 'Kho',
      leaveBalances: { create: [{ year: 2026, totalDays: 12, usedDays: 4 }] },
    },
  });
  const emp2 = await prisma.employee.create({
    data: {
      userId: uEmp2.id, code: 'EMP002', position: 'Nhân viên bán hàng',
      baseSalary: 7_000_000, joinDate: d('2024-03-01'), department: 'Kinh doanh',
      leaveBalances: { create: [{ year: 2026, totalDays: 12, usedDays: 0 }] },
    },
  });
  const emp3 = await prisma.employee.create({
    data: {
      userId: uEmp3.id, code: 'EMP003', position: 'Trưởng phòng nhân sự',
      baseSalary: 12_000_000, joinDate: d('2023-06-01'), department: 'Nhân sự',
      leaveBalances: { create: [{ year: 2026, totalDays: 12, usedDays: 2 }] },
    },
  });
  const emp4 = await prisma.employee.create({
    data: {
      userId: uEmp4.id, code: 'EMP004', position: 'Kế toán viên',
      baseSalary: 9_000_000, joinDate: d('2024-06-01'), department: 'Kế toán',
      leaveBalances: { create: [{ year: 2026, totalDays: 12, usedDays: 0 }] },
    },
  });
  const emp5 = await prisma.employee.create({
    data: {
      userId: uEmp5.id, code: 'EMP005', position: 'Giám đốc kinh doanh',
      baseSalary: 15_000_000, joinDate: d('2022-09-15'), department: 'Kinh doanh',
      leaveBalances: { create: [{ year: 2026, totalDays: 14, usedDays: 2 }] },
    },
  });
  console.log('✅ 5 employee records');

  // ══════════════════════════════════════════════════════════════
  // JOB HISTORY
  // ══════════════════════════════════════════════════════════════
  console.log('\n📋 Tạo JobHistory...');

  await prisma.jobHistory.createMany({
    data: [
      { employeeId: emp3.id, department: 'Nhân sự', position: 'Nhân viên nhân sự',      baseSalary: 8_000_000,  startDate: d('2023-06-01'), endDate: d('2025-12-31') },
      { employeeId: emp3.id, department: 'Nhân sự', position: 'Trưởng phòng nhân sự',  baseSalary: 12_000_000, startDate: d('2026-01-01'), endDate: null },
      { employeeId: emp5.id, department: 'Kế toán',  position: 'Kế toán trưởng',         baseSalary: 13_000_000, startDate: d('2022-09-15'), endDate: d('2026-02-28') },
      { employeeId: emp5.id, department: 'Kinh doanh', position: 'Giám đốc kinh doanh', baseSalary: 15_000_000, startDate: d('2026-03-01'), endDate: null },
      { employeeId: emp1.id, department: 'Kho',       position: 'Nhân viên kho',          baseSalary: 8_000_000,  startDate: d('2024-01-15'), endDate: null },
      { employeeId: emp2.id, department: 'Kinh doanh', position: 'Nhân viên bán hàng',  baseSalary: 7_000_000,  startDate: d('2024-03-01'), endDate: null },
      { employeeId: emp4.id, department: 'Kế toán',  position: 'Kế toán viên',           baseSalary: 9_000_000,  startDate: d('2024-06-01'), endDate: null },
    ],
  });
  console.log('✅ JobHistory');

  // ══════════════════════════════════════════════════════════════
  // CATEGORIES & SUPPLIERS & PRODUCTS
  // ══════════════════════════════════════════════════════════════
  console.log('\n🏷️ Tạo Categories, Suppliers, Products...');

  const [catDT, catTT, catGD, catPK] = await Promise.all([
    prisma.category.create({ data: { name: 'Điện tử' } }),
    prisma.category.create({ data: { name: 'Thời trang' } }),
    prisma.category.create({ data: { name: 'Đồ gia dụng' } }),
    prisma.category.create({ data: { name: 'Phụ kiện' } }),
  ]);

  const [sup1, sup2, sup3] = await Promise.all([
    prisma.supplier.create({ data: { name: 'Công ty TNHH Kỹ thuật Số VN',  address: '100 Cộng Hoà, HCM',         phone: '0281111111', email: 'ktso@supplier.vn' } }),
    prisma.supplier.create({ data: { name: 'Công ty Thời trang Hà Nội',      address: '200 Bà Triệu, HN',           phone: '0242222222', email: 'thoitrang@supplier.vn' } }),
    prisma.supplier.create({ data: { name: 'Công ty Gia dụng Sài Gòn',       address: '300 Nguyễn Văn Cừ, HCM',    phone: '0283333333', email: 'giadung@supplier.vn' } }),
  ]);

  const [p1, p2, p3, p4, p5, p6, p7, p8] = await Promise.all([
    prisma.product.create({ data: { name: 'Laptop Dell Inspiron 15',      description: 'Core i5, RAM 8GB, SSD 512GB',         price: 18_000_000, costPrice: 13_000_000, stockQuantity: 20, minStock: 5,  categoryId: catDT.id, supplierId: sup1.id } }),
    prisma.product.create({ data: { name: 'iPhone 15 Pro 256GB',           description: 'Apple chip A17 Pro, camera 48MP',      price: 29_000_000, costPrice: 21_000_000, stockQuantity: 15, minStock: 5,  categoryId: catDT.id, supplierId: sup1.id } }),
    prisma.product.create({ data: { name: 'Samsung Galaxy S24',            description: 'Android 14, RAM 8GB',                  price: 19_000_000, costPrice: 14_000_000, stockQuantity: 12, minStock: 5,  categoryId: catDT.id, supplierId: sup1.id } }),
    prisma.product.create({ data: { name: 'Áo thun nam premium',           description: 'Cotton 100%, nhiều màu',               price: 180_000,    costPrice: 90_000,     stockQuantity: 120, minStock: 20, categoryId: catTT.id, supplierId: sup2.id } }),
    prisma.product.create({ data: { name: 'Quần jean nữ skinny',           description: 'Denim co giãn 4 chiều',                price: 380_000,    costPrice: 190_000,    stockQuantity: 80,  minStock: 15, categoryId: catTT.id, supplierId: sup2.id } }),
    prisma.product.create({ data: { name: 'Đồng hồ thông minh Xiaomi',    description: 'Pin 14 ngày, chống nước 5ATM',          price: 2_500_000,  costPrice: 1_600_000,  stockQuantity: 35,  minStock: 10, categoryId: catPK.id, supplierId: sup1.id } }),
    prisma.product.create({ data: { name: 'Nồi cơm điện Sunhouse 1.8L',   description: 'Công suất 700W, nấu nhanh',             price: 650_000,    costPrice: 380_000,    stockQuantity: 40,  minStock: 10, categoryId: catGD.id, supplierId: sup3.id } }),
    prisma.product.create({ data: { name: 'Máy lọc không khí Xiaomi 4 Pro', description: 'Lọc PM2.5, diện tích 48m²',           price: 3_200_000,  costPrice: 2_100_000,  stockQuantity: 18,  minStock: 5,  categoryId: catGD.id, supplierId: sup3.id } }),
  ]);
  console.log('✅ 4 danh mục, 3 nhà cung cấp, 8 sản phẩm');

  // ══════════════════════════════════════════════════════════════
  // PROMOTIONS — T3, T4, T5
  // ══════════════════════════════════════════════════════════════
  console.log('\n🎉 Tạo Promotions...');

  await prisma.promotion.create({
    data: {
      name: 'Khuyến mãi tháng 3 — Điện tử -5%', type: PromotionType.PERCENT, value: 5,
      startAt: d('2026-03-01'), endAt: d('2026-03-31'), isActive: false,
      products: { create: [{ productId: p1.id }, { productId: p3.id }] },
    },
  });
  await prisma.promotion.create({
    data: {
      name: 'Khuyến mãi tháng 4 — Thời trang -20%', type: PromotionType.PERCENT, value: 20,
      startAt: d('2026-04-01'), endAt: d('2026-04-30'), isActive: false,
      products: { create: [{ productId: p4.id }, { productId: p5.id }] },
    },
  });
  await prisma.promotion.create({
    data: {
      name: 'Khuyến mãi tháng 5 — Đồng hồ -300k', type: PromotionType.FIXED, value: 300_000,
      startAt: d('2026-05-01'), endAt: d('2026-05-31'), isActive: true,
      products: { create: [{ productId: p6.id }] },
    },
  });
  await prisma.promotion.create({
    data: {
      name: 'Flash sale máy lọc không khí', type: PromotionType.PERCENT, value: 10,
      startAt: d('2026-05-15'), endAt: d('2026-05-20'), isActive: true,
      products: { create: [{ productId: p8.id }] },
    },
  });
  console.log('✅ 4 promotions');

  // ══════════════════════════════════════════════════════════════
  // STOCK INS — T3, T4, T5
  // ══════════════════════════════════════════════════════════════
  console.log('\n📥 Tạo StockIns...');

  // ── THÁNG 3 ──────────────────────────────────────────────────
  await prisma.stockIn.create({
    data: {
      supplierId: sup1.id, date: d('2026-03-05'), status: StockInStatus.COMPLETED,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 10 * 13_000_000 + 5 * 14_000_000,
      details: { create: [{ productId: p1.id, quantity: 10, price: 13_000_000 }, { productId: p3.id, quantity: 5, price: 14_000_000 }] },
    },
  });
  await prisma.stockIn.create({
    data: {
      supplierId: sup2.id, date: d('2026-03-10'), status: StockInStatus.COMPLETED,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 50 * 90_000 + 30 * 190_000,
      details: { create: [{ productId: p4.id, quantity: 50, price: 90_000 }, { productId: p5.id, quantity: 30, price: 190_000 }] },
    },
  });
  await prisma.stockIn.create({
    data: {
      supplierId: sup3.id, date: d('2026-03-20'), status: StockInStatus.COMPLETED,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 15 * 380_000 + 8 * 2_100_000,
      details: { create: [{ productId: p7.id, quantity: 15, price: 380_000 }, { productId: p8.id, quantity: 8, price: 2_100_000 }] },
    },
  });
  // Phiếu huỷ — test CANCELLED
  await prisma.stockIn.create({
    data: {
      supplierId: sup1.id, date: d('2026-03-28'), status: StockInStatus.CANCELLED,
      createdById: wm.id,
      totalAmount: 5 * 21_000_000,
      details: { create: [{ productId: p2.id, quantity: 5, price: 21_000_000 }] },
    },
  });

  // ── THÁNG 4 ──────────────────────────────────────────────────
  await prisma.stockIn.create({
    data: {
      supplierId: sup1.id, date: d('2026-04-02'), status: StockInStatus.COMPLETED,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 13 * 13_000_000 + 5 * 21_000_000,
      details: { create: [{ productId: p1.id, quantity: 13, price: 13_000_000 }, { productId: p2.id, quantity: 5, price: 21_000_000 }] },
    },
  });
  await prisma.stockIn.create({
    data: {
      supplierId: sup2.id, date: d('2026-04-05'), status: StockInStatus.COMPLETED,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 60 * 90_000 + 40 * 190_000,
      details: { create: [{ productId: p4.id, quantity: 60, price: 90_000 }, { productId: p5.id, quantity: 40, price: 190_000 }] },
    },
  });
  await prisma.stockIn.create({
    data: {
      supplierId: sup3.id, date: d('2026-04-18'), status: StockInStatus.COMPLETED,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 20 * 380_000 + 10 * 2_100_000,
      details: { create: [{ productId: p7.id, quantity: 20, price: 380_000 }, { productId: p8.id, quantity: 10, price: 2_100_000 }] },
    },
  });

  // ── THÁNG 5 ──────────────────────────────────────────────────
  await prisma.stockIn.create({
    data: {
      supplierId: sup1.id, date: d('2026-05-05'), status: StockInStatus.COMPLETED,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 8 * 13_000_000 + 6 * 14_000_000,
      details: { create: [{ productId: p1.id, quantity: 8, price: 13_000_000 }, { productId: p3.id, quantity: 6, price: 14_000_000 }] },
    },
  });
  await prisma.stockIn.create({
    data: {
      supplierId: sup1.id, date: d('2026-05-20'), status: StockInStatus.PENDING,
      createdById: wm.id,
      totalAmount: 10 * 1_600_000,
      details: { create: [{ productId: p6.id, quantity: 10, price: 1_600_000 }] },
    },
  });
  console.log('✅ 9 phiếu nhập (4 T3 gồm 1 CANCELLED | 3 T4 | 2 T5)');

  // ══════════════════════════════════════════════════════════════
  // ORDERS & STOCK OUTS — T3, T4, T5
  // ══════════════════════════════════════════════════════════════
  console.log('\n🛒 Tạo Orders...');

  // ── THÁNG 3 ──────────────────────────────────────────────────
  await prisma.order.create({
    data: {
      userId: c1.id, fullName: 'Nguyễn Khách Hàng A', phone: '0908888881',
      address: '111 Tây Sơn, HCM', totalAmount: 29_540_000,
      status: 'COMPLETED', paymentMethod: 'COD', paymentStatus: 'PAID',
      createdAt: d('2026-03-03'),
      details: { create: [{ productId: p2.id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }, { productId: p4.id, quantity: 3, price: 180_000, costPrice: 90_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 29_540_000, status: StockOutStatus.COMPLETED, costPrice: 21_270_000, details: { create: [{ productId: p2.id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }, { productId: p4.id, quantity: 3, price: 180_000, costPrice: 90_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c2.id, fullName: 'Lý Khách Hàng B', phone: '0908888882',
      address: '222 Bùi Thị Xuân, HCM', totalAmount: 18_000_000,
      status: 'COMPLETED', paymentMethod: 'TRANSFER', paymentStatus: 'PAID',
      createdAt: d('2026-03-08'),
      details: { create: [{ productId: p1.id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 18_000_000, status: StockOutStatus.COMPLETED, costPrice: 13_000_000, details: { create: [{ productId: p1.id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c3.id, fullName: 'Phạm Khách Hàng C', phone: '0908888883',
      address: '333 Nguyễn Thái Học, HCM', totalAmount: 19_760_000,
      status: 'COMPLETED', paymentMethod: 'TRANSFER', paymentStatus: 'PAID',
      createdAt: d('2026-03-15'),
      details: { create: [{ productId: p3.id, quantity: 1, price: 19_000_000, costPrice: 14_000_000 }, { productId: p5.id, quantity: 2, price: 380_000, costPrice: 190_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 19_760_000, status: StockOutStatus.COMPLETED, costPrice: 14_380_000, details: { create: [{ productId: p3.id, quantity: 1, price: 19_000_000, costPrice: 14_000_000 }, { productId: p5.id, quantity: 2, price: 380_000, costPrice: 190_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c1.id, fullName: 'Nguyễn Khách Hàng A', phone: '0908888881',
      address: '111 Tây Sơn, HCM', totalAmount: 5_000_000,
      status: 'COMPLETED', paymentMethod: 'COD', paymentStatus: 'PAID',
      createdAt: d('2026-03-20'),
      details: { create: [{ productId: p6.id, quantity: 2, price: 2_500_000, costPrice: 1_600_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 5_000_000, status: StockOutStatus.COMPLETED, costPrice: 3_200_000, details: { create: [{ productId: p6.id, quantity: 2, price: 2_500_000, costPrice: 1_600_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c2.id, fullName: 'Lý Khách Hàng B', phone: '0908888882',
      address: '222 Bùi Thị Xuân, HCM', totalAmount: 3_200_000,
      status: 'PENDING', paymentMethod: 'COD', paymentStatus: 'UNPAID',
      createdAt: d('2026-03-28'),
      details: { create: [{ productId: p8.id, quantity: 1, price: 3_200_000, costPrice: 2_100_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, totalAmount: 3_200_000, status: StockOutStatus.PENDING, costPrice: 2_100_000, details: { create: [{ productId: p8.id, quantity: 1, price: 3_200_000, costPrice: 2_100_000 }] } }] },
    },
  });

  // ── THÁNG 4 ──────────────────────────────────────────────────
  await prisma.order.create({
    data: {
      userId: c1.id, fullName: 'Nguyễn Khách Hàng A', phone: '0908888881',
      address: '111 Tây Sơn, HCM', totalAmount: 29_360_000,
      status: 'COMPLETED', paymentMethod: 'COD', paymentStatus: 'PAID',
      createdAt: d('2026-04-03'),
      details: { create: [{ productId: p2.id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }, { productId: p4.id, quantity: 2, price: 180_000, costPrice: 90_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 29_360_000, status: StockOutStatus.COMPLETED, costPrice: 21_180_000, details: { create: [{ productId: p2.id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }, { productId: p4.id, quantity: 2, price: 180_000, costPrice: 90_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c2.id, fullName: 'Lý Khách Hàng B', phone: '0908888882',
      address: '222 Bùi Thị Xuân, HCM', totalAmount: 5_200_000,
      status: 'COMPLETED', paymentMethod: 'TRANSFER', paymentStatus: 'PAID',
      createdAt: d('2026-04-07'),
      details: { create: [{ productId: p6.id, quantity: 2, price: 2_500_000, costPrice: 1_600_000 }, { productId: p4.id, quantity: 1, price: 180_000, costPrice: 90_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 5_200_000, status: StockOutStatus.COMPLETED, costPrice: 3_290_000, details: { create: [{ productId: p6.id, quantity: 2, price: 2_500_000, costPrice: 1_600_000 }, { productId: p4.id, quantity: 1, price: 180_000, costPrice: 90_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c3.id, fullName: 'Phạm Khách Hàng C', phone: '0908888883',
      address: '333 Nguyễn Thái Học, HCM', totalAmount: 19_380_000,
      status: 'COMPLETED', paymentMethod: 'TRANSFER', paymentStatus: 'PAID',
      createdAt: d('2026-04-12'),
      details: { create: [{ productId: p3.id, quantity: 1, price: 19_000_000, costPrice: 14_000_000 }, { productId: p5.id, quantity: 1, price: 380_000, costPrice: 190_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 19_380_000, status: StockOutStatus.COMPLETED, costPrice: 14_190_000, details: { create: [{ productId: p3.id, quantity: 1, price: 19_000_000, costPrice: 14_000_000 }, { productId: p5.id, quantity: 1, price: 380_000, costPrice: 190_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c1.id, fullName: 'Nguyễn Khách Hàng A', phone: '0908888881',
      address: '111 Tây Sơn, HCM', totalAmount: 4_350_000,
      status: 'COMPLETED', paymentMethod: 'COD', paymentStatus: 'PAID',
      createdAt: d('2026-04-20'),
      details: { create: [{ productId: p7.id, quantity: 3, price: 650_000, costPrice: 380_000 }, { productId: p6.id, quantity: 1, price: 2_500_000, costPrice: 1_600_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 4_350_000, status: StockOutStatus.COMPLETED, costPrice: 2_740_000, details: { create: [{ productId: p7.id, quantity: 3, price: 650_000, costPrice: 380_000 }, { productId: p6.id, quantity: 1, price: 2_500_000, costPrice: 1_600_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      fullName: 'Khách lẻ', phone: '0900000001',
      address: '123 ABC, HCM', totalAmount: 18_000_000,
      status: 'PENDING', paymentMethod: 'COD', paymentStatus: 'UNPAID',
      createdAt: d('2026-04-25'),
      details: { create: [{ productId: p1.id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, totalAmount: 18_000_000, status: StockOutStatus.PENDING, costPrice: 13_000_000, details: { create: [{ productId: p1.id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }] } }] },
    },
  });

  // ── THÁNG 5 ──────────────────────────────────────────────────
  await prisma.order.create({
    data: {
      userId: c2.id, fullName: 'Lý Khách Hàng B', phone: '0908888882',
      address: '222 Bùi Thị Xuân, HCM', totalAmount: 18_760_000,
      status: 'COMPLETED', paymentMethod: 'TRANSFER', paymentStatus: 'PAID',
      createdAt: d('2026-05-06'),
      details: { create: [{ productId: p1.id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }, { productId: p6.id, quantity: 1, price: 2_200_000, costPrice: 1_600_000 }, { productId: p4.id, quantity: 3, price: 180_000, costPrice: 90_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 18_760_000, status: StockOutStatus.COMPLETED, costPrice: 14_870_000, details: { create: [{ productId: p1.id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }, { productId: p6.id, quantity: 1, price: 2_200_000, costPrice: 1_600_000 }, { productId: p4.id, quantity: 3, price: 180_000, costPrice: 90_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c3.id, fullName: 'Phạm Khách Hàng C', phone: '0908888883',
      address: '333 Nguyễn Thái Học, HCM', totalAmount: 3_580_000,
      status: 'COMPLETED', paymentMethod: 'COD', paymentStatus: 'PAID',
      createdAt: d('2026-05-14'),
      details: { create: [{ productId: p8.id, quantity: 1, price: 2_880_000, costPrice: 2_100_000 }, { productId: p7.id, quantity: 1, price: 650_000, costPrice: 380_000 }, { productId: p5.id, quantity: 1, price: 380_000, costPrice: 190_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, approvedById: wm.id, totalAmount: 3_580_000, status: StockOutStatus.COMPLETED, costPrice: 2_670_000, details: { create: [{ productId: p8.id, quantity: 1, price: 2_880_000, costPrice: 2_100_000 }, { productId: p7.id, quantity: 1, price: 650_000, costPrice: 380_000 }, { productId: p5.id, quantity: 1, price: 380_000, costPrice: 190_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c1.id, fullName: 'Nguyễn Khách Hàng A', phone: '0908888881',
      address: '111 Tây Sơn, HCM', totalAmount: 29_000_000,
      status: 'PENDING', paymentMethod: 'TRANSFER', paymentStatus: 'UNPAID',
      createdAt: d('2026-05-22'),
      details: { create: [{ productId: p2.id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }] },
      stockOuts: { create: [{ type: StockOutType.SALE, createdById: sm.id, totalAmount: 29_000_000, status: StockOutStatus.PENDING, costPrice: 21_000_000, details: { create: [{ productId: p2.id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }] } }] },
    },
  });
  console.log('✅ 13 đơn hàng (5 T3 | 5 T4 | 3 T5)');

  // ══════════════════════════════════════════════════════════════
  // LEAVE REQUESTS — T3, T4, T5
  //
  // Quy tắc ảnh hưởng lương:
  //   ANNUAL, SICK, MATERNITY → không trừ gross
  //   UNPAID                  → trừ gross (actualWorkDays giảm)
  //   REJECTED / PENDING      → không ảnh hưởng gì
  //
  // Tháng 3/2026 — ngày nghỉ dùng cho attendance & salary:
  //   EMP001: ANNUAL 10-11/3 (T3-T4) → APPROVED      → không trừ
  //   EMP002: SICK   18/3    (T4)    → APPROVED      → không trừ
  //   EMP002: UNPAID 26/3    (T5)    → REJECTED      → không ảnh hưởng
  //   EMP003: UNPAID 19-20/3 (T5-T6) → APPROVED     → trừ 2 ngày
  //   EMP004: ANNUAL 25/3    (T4)    → PENDING       → không ảnh hưởng
  //   EMP005: SICK   3-5/3   (T3-T5) → APPROVED     → không trừ
  // ══════════════════════════════════════════════════════════════
  console.log('\n🏖️  Tạo LeaveRequests...');

  // ── THÁNG 3 ──────────────────────────────────────────────────
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-03-10'), endDate: d('2026-03-11'), type: LeaveType.ANNUAL,  reason: 'Việc gia đình',           status: LeaveStatus.APPROVED,  approvedById: hr.id,  totalDays: 2, createdAt: d('2026-03-07') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp2.id, startDate: d('2026-03-18'), endDate: d('2026-03-18'), type: LeaveType.SICK,    reason: 'Đau đầu, sốt nhẹ',        status: LeaveStatus.APPROVED,  approvedById: hr.id,  totalDays: 1, createdAt: d('2026-03-17') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp2.id, startDate: d('2026-03-26'), endDate: d('2026-03-26'), type: LeaveType.UNPAID,  reason: 'Giải quyết việc cá nhân', status: LeaveStatus.REJECTED,  rejectionReason: 'Thiếu nhân sự cuối tháng', approvedById: hr.id, totalDays: 1, createdAt: d('2026-03-24') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp3.id, startDate: d('2026-03-19'), endDate: d('2026-03-20'), type: LeaveType.UNPAID,  reason: 'Thủ tục hành chính',       status: LeaveStatus.APPROVED,  approvedById: hr.id,  totalDays: 2, createdAt: d('2026-03-17') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp4.id, startDate: d('2026-03-25'), endDate: d('2026-03-25'), type: LeaveType.ANNUAL,  reason: 'Đi du lịch ngắn ngày',    status: LeaveStatus.PENDING,   totalDays: 1, createdAt: d('2026-03-22') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp5.id, startDate: d('2026-03-03'), endDate: d('2026-03-05'), type: LeaveType.SICK,    reason: 'Cúm, có đơn bác sĩ',      status: LeaveStatus.APPROVED,  approvedById: hr.id,  totalDays: 3, createdAt: d('2026-03-03') } });

  // ── THÁNG 4 ──────────────────────────────────────────────────
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-04-22'), endDate: d('2026-04-23'), type: LeaveType.ANNUAL, reason: 'Việc gia đình', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 2, createdAt: d('2026-04-18') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp2.id, startDate: d('2026-04-10'), endDate: d('2026-04-11'), type: LeaveType.SICK,   reason: 'Sốt, có giấy của bác sĩ',  status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 2, createdAt: d('2026-04-09') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp2.id, startDate: d('2026-04-28'), endDate: d('2026-04-29'), type: LeaveType.ANNUAL, reason: 'Đi nghỉ lễ',               status: LeaveStatus.PENDING,  totalDays: 2, createdAt: d('2026-04-25') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp3.id, startDate: d('2026-04-24'), endDate: d('2026-04-25'), type: LeaveType.ANNUAL, reason: 'Đám cưới họ hàng',          status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 2, createdAt: d('2026-04-20') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp3.id, startDate: d('2026-04-15'), endDate: d('2026-04-15'), type: LeaveType.SICK,   reason: 'Cảm cúm nhẹ',              status: LeaveStatus.REJECTED, rejectionReason: 'Thiếu nhân sự, sắp xếp ngày khác', approvedById: hr.id, totalDays: 1, createdAt: d('2026-04-14') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp4.id, startDate: d('2026-04-07'), endDate: d('2026-04-08'), type: LeaveType.UNPAID, reason: 'Thủ tục hành chính',       status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 2, createdAt: d('2026-04-05') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp4.id, startDate: d('2026-04-20'), endDate: d('2026-04-20'), type: LeaveType.ANNUAL, reason: 'Đi du lịch gia đình',      status: LeaveStatus.REJECTED, rejectionReason: 'Quyết toán tháng 4, cần nhân sự', approvedById: hr.id, totalDays: 1, createdAt: d('2026-04-18') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp5.id, startDate: d('2026-04-30'), endDate: d('2026-04-30'), type: LeaveType.ANNUAL, reason: 'Họp đối tác',               status: LeaveStatus.PENDING,  totalDays: 1, createdAt: d('2026-04-28') } });

  // ── THÁNG 5 ──────────────────────────────────────────────────
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-05-12'), endDate: d('2026-05-14'), type: LeaveType.UNPAID, reason: 'Giải quyết việc cá nhân', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 3, createdAt: d('2026-05-09') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp2.id, startDate: d('2026-05-20'), endDate: d('2026-05-21'), type: LeaveType.SICK,   reason: 'Khám định kỳ',             status: LeaveStatus.PENDING,  totalDays: 2, createdAt: d('2026-05-19') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp4.id, startDate: d('2026-05-08'), endDate: d('2026-05-08'), type: LeaveType.ANNUAL, reason: 'Đi du lịch gia đình',      status: LeaveStatus.REJECTED, rejectionReason: 'Quyết toán tháng 5, cần nhân sự', approvedById: hr.id, totalDays: 1, createdAt: d('2026-05-06') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp5.id, startDate: d('2026-05-26'), endDate: d('2026-05-27'), type: LeaveType.ANNUAL, reason: 'Hội nghị doanh nghiệp',    status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 2, createdAt: d('2026-05-20') } });

  console.log('✅ 20 đơn nghỉ phép (6 T3 | 8 T4 | 4 T5) — đủ ANNUAL/SICK/UNPAID, đủ APPROVED/REJECTED/PENDING');

  // ══════════════════════════════════════════════════════════════
  // SALARIES — T3, T4, T5
  //
  // Công thức:
  //   workingDays = 26 cho cả T3, T4, T5
  //   grossSalary = round(baseSalary / workingDays * actualWorkDays)
  //   insurance   = round(baseSalary × 10.5%)   [tính trên lương cơ bản, không theo ngày]
  //   tax         = max(0, grossSalary - 11,000,000) × 10%
  //   netSalary   = grossSalary + totalBonus - totalDeduction
  // ══════════════════════════════════════════════════════════════
  console.log('\n💰 Tạo Salaries...');

  // ── THÁNG 3 ──────────────────────────────────────────────────
  // EMP001 T3: ANNUAL 2 ngày → không trừ lương → actualWorkDays=26
  //   gross=8,000,000 | ins=840,000 | tax=0 | net=7,160,000
  await prisma.salary.create({
    data: {
      employeeId: emp1.id, month: 3, year: 2026, baseSalary: 8_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 8_000_000, totalBonus: 0, totalDeduction: 840_000, netSalary: 7_160_000,
      status: SalaryStatus.PAID, paidAt: d('2026-03-28'),
      details: { create: [{ type: DetailType.INSURANCE, amount: 840_000, description: 'BHXH 10.5%' }] },
    },
  });

  // EMP002 T3: SICK 1 ngày → không trừ → actualWorkDays=26
  //   gross=7,000,000 | ins=735,000 | tax=0 | net=6,265,000
  await prisma.salary.create({
    data: {
      employeeId: emp2.id, month: 3, year: 2026, baseSalary: 7_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 7_000_000, totalBonus: 0, totalDeduction: 735_000, netSalary: 6_265_000,
      status: SalaryStatus.PAID, paidAt: d('2026-03-28'),
      details: { create: [{ type: DetailType.INSURANCE, amount: 735_000, description: 'BHXH 10.5%' }] },
    },
  });

  // EMP003 T3: UNPAID 2 ngày (19-20/3) → trừ gross → actualWorkDays=24
  //   gross=round(12M/26*24)=11,076,923 | ins=1,260,000 | tax=round((11076923-11M)*10%)=7,692
  //   totalDeduction=1,267,692 | net=11,076,923-1,267,692=9,809,231
  await prisma.salary.create({
    data: {
      employeeId: emp3.id, month: 3, year: 2026, baseSalary: 12_000_000,
      workingDays: 26, actualWorkDays: 24, unpaidDays: 2,
      grossSalary: 11_076_923, totalBonus: 0, totalDeduction: 1_267_692, netSalary: 9_809_231,
      status: SalaryStatus.PAID, paidAt: d('2026-03-28'),
      details: {
        create: [
          { type: DetailType.INSURANCE, amount: 1_260_000, description: 'BHXH 10.5%' },
          { type: DetailType.TAX,       amount: 7_692,     description: 'Thuế TNCN 10%' },
        ],
      },
    },
  });

  // EMP004 T3: ANNUAL PENDING → không ảnh hưởng → actualWorkDays=26
  //   gross=9,000,000 | ins=945,000 | tax=0 | net=8,055,000
  await prisma.salary.create({
    data: {
      employeeId: emp4.id, month: 3, year: 2026, baseSalary: 9_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 9_000_000, totalBonus: 0, totalDeduction: 945_000, netSalary: 8_055_000,
      status: SalaryStatus.APPROVED,
      details: { create: [{ type: DetailType.INSURANCE, amount: 945_000, description: 'BHXH 10.5%' }] },
    },
  });

  // EMP005 T3: SICK 3 ngày → không trừ; thưởng 1,500,000 (KPI quý)
  //   gross=15,000,000 | ins=1,575,000 | tax=400,000 | bonus=1,500,000
  //   net=15,000,000+1,500,000-1,575,000-400,000=14,525,000
  await prisma.salary.create({
    data: {
      employeeId: emp5.id, month: 3, year: 2026, baseSalary: 15_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 15_000_000, totalBonus: 1_500_000, totalDeduction: 1_975_000, netSalary: 14_525_000,
      status: SalaryStatus.PAID, paidAt: d('2026-03-29'),
      details: {
        create: [
          { type: DetailType.BONUS,     amount: 1_500_000, description: 'Thưởng KPI quý 1' },
          { type: DetailType.INSURANCE, amount: 1_575_000, description: 'BHXH 10.5%' },
          { type: DetailType.TAX,       amount: 400_000,   description: 'Thuế TNCN 10%' },
        ],
      },
    },
  });

  // ── THÁNG 4 ──────────────────────────────────────────────────
  // EMP001 T4: ANNUAL 2 ngày → không trừ
  //   gross=8,000,000 | ins=840,000 | tax=0 | net=7,160,000
  await prisma.salary.create({
    data: {
      employeeId: emp1.id, month: 4, year: 2026, baseSalary: 8_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 8_000_000, totalBonus: 0, totalDeduction: 840_000, netSalary: 7_160_000,
      status: SalaryStatus.PAID, paidAt: d('2026-04-28'),
      details: { create: [{ type: DetailType.INSURANCE, amount: 840_000, description: 'BHXH 10.5%' }] },
    },
  });

  // EMP002 T4: SICK 2 ngày → không trừ
  //   gross=7,000,000 | ins=735,000 | tax=0 | net=6,265,000
  await prisma.salary.create({
    data: {
      employeeId: emp2.id, month: 4, year: 2026, baseSalary: 7_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 7_000_000, totalBonus: 0, totalDeduction: 735_000, netSalary: 6_265_000,
      status: SalaryStatus.APPROVED,
      details: { create: [{ type: DetailType.INSURANCE, amount: 735_000, description: 'BHXH 10.5%' }] },
    },
  });

  // EMP003 T4: ANNUAL 2 ngày → không trừ; thưởng 500,000
  //   gross=12,000,000 | ins=1,260,000 | tax=100,000 | bonus=500,000
  //   net=12,000,000+500,000-1,260,000-100,000=11,140,000
  await prisma.salary.create({
    data: {
      employeeId: emp3.id, month: 4, year: 2026, baseSalary: 12_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 12_000_000, totalBonus: 500_000, totalDeduction: 1_360_000, netSalary: 11_140_000,
      status: SalaryStatus.PAID, paidAt: d('2026-04-28'),
      details: {
        create: [
          { type: DetailType.BONUS,     amount: 500_000,   description: 'Thưởng hoàn thành KPI tháng 4' },
          { type: DetailType.INSURANCE, amount: 1_260_000, description: 'BHXH 10.5%' },
          { type: DetailType.TAX,       amount: 100_000,   description: 'Thuế TNCN 10%' },
        ],
      },
    },
  });

  // EMP004 T4: UNPAID 2 ngày (07-08/04) → trừ gross
  //   actualWorkDays=24 | gross=round(9M/26*24)=8,307,692
  //   ins=945,000 | tax=0 | net=7,362,692
  await prisma.salary.create({
    data: {
      employeeId: emp4.id, month: 4, year: 2026, baseSalary: 9_000_000,
      workingDays: 26, actualWorkDays: 24, unpaidDays: 2,
      grossSalary: 8_307_692, totalBonus: 0, totalDeduction: 945_000, netSalary: 7_362_692,
      status: SalaryStatus.APPROVED,
      details: { create: [{ type: DetailType.INSURANCE, amount: 945_000, description: 'BHXH 10.5%' }] },
    },
  });

  // EMP005 T4: full attendance; thưởng 1,000,000
  //   gross=15,000,000 | ins=1,575,000 | tax=400,000 | bonus=1,000,000
  //   net=15,000,000+1,000,000-1,575,000-400,000=14,025,000
  await prisma.salary.create({
    data: {
      employeeId: emp5.id, month: 4, year: 2026, baseSalary: 15_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 15_000_000, totalBonus: 1_000_000, totalDeduction: 1_975_000, netSalary: 14_025_000,
      status: SalaryStatus.PAID, paidAt: d('2026-04-29'),
      details: {
        create: [
          { type: DetailType.BONUS,     amount: 1_000_000, description: 'Thưởng doanh số tháng 4' },
          { type: DetailType.INSURANCE, amount: 1_575_000, description: 'BHXH 10.5%' },
          { type: DetailType.TAX,       amount: 400_000,   description: 'Thuế TNCN 10%' },
        ],
      },
    },
  });

  // ── THÁNG 5 ──────────────────────────────────────────────────
  // EMP001 T5: UNPAID 3 ngày (12-14/05) → trừ gross
  //   actualWorkDays=23 | gross=round(8M/26*23)=7,076,923
  //   ins=840,000 | tax=0 | net=6,236,923
  await prisma.salary.create({
    data: {
      employeeId: emp1.id, month: 5, year: 2026, baseSalary: 8_000_000,
      workingDays: 26, actualWorkDays: 23, unpaidDays: 3,
      grossSalary: 7_076_923, totalBonus: 0, totalDeduction: 840_000, netSalary: 6_236_923,
      status: SalaryStatus.PENDING,
      details: { create: [{ type: DetailType.INSURANCE, amount: 840_000, description: 'BHXH 10.5%' }] },
    },
  });

  // EMP002 T5: SICK PENDING → không ảnh hưởng; full 26 ngày
  //   gross=7,000,000 | ins=735,000 | tax=0 | net=6,265,000
  await prisma.salary.create({
    data: {
      employeeId: emp2.id, month: 5, year: 2026, baseSalary: 7_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 7_000_000, totalBonus: 0, totalDeduction: 735_000, netSalary: 6_265_000,
      status: SalaryStatus.PENDING,
      details: { create: [{ type: DetailType.INSURANCE, amount: 735_000, description: 'BHXH 10.5%' }] },
    },
  });

  // EMP003 T5: không nghỉ; thưởng 800,000
  //   gross=12,000,000 | ins=1,260,000 | tax=100,000 | bonus=800,000
  //   net=12,000,000+800,000-1,260,000-100,000=11,440,000
  await prisma.salary.create({
    data: {
      employeeId: emp3.id, month: 5, year: 2026, baseSalary: 12_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 12_000_000, totalBonus: 800_000, totalDeduction: 1_360_000, netSalary: 11_440_000,
      status: SalaryStatus.PENDING,
      details: {
        create: [
          { type: DetailType.BONUS,     amount: 800_000,   description: 'Thưởng KPI tháng 5' },
          { type: DetailType.INSURANCE, amount: 1_260_000, description: 'BHXH 10.5%' },
          { type: DetailType.TAX,       amount: 100_000,   description: 'Thuế TNCN 10%' },
        ],
      },
    },
  });

  // EMP004 T5: ANNUAL REJECTED → full 26 ngày
  //   gross=9,000,000 | ins=945,000 | tax=0 | net=8,055,000
  await prisma.salary.create({
    data: {
      employeeId: emp4.id, month: 5, year: 2026, baseSalary: 9_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 9_000_000, totalBonus: 0, totalDeduction: 945_000, netSalary: 8_055_000,
      status: SalaryStatus.PENDING,
      details: { create: [{ type: DetailType.INSURANCE, amount: 945_000, description: 'BHXH 10.5%' }] },
    },
  });

  // EMP005 T5: ANNUAL 2 ngày → không trừ
  //   gross=15,000,000 | ins=1,575,000 | tax=400,000 | net=13,025,000
  await prisma.salary.create({
    data: {
      employeeId: emp5.id, month: 5, year: 2026, baseSalary: 15_000_000,
      workingDays: 26, actualWorkDays: 26, unpaidDays: 0,
      grossSalary: 15_000_000, totalBonus: 0, totalDeduction: 1_975_000, netSalary: 13_025_000,
      status: SalaryStatus.PENDING,
      details: {
        create: [
          { type: DetailType.INSURANCE, amount: 1_575_000, description: 'BHXH 10.5%' },
          { type: DetailType.TAX,       amount: 400_000,   description: 'Thuế TNCN 10%' },
        ],
      },
    },
  });

  console.log('✅ 15 bảng lương (T3: 3 PAID + 2 APPROVED | T4: 3 PAID + 2 APPROVED | T5: 5 PENDING)');

  // ══════════════════════════════════════════════════════════════
  // ATTENDANCE — T3, T4, T5 (T2-T7 chỉ, bỏ CN)
  //
  //  Tháng 3: workingDays=26
  //    EMP001: LEAVE  10,11/3 (ANNUAL)
  //    EMP002: LEAVE  18/3    (SICK)
  //    EMP003: ABSENT 19,20/3 (UNPAID)
  //    EMP004: PRESENT tất cả (ANNUAL PENDING chưa nghỉ)
  //    EMP005: LEAVE  3,4,5/3 (SICK)
  //
  //  Tháng 4: workingDays=26
  //    EMP001: LEAVE  22,23/4 (ANNUAL)
  //    EMP002: LEAVE  10,11/4 (SICK); LATE 14/4 (demo)
  //    EMP003: LEAVE  24,25/4 (ANNUAL); LATE 8/4 (demo)
  //    EMP004: ABSENT 7,8/4   (UNPAID)
  //    EMP005: PRESENT tất cả (ANNUAL PENDING 30/4 chưa duyệt)
  //
  //  Tháng 5: workingDays=26
  //    EMP001: ABSENT 12,13,14/5 (UNPAID)
  //    EMP002: PRESENT tất cả   (SICK PENDING chưa duyệt)
  //    EMP003: PRESENT tất cả
  //    EMP004: PRESENT tất cả   (ANNUAL REJECTED)
  //    EMP005: LEAVE  26,27/5   (ANNUAL)
  // ══════════════════════════════════════════════════════════════
  console.log('\n📋 Tạo Attendance T3-T5...');

  type EmpAttendance = {
    emp: typeof emp1;
    absent3?: number[]; leave3?: number[]; late3?: number[];
    absent4?: number[]; leave4?: number[]; late4?: number[];
    absent5?: number[]; leave5?: number[]; late5?: number[];
  };

  const attendanceConfig: EmpAttendance[] = [
    { emp: emp1, leave3: [10, 11],     leave4: [22, 23],     absent5: [12, 13, 14] },
    { emp: emp2, leave3: [18],         leave4: [10, 11], late4: [14] },
    { emp: emp3, absent3: [19, 20],   leave4: [24, 25], late4: [8] },
    { emp: emp4 },
    { emp: emp5, leave3: [3, 4, 5],   leave5: [26, 27] },
  ];

  for (const cfg of attendanceConfig) {
    for (const [month, days] of [[3, 31], [4, 30], [5, 31]] as [number, number][]) {
      const absent = month === 3 ? (cfg.absent3 ?? []) : month === 4 ? (cfg.absent4 ?? []) : (cfg.absent5 ?? []);
      const leave  = month === 3 ? (cfg.leave3  ?? []) : month === 4 ? (cfg.leave4  ?? []) : (cfg.leave5  ?? []);
      const late   = month === 3 ? (cfg.late3   ?? []) : month === 4 ? (cfg.late4   ?? []) : (cfg.late5   ?? []);

      for (let day = 1; day <= days; day++) {
        const date = new Date(2026, month - 1, day);
        if (date.getDay() === 0) continue; // bỏ Chủ Nhật

        let status: AttendanceStatus;
        let checkIn: Date | undefined;
        let checkOut: Date | undefined;

        if (absent.includes(day)) {
          status = AttendanceStatus.ABSENT;
        } else if (leave.includes(day)) {
          status = AttendanceStatus.LEAVE;
        } else if (late.includes(day)) {
          status = AttendanceStatus.LATE;
          checkIn  = new Date(date.getTime() + 8.5 * 3_600_000);
          checkOut = new Date(date.getTime() + 17.5 * 3_600_000);
        } else {
          status = AttendanceStatus.PRESENT;
          checkIn  = new Date(date.getTime() + 8 * 3_600_000);
          checkOut = new Date(date.getTime() + 17 * 3_600_000);
        }

        await prisma.attendance.create({
          data: { employeeId: cfg.emp.id, date, status, checkIn, checkOut },
        });
      }
    }
  }
  console.log('✅ Attendance T3-T5 cho 5 nhân viên');

  // ══════════════════════════════════════════════════════════════
  // CART ITEMS
  // ══════════════════════════════════════════════════════════════
  const cart1 = await prisma.cart.findUnique({ where: { userId: c1.id } });
  const cart2 = await prisma.cart.findUnique({ where: { userId: c2.id } });
  const cart3 = await prisma.cart.findUnique({ where: { userId: c3.id } });
  if (cart1) await prisma.cartItem.createMany({ data: [{ cartId: cart1.id, productId: p3.id, quantity: 1 }, { cartId: cart1.id, productId: p7.id, quantity: 2 }] });
  if (cart2) await prisma.cartItem.createMany({ data: [{ cartId: cart2.id, productId: p6.id, quantity: 1 }] });
  if (cart3) await prisma.cartItem.createMany({ data: [{ cartId: cart3.id, productId: p1.id, quantity: 1 }, { cartId: cart3.id, productId: p8.id, quantity: 1 }] });

  // ══════════════════════════════════════════════════════════════
  // SYSTEM LOGS
  // ══════════════════════════════════════════════════════════════
  await prisma.systemLog.createMany({
    data: [
      { userId: admin.id, action: 'LOGIN',              details: 'Admin đăng nhập tháng 3',              createdAt: d('2026-03-01T08:00:00') },
      { userId: wm.id,    action: 'CREATE_STOCK_IN',    details: 'Tạo phiếu nhập T3 từ sup1',             createdAt: d('2026-03-05T09:00:00') },
      { userId: sm.id,    action: 'CREATE_ORDER',       details: 'Tạo đơn hàng T3 #1',                   createdAt: d('2026-03-03T10:00:00') },
      { userId: hr.id,    action: 'APPROVE_LEAVE',      details: 'Duyệt nghỉ phép EMP001 T3',            createdAt: d('2026-03-07T11:00:00') },
      { userId: hr.id,    action: 'CALCULATE_SALARY',   details: 'Chốt lương T3/2026',                   createdAt: d('2026-03-26T14:00:00') },
      { userId: admin.id, action: 'APPROVE_STOCK_IN',   details: 'Duyệt phiếu nhập kho T3',              createdAt: d('2026-03-05T15:00:00') },
      { userId: admin.id, action: 'LOGIN',              details: 'Admin đăng nhập tháng 4',              createdAt: d('2026-04-01T08:00:00') },
      { userId: wm.id,    action: 'CREATE_STOCK_IN',    details: 'Tạo phiếu nhập T4 từ sup1',             createdAt: d('2026-04-02T09:15:00') },
      { userId: sm.id,    action: 'CREATE_ORDER',       details: 'Tạo đơn hàng T4 #1',                   createdAt: d('2026-04-03T10:30:00') },
      { userId: hr.id,    action: 'APPROVE_LEAVE',      details: 'Duyệt nghỉ phép EMP001 T4',            createdAt: d('2026-04-18T11:00:00') },
      { userId: hr.id,    action: 'CALCULATE_SALARY',   details: 'Chốt lương T4/2026',                   createdAt: d('2026-04-26T14:00:00') },
      { userId: admin.id, action: 'APPROVE_STOCK_IN',   details: 'Duyệt phiếu nhập kho T4',              createdAt: d('2026-04-02T15:00:00') },
      { userId: wm.id,    action: 'CREATE_STOCK_IN',    details: 'Tạo phiếu nhập T5',                    createdAt: d('2026-05-05T09:00:00') },
      { userId: hr.id,    action: 'APPROVE_LEAVE',      details: 'Duyệt nghỉ không lương EMP001 T5',    createdAt: d('2026-05-09T10:00:00') },
      { userId: sm.id,    action: 'CREATE_ORDER',       details: 'Tạo đơn hàng T5',                     createdAt: d('2026-05-06T11:00:00') },
    ],
  });

  // ══════════════════════════════════════════════════════════════
  // TỔNG KẾT
  // ══════════════════════════════════════════════════════════════
  console.log('\n✨ Seed hoàn tất!\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📌 TÀI KHOẢN TEST (mật khẩu: 123456)');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  admin@gmail.com       → ADMIN');
  console.log('  hr@gmail.com          → HR_MANAGER');
  console.log('  warehouse@gmail.com   → WAREHOUSE_MANAGER');
  console.log('  sales@gmail.com       → SALES_MANAGER');
  console.log('  nv001@gmail.com       → EMP001 Phạm Văn An     (ANNUAL T3, T4 | UNPAID T5)');
  console.log('  nv002@gmail.com       → EMP002 Đặng Thị Bích   (SICK T3, T4 | PENDING T5)');
  console.log('  nv003@gmail.com       → EMP003 Hoàng Minh Cường (UNPAID T3 | ANNUAL T4)');
  console.log('  nv004@gmail.com       → EMP004 Nguyễn Thị Dung  (UNPAID T4 | thăng chức 1/1)');
  console.log('  nv005@gmail.com       → EMP005 Trần Quốc Hùng   (SICK T3 | ANNUAL T5 | đổi phòng 1/3)');
  console.log('  customer1@gmail.com   → CUSTOMER');
  console.log('  customer2@gmail.com   → CUSTOMER');
  console.log('  customer3@gmail.com   → CUSTOMER');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 DỮ LIỆU (T3 = tháng 3 | T4 = tháng 4 | T5 = tháng 5)');
  console.log('');
  console.log('💰 LƯƠNG (15 bảng):');
  console.log('  T3: EMP001/002/003/005=PAID | EMP004=APPROVED');
  console.log('  T4: EMP001/003/005=PAID    | EMP002/004=APPROVED');
  console.log('  T5: tất cả PENDING');
  console.log('  Trừ lương: EMP003 T3 (2 ngày UNPAID, gross=11,076,923đ)');
  console.log('             EMP004 T4 (2 ngày UNPAID, gross=8,307,692đ)');
  console.log('             EMP001 T5 (3 ngày UNPAID, gross=7,076,923đ)');
  console.log('');
  console.log('🏖️  NGHỈ PHÉP (20 đơn):');
  console.log('  Trạng thái: APPROVED / REJECTED / PENDING — đủ cả 3');
  console.log('  Loại: ANNUAL / SICK / UNPAID — đủ cả 3');
  console.log('  T3: 6 đơn | T4: 8 đơn | T5: 4 đơn');
  console.log('');
  console.log('📥 NHẬP KHO (9 phiếu):');
  console.log('  T3: 3 COMPLETED + 1 CANCELLED');
  console.log('  T4: 3 COMPLETED');
  console.log('  T5: 1 COMPLETED + 1 PENDING');
  console.log('');
  console.log('🛒 ĐƠN HÀNG (13 đơn):');
  console.log('  T3: 4 COMPLETED + 1 PENDING');
  console.log('  T4: 4 COMPLETED + 1 PENDING');
  console.log('  T5: 2 COMPLETED + 1 PENDING');
  console.log('');
  console.log('📦 SẢN PHẨM: 8 | DANH MỤC: 4 | NHÀ CC: 3 | KHUYẾN MÃI: 4');
  console.log('═══════════════════════════════════════════════════════════════');
}

main()
  .catch((e) => { console.error('❌ Lỗi seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
