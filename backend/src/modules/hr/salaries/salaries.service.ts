import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSalaryDto,
  QuerySalaryDto,
  UpdateSalaryDto,
} from './dto/salary.dto';

@Injectable()
export class SalariesService {
  constructor(private prisma: PrismaService) {}

  // 1. Helper dùng chung để include dữ liệu nhân viên, tránh lặp code
  private readonly salaryInclude = {
    employee: {
      select: {
        id: true,
        code: true,
        baseSalary: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { fullName: true, phone: true },
            },
          },
        },
      },
    },
  };

  // 2. Helper tính toán Net Salary để trả về cho Frontend (nếu cần show)
  private addNetSalary<T extends { amount: number }>(salary: T) {
    return {
      ...salary,
      netSalary: salary.amount, // amount lúc này đã là (base + bonus - deduction)
    };
  }

  async calculateSalary(dto: CreateSalaryDto) {
    // Kiểm tra tồn tại
    const exist = await this.prisma.salary.findFirst({
      where: { employeeId: dto.employeeId, month: dto.month, year: dto.year },
    });
    if (exist)
      throw new ConflictException(
        'Nhân viên này đã được tính lương tháng này rồi!',
      );

    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
      select: { baseSalary: true },
    });
    if (!employee) throw new NotFoundException('Nhân viên không tồn tại');

    // Công thức chuẩn: amount = Lương cơ bản + Thưởng - Phạt
    const finalAmount =
      employee.baseSalary + (dto.bonus || 0) - (dto.deduction || 0);

    const salary = await this.prisma.salary.create({
      data: {
        ...dto,
        status: dto.status ?? 'PENDING',
        amount: finalAmount,
      },
      include: this.salaryInclude,
    });

    return this.addNetSalary(salary);
  }

  async calculateAllForMonth(month: number, year: number) {
    const activeEmployees = await this.prisma.employee.findMany({
      where: { resignDate: null, user: { isActive: true } },
      select: { id: true, baseSalary: true },
    });

    return this.prisma.$transaction(async (tx) => {
      let created = 0;
      let skipped = 0;

      for (const emp of activeEmployees) {
        const existing = await tx.salary.findFirst({
          where: { employeeId: emp.id, month, year },
          select: { id: true },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await tx.salary.create({
          data: {
            employeeId: emp.id,
            month,
            year,
            bonus: 0,
            deduction: 0,
            amount: emp.baseSalary, // Mặc định là lương cơ bản
            status: 'PENDING',
          },
        });
        created++;
      }

      return {
        month,
        year,
        totalEmployees: activeEmployees.length,
        created,
        skipped,
      };
    });
  }

  async getMySalaries(userId: string, month?: number, year?: number) {
    const salaries = await this.prisma.salary.findMany({
      where: {
        employee: { userId },
        ...(month && { month }),
        ...(year && { year }),
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: this.salaryInclude,
    });

    return salaries.map((s) => this.addNetSalary(s));
  }

  async findAll(query: QuerySalaryDto) {
    const { month, year, employeeId, status } = query;

    const salaries = await this.prisma.salary.findMany({
      where: { month, year, employeeId, status },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: this.salaryInclude,
    });

    return salaries.map((s) => this.addNetSalary(s));
  }

  async findOne(id: string) {
    const salary = await this.prisma.salary.findUnique({
      where: { id },
      include: this.salaryInclude,
    });
    if (!salary) throw new NotFoundException('Lương không tồn tại');
    return this.addNetSalary(salary);
  }

  async markAsPaid(id: string) {
    const salary = await this.prisma.salary.update({
      where: { id },
      data: { status: 'PAID' },
      include: this.salaryInclude,
    });
    return this.addNetSalary(salary);
  }

  async update(id: string, dto: UpdateSalaryDto) {
    const exist = await this.prisma.salary.findUnique({
      where: { id },
      include: { employee: { select: { baseSalary: true } } },
    });
    if (!exist) throw new NotFoundException('Lương không tồn tại');

    // TÍNH TOÁN LẠI TỔNG TIỀN NẾU CÓ THAY ĐỔI BONUS/DEDUCTION
    let newAmount = exist.amount;
    if (dto.bonus !== undefined || dto.deduction !== undefined) {
      const bonus = dto.bonus ?? exist.bonus;
      const deduction = dto.deduction ?? exist.deduction;
      newAmount = exist.employee.baseSalary + bonus - deduction;
    }

    const updatedSalary = await this.prisma.salary.update({
      where: { id },
      data: {
        ...dto,
        amount: newAmount,
      },
      include: this.salaryInclude,
    });

    return this.addNetSalary(updatedSalary);
  }
}
