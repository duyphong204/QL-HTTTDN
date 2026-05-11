import bcrypt from 'bcrypt';
import { PrismaClient, Role, LeaveType, LeaveStatus, SalaryStatus } from '@prisma/client';

const prisma = new PrismaClient();
function d(dateStr: string) { return new Date(dateStr); }

async function resetTables() {
  // delete in order to avoid FK constraint issues
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
}

function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0); // exclusive
  return { start, end };
}

// ---- Salary calculation helpers (mirror salary.utils.ts logic) ----
const INSURANCE_RATE = 0.105;
const TAX_ALLOWANCE = 11_000_000;
const TAX_BRACKETS = [
  { limit: 5_000_000, rate: 0.05 },
  { limit: 10_000_000, rate: 0.1 },
  { limit: 18_000_000, rate: 0.15 },
  { limit: 32_000_000, rate: 0.2 },
  { limit: 52_000_000, rate: 0.25 },
  { limit: 80_000_000, rate: 0.3 },
  { limit: Infinity, rate: 0.35 },
];

function calcStandardDays(month: number, year: number): number {
  const end = new Date(year, month, 0);
  let count = 0;
  const cur = new Date(year, month - 1, 1);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow >= 1 && dow <= 5) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function calcUnpaidDays(
  leaves: { startDate: Date; endDate: Date; type: string }[],
  month: number,
  year: number,
): number {
  const mStart = new Date(year, month - 1, 1);
  const mEnd = new Date(year, month, 0, 23, 59, 59, 999);
  let count = 0;
  for (const leave of leaves) {
    if (leave.type !== 'UNPAID') continue;
    const s = new Date(leave.startDate) < mStart ? new Date(mStart) : new Date(leave.startDate);
    const e = new Date(leave.endDate) > mEnd ? new Date(mEnd) : new Date(leave.endDate);
    const cur = new Date(s);
    while (cur <= e) {
      const dow = cur.getDay();
      if (dow >= 1 && dow <= 5) count++;
      cur.setDate(cur.getDate() + 1);
    }
  }
  return count;
}

function calcWeekdays(start: Date, end: Date): number {
  if (end < start) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow >= 1 && dow <= 5) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function calcProgressiveTax(taxable: number): number {
  if (taxable <= 0) return 0;
  let tax = 0, prev = 0;
  for (const { limit, rate } of TAX_BRACKETS) {
    if (taxable <= prev) break;
    tax += Math.min(taxable - prev, limit - prev) * rate;
    prev = limit;
  }
  return Math.round(tax);
}

async function main() {
  console.log('🗑️  Xoá dữ liệu cũ (nếu có)...');
  await resetTables();
  console.log('✅ Đã xoá sạch (tạm thời)');

  const pw = await bcrypt.hash('123456', 10);

  console.log('\n👥 Tạo Users + Profiles (4 managers + 6 employees + 5 customers)');
  const admin = await prisma.user.create({ data: { email: 'admin@gmail.com', password: pw, role: Role.ADMIN, isActive: true, profile: { create: { fullName: 'Nguyễn Quản Trị', phone: '0901111111', address: '1 Lý Thái Tổ, HCM', dateOfBirth: d('1985-03-10') } } } });
  const hr = await prisma.user.create({ data: { email: 'hr@gmail.com', password: pw, role: Role.HR_MANAGER, isActive: true, profile: { create: { fullName: 'Trần Nhân Sự', phone: '0902222222', address: '2 Lê Lợi, HCM', dateOfBirth: d('1988-07-15') } } } });
  const wm = await prisma.user.create({ data: { email: 'warehouse@gmail.com', password: pw, role: Role.WAREHOUSE_MANAGER, isActive: true, profile: { create: { fullName: 'Võ Kho Hàng', phone: '0903333333', address: '3 Trần Hưng Đạo, HCM', dateOfBirth: d('1987-11-20') } } } });
  const sm = await prisma.user.create({ data: { email: 'sales@gmail.com', password: pw, role: Role.SALES_MANAGER, isActive: true, profile: { create: { fullName: 'Lê Kinh Doanh', phone: '0904444444', address: '4 Nguyễn Huệ, HCM', dateOfBirth: d('1990-02-28') } } } });

  // Create employee records for manager users so they appear in Employee flows
  const hrEmp = await prisma.employee.create({ data: { userId: hr.id, code: 'HR001', position: 'Quản lý Nhân sự', baseSalary: 15_000_000, joinDate: d('2020-01-01'), department: 'Nhân sự', leaveBalances: { create: [{ year: 2026, totalDays: 14, usedDays: 0 }] } } });
  const wmEmp = await prisma.employee.create({ data: { userId: wm.id, code: 'WM001', position: 'Quản lý Kho', baseSalary: 14_000_000, joinDate: d('2021-03-01'), department: 'Kho vận', leaveBalances: { create: [{ year: 2026, totalDays: 14, usedDays: 0 }] } } });
  const smEmp = await prisma.employee.create({ data: { userId: sm.id, code: 'SM001', position: 'Quản lý Kinh doanh', baseSalary: 16_000_000, joinDate: d('2020-06-15'), department: 'Kinh doanh', leaveBalances: { create: [{ year: 2026, totalDays: 14, usedDays: 0 }] } } });

  const uEmp1 = await prisma.user.create({ data: { email: 'nv001@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true, profile: { create: { fullName: 'Phạm Văn An', phone: '0905555551', address: '11 Hai Bà Trưng, HCM', dateOfBirth: d('1995-04-12') } } } });
  const uEmp2 = await prisma.user.create({ data: { email: 'nv002@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true, profile: { create: { fullName: 'Đặng Thị Bích', phone: '0905555552', address: '22 Đinh Tiên Hoàng, HCM', dateOfBirth: d('1998-09-05') } } } });
  const uEmp3 = await prisma.user.create({ data: { email: 'nv003@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true, profile: { create: { fullName: 'Hoàng Minh Cường', phone: '0905555553', address: '33 Phan Đình Phùng, HCM', dateOfBirth: d('1992-12-20') } } } });
  const uEmp4 = await prisma.user.create({ data: { email: 'nv004@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true, profile: { create: { fullName: 'Nguyễn Thị Dung', phone: '0905555554', address: '44 Cách Mạng Tháng 8, HCM', dateOfBirth: d('1996-06-30') } } } });
  const uEmp5 = await prisma.user.create({ data: { email: 'nv005@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true, profile: { create: { fullName: 'Trần Quốc Hùng', phone: '0905555555', address: '55 Võ Thị Sáu, HCM', dateOfBirth: d('1991-01-18') } } } });
  const uEmp6 = await prisma.user.create({ data: { email: 'nv006@gmail.com', password: pw, role: Role.EMPLOYEE, isActive: true, profile: { create: { fullName: 'Lương Thị Hoa', phone: '0905555556', address: '66 Lê Hồng Phong, HCM', dateOfBirth: d('1994-08-25') } } } });

  const c1 = await prisma.user.create({ data: { email: 'customer1@gmail.com', password: pw, role: Role.CUSTOMER, isActive: true, profile: { create: { fullName: 'Nguyễn Khách A', phone: '0908888881', address: '111 Tây Sơn, HCM' } }, cart: { create: {} } } });
  const c2 = await prisma.user.create({ data: { email: 'customer2@gmail.com', password: pw, role: Role.CUSTOMER, isActive: true, profile: { create: { fullName: 'Lý Khách B', phone: '0908888882', address: '222 Bùi Thị Xuân, HCM' } }, cart: { create: {} } } });
  const c3 = await prisma.user.create({ data: { email: 'customer3@gmail.com', password: pw, role: Role.CUSTOMER, isActive: true, profile: { create: { fullName: 'Phạm Khách C', phone: '0908888883', address: '333 Nguyễn Thái Học, HCM' } }, cart: { create: {} } } });
  const c4 = await prisma.user.create({ data: { email: 'customer4@gmail.com', password: pw, role: Role.CUSTOMER, isActive: true, profile: { create: { fullName: 'Võ Khách D', phone: '0908888884', address: '444 Trần Hưng Đạo, HCM' } }, cart: { create: {} } } });
  const c5 = await prisma.user.create({ data: { email: 'customer5@gmail.com', password: pw, role: Role.CUSTOMER, isActive: true, profile: { create: { fullName: 'Hoàng Khách E', phone: '0908888885', address: '555 Nguyễn Huệ, HCM' } }, cart: { create: {} } } });

  console.log('✅ Users created');

  console.log('\n👷 Tạo Employees: 1 nhân viên + 3 managers (HR/WH/Sales)');
  // Managers already have employee rows: hrEmp, wmEmp, smEmp
  // Create a single regular employee (emp1). The rest of the roles use manager employee rows.
  const emp1 = await prisma.employee.create({ data: { userId: uEmp1.id, code: 'EMP001', position: 'Nhân viên hành chính', baseSalary: 10_000_000, joinDate: d('2024-01-15'), department: 'Nhân viên', leaveBalances: { create: [{ year: 2026, totalDays: 12, usedDays: 0 }] } } });
  console.log('✅ Employees created (1 regular + 3 managers)');

  console.log('\n📋 Tạo JobHistory (cho các employee hiện có)');
  await prisma.jobHistory.createMany({
    data: [
      // historical progression for the regular employee
      { employeeId: emp1.id, department: 'Kinh doanh', position: 'Nhân viên bán hàng', baseSalary: 7_000_000, startDate: d('2022-09-15'), endDate: d('2025-12-31') },
      { employeeId: emp1.id, department: 'Kinh doanh', position: 'Trưởng phòng bán hàng', baseSalary: 12_000_000, startDate: d('2026-01-01'), endDate: null },
      // HR manager job history sample
      { employeeId: hrEmp.id, department: 'Hành chính', position: 'Nhân viên văn phòng', baseSalary: 7_500_000, startDate: d('2023-06-01'), endDate: d('2025-12-31') },
      { employeeId: hrEmp.id, department: 'Nhân sự', position: 'Quản lý Nhân sự', baseSalary: 15_000_000, startDate: d('2026-01-01'), endDate: null },
    ]
  });
  console.log('✅ JobHistory created');

  console.log('\n🏷️  Tạo 5 Categories, 5 Suppliers, 12 Products (điện tử)');
  const [cat1, cat2, cat3, cat4, cat5] = await Promise.all([
    prisma.category.create({ data: { name: 'Cục sạc' } }),
    prisma.category.create({ data: { name: 'Dây sạc' } }),
    prisma.category.create({ data: { name: 'Chuột không dây' } }),
    prisma.category.create({ data: { name: 'Tai nghe' } }),
    prisma.category.create({ data: { name: 'Phụ kiện điện tử' } }),
  ]);
  const [sup1, sup2, sup3, sup4, sup5] = await Promise.all([
    prisma.supplier.create({ data: { name: 'Công ty Kỹ thuật Số VN', address: '100 Cộng Hoà, HCM', phone: '0281111111', email: 'ktso@supplier.vn' } }),
    prisma.supplier.create({ data: { name: 'Công ty Thời trang Hà Nội', address: '200 Bà Triệu, HN', phone: '0242222222', email: 'thoitrang@supplier.vn' } }),
    prisma.supplier.create({ data: { name: 'Công ty Gia dụng Sài Gòn', address: '300 Nguyễn Văn Cừ, HCM', phone: '0283333333', email: 'giadung@supplier.vn' } }),
    prisma.supplier.create({ data: { name: 'Công ty Sắc đẹp Á Châu', address: '400 Lê Lợi, HN', phone: '0244444444', email: 'sacdepmn@supplier.vn' } }),
    prisma.supplier.create({ data: { name: 'Công ty Thể thao Quốc tế', address: '500 Trần Phú, HCM', phone: '0285555555', email: 'theorthao@supplier.vn' } }),
  ]);
  const products = await Promise.all([
    prisma.product.create({ data: { name: 'Cục sạc nhanh 20W USB-C', description: 'Sạc nhanh cho điện thoại, hỗ trợ PD', price: 250_000, costPrice: 140_000, stockQuantity: 60, minStock: 10, categoryId: cat1.id, supplierId: sup1.id } }),
    prisma.product.create({ data: { name: 'Cục sạc nhanh 65W đa cổng', description: 'Sạc laptop, tablet, điện thoại', price: 690_000, costPrice: 420_000, stockQuantity: 35, minStock: 8, categoryId: cat1.id, supplierId: sup1.id } }),
    prisma.product.create({ data: { name: 'Cục sạc dự phòng 10000mAh', description: 'Dung lượng lớn, nhỏ gọn', price: 520_000, costPrice: 310_000, stockQuantity: 50, minStock: 10, categoryId: cat1.id, supplierId: sup1.id } }),
    prisma.product.create({ data: { name: 'Dây sạc USB-C to USB-C 1m', description: 'Dây sạc bọc dù, truyền dữ liệu tốt', price: 120_000, costPrice: 60_000, stockQuantity: 180, minStock: 40, categoryId: cat2.id, supplierId: sup2.id } }),
    prisma.product.create({ data: { name: 'Dây sạc Lightning 1m', description: 'Dùng cho iPhone, lõi đồng bền', price: 160_000, costPrice: 80_000, stockQuantity: 150, minStock: 35, categoryId: cat2.id, supplierId: sup2.id } }),
    prisma.product.create({ data: { name: 'Dây sạc Type-C 2m', description: 'Chiều dài 2m, sạc nhanh ổn định', price: 180_000, costPrice: 95_000, stockQuantity: 140, minStock: 30, categoryId: cat2.id, supplierId: sup2.id } }),
    prisma.product.create({ data: { name: 'Chuột không dây văn phòng', description: 'Kết nối 2.4GHz, pin lâu', price: 220_000, costPrice: 120_000, stockQuantity: 90, minStock: 20, categoryId: cat3.id, supplierId: sup3.id } }),
    prisma.product.create({ data: { name: 'Chuột không dây gaming', description: 'DPI cao, phản hồi nhanh', price: 590_000, costPrice: 360_000, stockQuantity: 45, minStock: 10, categoryId: cat3.id, supplierId: sup3.id } }),
    prisma.product.create({ data: { name: 'Chuột không dây mini', description: 'Thiết kế nhỏ gọn cho laptop', price: 180_000, costPrice: 90_000, stockQuantity: 120, minStock: 25, categoryId: cat3.id, supplierId: sup3.id } }),
    prisma.product.create({ data: { name: 'Tai nghe Bluetooth in-ear', description: 'Nghe nhạc, đàm thoại rõ', price: 480_000, costPrice: 260_000, stockQuantity: 80, minStock: 15, categoryId: cat4.id, supplierId: sup4.id } }),
    prisma.product.create({ data: { name: 'Tai nghe chụp tai', description: 'Âm thanh stereo, đệm tai êm', price: 750_000, costPrice: 430_000, stockQuantity: 40, minStock: 10, categoryId: cat4.id, supplierId: sup4.id } }),
    prisma.product.create({ data: { name: 'Hub USB-C 6 trong 1', description: 'Mở rộng cổng HDMI, USB, SD', price: 1_200_000, costPrice: 760_000, stockQuantity: 25, minStock: 5, categoryId: cat5.id, supplierId: sup5.id } }),
  ]);
  console.log('✅ Products created');

  console.log('\n🎉 Tạo 6 Promotions');
  await prisma.promotion.create({ data: { name: 'Promo Mar - Cục sạc -5%', type: 'PERCENT' as any, value: 5, startAt: d('2026-03-01'), endAt: d('2026-03-31'), isActive: false, products: { create: [{ productId: products[0].id }, { productId: products[1].id }] } } });
  await prisma.promotion.create({ data: { name: 'Promo Mar - Dây sạc -10%', type: 'PERCENT' as any, value: 10, startAt: d('2026-03-01'), endAt: d('2026-03-31'), isActive: false, products: { create: [{ productId: products[3].id }] } } });
  await prisma.promotion.create({ data: { name: 'Promo Apr - Chuột không dây -200k', type: 'FIXED' as any, value: 200_000, startAt: d('2026-04-01'), endAt: d('2026-04-30'), isActive: false, products: { create: [{ productId: products[6].id }] } } });
  await prisma.promotion.create({ data: { name: 'Promo May - Tai nghe -15%', type: 'PERCENT' as any, value: 15, startAt: d('2026-05-01'), endAt: d('2026-05-31'), isActive: true, products: { create: [{ productId: products[9].id }, { productId: products[10].id }] } } });
  await prisma.promotion.create({ data: { name: 'Flash sale Hub USB-C -20%', type: 'PERCENT' as any, value: 20, startAt: d('2026-05-15'), endAt: d('2026-05-20'), isActive: true, products: { create: [{ productId: products[11].id }] } } });
  await prisma.promotion.create({ data: { name: 'Mega sale Chuột không dây', type: 'PERCENT' as any, value: 10, startAt: d('2026-05-10'), endAt: d('2026-05-25'), isActive: true, products: { create: [{ productId: products[7].id }] } } });
  console.log('✅ Promotions created');

  console.log('\n📝 Tạo LeaveRequests (nhiều loại: ANNUAL, UNPAID, SICK, MATERNITY)');
  const year = 2026;
  const months = [3, 4, 5];
  
  // Tháng 3
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-03-10'), endDate: d('2026-03-11'), type: LeaveType.ANNUAL, reason: 'Việc gia đình', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 2, createdAt: d('2026-03-07') } });
  await prisma.leaveRequest.create({ data: { employeeId: smEmp.id, startDate: d('2026-03-18'), endDate: d('2026-03-18'), type: LeaveType.UNPAID, reason: 'Công việc cá nhân', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-03-17') } });
  await prisma.leaveRequest.create({ data: { employeeId: hrEmp.id, startDate: d('2026-03-05'), endDate: d('2026-03-06'), type: LeaveType.SICK, reason: 'Ốm, có đơn bác sĩ', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 2, createdAt: d('2026-03-04') } });
  await prisma.leaveRequest.create({ data: { employeeId: wmEmp.id, startDate: d('2026-03-16'), endDate: d('2026-03-16'), type: LeaveType.ANNUAL, reason: 'Du lịch', status: LeaveStatus.PENDING, totalDays: 1, createdAt: d('2026-03-14') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-03-20'), endDate: d('2026-03-20'), type: LeaveType.UNPAID, reason: 'Giải quyết việc riêng', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-03-18') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-03-25'), endDate: d('2026-03-26'), type: LeaveType.MATERNITY, reason: 'Thai sản', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 2, createdAt: d('2026-03-23') } });

  // Tháng 4
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-04-13'), endDate: d('2026-04-13'), type: LeaveType.UNPAID, reason: 'Việc riêng', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-04-10') } });
  await prisma.leaveRequest.create({ data: { employeeId: smEmp.id, startDate: d('2026-04-20'), endDate: d('2026-04-21'), type: LeaveType.ANNUAL, reason: 'Du lịch', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 2, createdAt: d('2026-04-15') } });
  await prisma.leaveRequest.create({ data: { employeeId: hrEmp.id, startDate: d('2026-04-08'), endDate: d('2026-04-08'), type: LeaveType.SICK, reason: 'Đau đầu', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-04-07') } });
  await prisma.leaveRequest.create({ data: { employeeId: wmEmp.id, startDate: d('2026-04-24'), endDate: d('2026-04-24'), type: LeaveType.ANNUAL, reason: 'Hẹn riêng', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-04-22') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-04-06'), endDate: d('2026-04-06'), type: LeaveType.UNPAID, reason: 'Công việc cá nhân', status: LeaveStatus.REJECTED, rejectionReason: 'Không đủ nhân sự', approvedById: hr.id, totalDays: 1, createdAt: d('2026-04-03') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-04-15'), endDate: d('2026-04-17'), type: LeaveType.MATERNITY, reason: 'Thai sản tiếp theo', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 3, createdAt: d('2026-04-11') } });

  // Tháng 5
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-05-11'), endDate: d('2026-05-11'), type: LeaveType.UNPAID, reason: 'Việc khẩn', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-05-08') } });
  await prisma.leaveRequest.create({ data: { employeeId: smEmp.id, startDate: d('2026-05-05'), endDate: d('2026-05-05'), type: LeaveType.UNPAID, reason: 'Việc gia đình', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-05-03') } });
  await prisma.leaveRequest.create({ data: { employeeId: hrEmp.id, startDate: d('2026-05-04'), endDate: d('2026-05-04'), type: LeaveType.ANNUAL, reason: 'Hẹn cá nhân', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-04-30') } });
  await prisma.leaveRequest.create({ data: { employeeId: wmEmp.id, startDate: d('2026-05-20'), endDate: d('2026-05-20'), type: LeaveType.SICK, reason: 'Sốt nhẹ', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-05-19') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-05-28'), endDate: d('2026-05-28'), type: LeaveType.RESIGNATION, reason: 'Xin thôi việc', status: LeaveStatus.APPROVED, approvedById: hr.id, totalDays: 1, createdAt: d('2026-05-25') } });
  await prisma.leaveRequest.create({ data: { employeeId: emp1.id, startDate: d('2026-05-15'), endDate: d('2026-05-15'), type: LeaveType.ANNUAL, reason: 'Giải quyết việc cá nhân', status: LeaveStatus.PENDING, totalDays: 1, createdAt: d('2026-05-14') } });

  console.log(`  ✅ Tạo ${6 * 3} đơn nghỉ (6 loại trên 3 tháng)`);

  console.log('\n💰 Tính và tạo Salaries (T2–T6, BHXH 10.5%, thuế TNCN lũy tiến 5–35%)');

  // Set resignDate cho emp1 (đơn RESIGNATION approved 2026-05-28)
  await prisma.employee.update({ where: { id: emp1.id }, data: { resignDate: d('2026-05-28') } });

  // baseSalary lấy từ JobHistory có hiệu lực trong 2026
  const salaryConfig = [
    { emp: hrEmp, baseSalary: 15_000_000 },
    { emp: wmEmp, baseSalary: 14_000_000 },
    { emp: smEmp, baseSalary: 16_000_000 },
    { emp: emp1,  baseSalary: 12_000_000 },
  ];

  for (const { emp, baseSalary } of salaryConfig) {
    const employee = await prisma.employee.findUniqueOrThrow({ where: { id: emp.id } });

    for (const m of months) {
      const standardDays = calcStandardDays(m, year);
      const mStart = new Date(year, m - 1, 1);
      const mEnd = new Date(year, m, 0, 23, 59, 59, 999);

      const leaveRequests = await prisma.leaveRequest.findMany({
        where: {
          employeeId: emp.id,
          status: LeaveStatus.APPROVED,
          startDate: { lte: mEnd },
          endDate: { gte: mStart },
        },
        select: { startDate: true, endDate: true, type: true },
      });

      const unpaidLeaveDays = calcUnpaidDays(leaveRequests, m, year);

      let postResignDays = 0;
      if (employee.resignDate) {
        const rd = new Date(employee.resignDate);
        if (rd >= mStart && rd <= mEnd) {
          const dayAfter = new Date(rd);
          dayAfter.setDate(dayAfter.getDate() + 1);
          if (dayAfter <= mEnd) postResignDays = calcWeekdays(dayAfter, mEnd);
        }
      }

      const totalUnpaidDays = unpaidLeaveDays + postResignDays;
      const actualWorkDays = Math.max(0, standardDays - totalUnpaidDays);
      const effectiveDays = Math.max(0, standardDays - totalUnpaidDays);
      const grossSalary = standardDays > 0 ? Math.round((baseSalary / standardDays) * effectiveDays) : 0;
      const insuranceAmount = Math.round(baseSalary * INSURANCE_RATE);
      const taxableIncome = grossSalary - TAX_ALLOWANCE;
      const taxAmount = calcProgressiveTax(taxableIncome);
      const totalDeduction = insuranceAmount + taxAmount;
      const netSalary = grossSalary - totalDeduction;
      const status = m === 5 ? SalaryStatus.PENDING : SalaryStatus.PAID;

      const details: { type: string; amount: number; description: string }[] = [
        { type: 'INSURANCE', amount: insuranceAmount, description: 'Bảo hiểm xã hội (10.5%)' },
      ];
      if (taxAmount > 0) {
        details.push({ type: 'TAX', amount: taxAmount, description: 'Thuế TNCN (lũy tiến 5–35%)' });
      }

      await prisma.salary.create({
        data: {
          employeeId: emp.id,
          month: m,
          year,
          baseSalary,
          workingDays: standardDays,
          actualWorkDays,
          unpaidDays: totalUnpaidDays,
          grossSalary,
          totalBonus: 0,
          totalDeduction,
          netSalary,
          status,
          note: m === 5 ? 'Chưa thanh toán' : 'Auto-seeded',
          createdAt: new Date(year, m - 1, 28),
          updatedAt: new Date(year, m - 1, 28),
          details: { create: details.map((det) => ({ type: det.type as any, amount: det.amount, description: det.description })) },
        },
      });

      console.log(`  - ${emp.code} T${m}: std=${standardDays} unpaid=${totalUnpaidDays} gross=${grossSalary.toLocaleString('vi-VN')} ins=${insuranceAmount.toLocaleString('vi-VN')} tax=${taxAmount.toLocaleString('vi-VN')} net=${netSalary.toLocaleString('vi-VN')}`);
    }
  }

  console.log('\n📦 Tạo StockIns (phiếu nhập kho) - 2 phiếu/tháng');
  // Tháng 3
  await prisma.stockIn.create({
    data: {
      supplierId: sup1.id, date: d('2026-03-05'), status: 'COMPLETED' as any,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 5 * 13_000_000 + 3 * 21_000_000,
      details: { create: [{ productId: products[0].id, quantity: 5, price: 13_000_000 }, { productId: products[1].id, quantity: 3, price: 21_000_000 }] },
    },
  });
  await prisma.stockIn.create({
    data: {
      supplierId: sup2.id, date: d('2026-03-15'), status: 'COMPLETED' as any,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 30 * 90_000 + 20 * 190_000,
      details: { create: [{ productId: products[3].id, quantity: 30, price: 90_000 }, { productId: products[4].id, quantity: 20, price: 190_000 }] },
    },
  });

  // Tháng 4
  await prisma.stockIn.create({
    data: {
      supplierId: sup1.id, date: d('2026-04-03'), status: 'COMPLETED' as any,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 8 * 13_000_000 + 5 * 14_000_000,
      details: { create: [{ productId: products[0].id, quantity: 8, price: 13_000_000 }, { productId: products[2].id, quantity: 5, price: 14_000_000 }] },
    },
  });
  await prisma.stockIn.create({
    data: {
      supplierId: sup3.id, date: d('2026-04-20'), status: 'COMPLETED' as any,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 10 * 380_000 + 5 * 2_100_000,
      details: { create: [{ productId: products[6].id, quantity: 10, price: 380_000 }, { productId: products[7].id, quantity: 5, price: 2_100_000 }] },
    },
  });

  // Tháng 5
  await prisma.stockIn.create({
    data: {
      supplierId: sup2.id, date: d('2026-05-05'), status: 'COMPLETED' as any,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 40 * 90_000 + 30 * 190_000,
      details: { create: [{ productId: products[3].id, quantity: 40, price: 90_000 }, { productId: products[4].id, quantity: 30, price: 190_000 }] },
    },
  });
  await prisma.stockIn.create({
    data: {
      supplierId: sup4.id, date: d('2026-05-18'), status: 'COMPLETED' as any,
      createdById: wm.id, approvedById: admin.id,
      totalAmount: 50 * 120_000 + 40 * 180_000,
      details: { create: [{ productId: products[9].id, quantity: 50, price: 120_000 }, { productId: products[10].id, quantity: 40, price: 180_000 }] },
    },
  });
  console.log('✅ StockIns created');

  console.log('\n🛒 Tạo Orders + StockOuts - 3 đơn/tháng');
  // Tháng 3
  await prisma.order.create({
    data: {
      userId: c1.id, fullName: 'Nguyễn Khách A', phone: '0908888881', address: '111 Tây Sơn, HCM',
      totalAmount: 47_540_000,
      status: 'COMPLETED', paymentMethod: 'COD', paymentStatus: 'PAID', createdAt: d('2026-03-08'),
      details: { create: [{ productId: products[1].id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }, { productId: products[3].id, quantity: 3, price: 180_000, costPrice: 90_000 }] },
      stockOuts: { create: [{ type: 'SALE' as any, createdById: sm.id, approvedById: wm.id, totalAmount: 47_540_000, status: 'COMPLETED' as any, costPrice: 21_270_000, details: { create: [{ productId: products[1].id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }, { productId: products[3].id, quantity: 3, price: 180_000, costPrice: 90_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c2.id, fullName: 'Lý Khách B', phone: '0908888882', address: '222 Bùi Thị Xuân, HCM',
      totalAmount: 18_000_000,
      status: 'COMPLETED', paymentMethod: 'TRANSFER', paymentStatus: 'PAID', createdAt: d('2026-03-12'),
      details: { create: [{ productId: products[0].id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }] },
      stockOuts: { create: [{ type: 'SALE' as any, createdById: sm.id, approvedById: wm.id, totalAmount: 18_000_000, status: 'COMPLETED' as any, costPrice: 13_000_000, details: { create: [{ productId: products[0].id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c3.id, fullName: 'Phạm Khách C', phone: '0908888883', address: '333 Nguyễn Thái Học, HCM',
      totalAmount: 5_200_000,
      status: 'PENDING', paymentMethod: 'COD', paymentStatus: 'UNPAID', createdAt: d('2026-03-25'),
      details: { create: [{ productId: products[6].id, quantity: 2, price: 2_500_000, costPrice: 1_600_000 }, { productId: products[5].id, quantity: 1, price: 200_000, costPrice: 100_000 }] },
      stockOuts: { create: [{ type: 'SALE' as any, createdById: sm.id, approvedById: wm.id, totalAmount: 5_200_000, status: 'COMPLETED' as any, costPrice: 3_300_000, details: { create: [{ productId: products[6].id, quantity: 2, price: 2_500_000, costPrice: 1_600_000 }, { productId: products[5].id, quantity: 1, price: 200_000, costPrice: 100_000 }] } }] },
    },
  });

  // Tháng 4
  await prisma.order.create({
    data: {
      userId: c1.id, fullName: 'Nguyễn Khách A', phone: '0908888881', address: '111 Tây Sơn, HCM',
      totalAmount: 29_360_000,
      status: 'COMPLETED', paymentMethod: 'COD', paymentStatus: 'PAID', createdAt: d('2026-04-05'),
      details: { create: [{ productId: products[1].id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }, { productId: products[3].id, quantity: 2, price: 180_000, costPrice: 90_000 }] },
      stockOuts: { create: [{ type: 'SALE' as any, createdById: sm.id, approvedById: wm.id, totalAmount: 29_360_000, status: 'COMPLETED' as any, costPrice: 21_180_000, details: { create: [{ productId: products[1].id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }, { productId: products[3].id, quantity: 2, price: 180_000, costPrice: 90_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c4.id, fullName: 'Võ Khách D', phone: '0908888884', address: '444 Trần Hưng Đạo, HCM',
      totalAmount: 5_400_000,
      status: 'COMPLETED', paymentMethod: 'TRANSFER', paymentStatus: 'PAID', createdAt: d('2026-04-10'),
      details: { create: [{ productId: products[7].id, quantity: 1, price: 3_200_000, costPrice: 2_100_000 }, { productId: products[4].id, quantity: 1, price: 380_000, costPrice: 190_000 }] },
      stockOuts: { create: [{ type: 'SALE' as any, createdById: sm.id, approvedById: wm.id, totalAmount: 5_400_000, status: 'COMPLETED' as any, costPrice: 2_290_000, details: { create: [{ productId: products[7].id, quantity: 1, price: 3_200_000, costPrice: 2_100_000 }, { productId: products[4].id, quantity: 1, price: 380_000, costPrice: 190_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      fullName: 'Khách lẻ', phone: '0900000001', address: '123 ABC, HCM',
      totalAmount: 18_000_000,
      status: 'PENDING', paymentMethod: 'COD', paymentStatus: 'UNPAID', createdAt: d('2026-04-22'),
      details: { create: [{ productId: products[0].id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }] },
      stockOuts: { create: [{ type: 'SALE' as any, createdById: sm.id, approvedById: wm.id, totalAmount: 18_000_000, status: 'COMPLETED' as any, costPrice: 13_000_000, details: { create: [{ productId: products[0].id, quantity: 1, price: 18_000_000, costPrice: 13_000_000 }] } }] },
    },
  });

  // Tháng 5
  await prisma.order.create({
    data: {
      userId: c2.id, fullName: 'Lý Khách B', phone: '0908888882', address: '222 Bùi Thị Xuân, HCM',
      totalAmount: 19_760_000,
      status: 'COMPLETED', paymentMethod: 'TRANSFER', paymentStatus: 'PAID', createdAt: d('2026-05-08'),
      details: { create: [{ productId: products[2].id, quantity: 1, price: 19_000_000, costPrice: 14_000_000 }, { productId: products[4].id, quantity: 2, price: 380_000, costPrice: 190_000 }] },
      stockOuts: { create: [{ type: 'SALE' as any, createdById: sm.id, approvedById: wm.id, totalAmount: 19_760_000, status: 'COMPLETED' as any, costPrice: 14_380_000, details: { create: [{ productId: products[2].id, quantity: 1, price: 19_000_000, costPrice: 14_000_000 }, { productId: products[4].id, quantity: 2, price: 380_000, costPrice: 190_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c5.id, fullName: 'Hoàng Khách E', phone: '0908888885', address: '555 Nguyễn Huệ, HCM',
      totalAmount: 3_800_000,
      status: 'COMPLETED', paymentMethod: 'COD', paymentStatus: 'PAID', createdAt: d('2026-05-15'),
      details: { create: [{ productId: products[11].id, quantity: 2, price: 1_200_000, costPrice: 700_000 }, { productId: products[10].id, quantity: 1, price: 350_000, costPrice: 180_000 }] },
      stockOuts: { create: [{ type: 'SALE' as any, createdById: sm.id, approvedById: wm.id, totalAmount: 3_800_000, status: 'COMPLETED' as any, costPrice: 1_580_000, details: { create: [{ productId: products[11].id, quantity: 2, price: 1_200_000, costPrice: 700_000 }, { productId: products[10].id, quantity: 1, price: 350_000, costPrice: 180_000 }] } }] },
    },
  });
  await prisma.order.create({
    data: {
      userId: c1.id, fullName: 'Nguyễn Khách A', phone: '0908888881', address: '111 Tây Sơn, HCM',
      totalAmount: 29_000_000,
      status: 'PENDING', paymentMethod: 'TRANSFER', paymentStatus: 'UNPAID', createdAt: d('2026-05-28'),
      details: { create: [{ productId: products[1].id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }] },
      stockOuts: { create: [{ type: 'SALE' as any, createdById: sm.id, approvedById: wm.id, totalAmount: 29_000_000, status: 'COMPLETED' as any, costPrice: 21_000_000, details: { create: [{ productId: products[1].id, quantity: 1, price: 29_000_000, costPrice: 21_000_000 }] } }] },
    },
  });
  console.log('✅ Orders + StockOuts created');

  console.log('\n✅ ========== FULL DATA SEEDED ==========');
  console.log('   👥 1 Admin, 1 HR Manager, 1 Warehouse Manager, 1 Sales Manager, 1 Employee (regular) + 3 manager employees, 5 Customers');
  console.log('   📦 6 StockIns, 9 Orders + StockOuts');
  console.log('   💰 12 Salary records (4 employees x 3 months; month 5 set to PENDING)');
  console.log('   📝 18 LeaveRequests (ANNUAL, UNPAID, SICK, MATERNITY, RESIGNATION)');
  console.log('   🏷️  12 Products, 5 Categories, 5 Suppliers, 6 Promotions');
  console.log('   📋 4 JobHistory records');
  console.log('\n   Tài khoản đăng nhập: (password: 123456)');
  console.log('   - admin@gmail.com (ADMIN)');
  console.log('   - hr@gmail.com (HR_MANAGER)');
  console.log('   - warehouse@gmail.com (WAREHOUSE_MANAGER)');
  console.log('   - sales@gmail.com (SALES_MANAGER)');
  console.log('   - nv001@gmail.com đến nv006@gmail.com (EMPLOYEE)');
  console.log('   - customer1@gmail.com đến customer5@gmail.com (CUSTOMER)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
