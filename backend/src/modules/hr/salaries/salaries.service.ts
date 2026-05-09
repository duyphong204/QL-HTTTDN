import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalaryStatus, DetailType, Prisma } from '@prisma/client';
import {
  calculateStandardWorkingDays,
  calculateUnpaidLeaveDays,
  calculateGrossSalary,
  calculateProgressiveTax,
  getMonthDateRange,
  countWeekdays,
} from './salary.utils';
import {
  CalculateSalaryDto,
  SalaryDetailInput,
} from './dto/calculate-salary.dto';
import { AddSalaryDetailDto } from './dto/salary-detail.dto';
import { QuerySalaryDto } from './dto/query-salary.dto';
import {
  buildPaginatedResponse,
  calculatePaginationSkip,
} from 'src/common/utils/pagination.helper';

const INSURANCE_RATE = 0.105;
const TAX_ALLOWANCE = 11_000_000;

@Injectable()
export class SalariesService {
  constructor(private prisma: PrismaService) {}

  // ==================== HR / ADMIN ====================

  async calculateAll(month: number, year: number) {
    const employees = await this.prisma.employee.findMany({
      where: { resignDate: null },
      select: { id: true },
    });

    let count = 0;
    for (const emp of employees) {
      const existing = await this.prisma.salary.findUnique({
        where: { employeeId_month_year: { employeeId: emp.id, month, year } },
      });
      if (existing) continue;
      await this.calculateOne({ employeeId: emp.id, month, year });
      count++;
    }
    return { count, message: `Đã tính lương cho ${count} nhân viên` };
  }

  async calculateOne(dto: CalculateSalaryDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Không tìm thấy nhân viên');

    const { startDate, endDate } = getMonthDateRange(dto.month, dto.year);
    const standardDays = calculateStandardWorkingDays(dto.month, dto.year);

    // Lấy mức lương có hiệu lực trong tháng từ JobHistory
    const effectiveHistory = await this.prisma.jobHistory.findFirst({
      where: {
        employeeId: dto.employeeId,
        startDate: { lte: startDate },
        OR: [{ endDate: null }, { endDate: { gte: startDate } }],
      },
      orderBy: { startDate: 'desc' },
    });
    const baseSalary = effectiveHistory?.baseSalary ?? employee.baseSalary;

    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId: dto.employeeId,
        status: 'APPROVED',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: { startDate: true, endDate: true, type: true },
    });

    // Ngày nghỉ không lương từ đơn UNPAID
    const unpaidLeaveDays = calculateUnpaidLeaveDays(
      leaveRequests,
      dto.month,
      dto.year,
    );

    // Nếu nhân viên nghỉ việc giữa tháng, các ngày sau resignDate không được trả lương
    let postResignDays = 0;
    if (employee.resignDate) {
      const rd = new Date(employee.resignDate);
      if (rd >= startDate && rd <= endDate) {
        const dayAfterResign = new Date(rd);
        dayAfterResign.setDate(dayAfterResign.getDate() + 1);
        if (dayAfterResign <= endDate) {
          postResignDays = countWeekdays(dayAfterResign, endDate);
        }
      }
    }

    const totalUnpaidDays = unpaidLeaveDays + postResignDays;
    const actualWorkDays = Math.max(0, standardDays - totalUnpaidDays);
    const grossSalary = calculateGrossSalary(
      baseSalary,
      standardDays,
      totalUnpaidDays,
    );

    // Bảo hiểm tính trên lương cơ bản (baseSalary), không phụ thuộc ngày nghỉ
    const insuranceAmount = Math.round(baseSalary * INSURANCE_RATE);
    const taxableIncome = grossSalary - TAX_ALLOWANCE;
    const taxAmount = calculateProgressiveTax(taxableIncome);

    const autoDetails: SalaryDetailInput[] = [
      {
        type: DetailType.INSURANCE,
        amount: insuranceAmount,
        description: 'Bảo hiểm xã hội (10.5%)',
      },
    ];
    if (taxAmount > 0) {
      autoDetails.push({
        type: DetailType.TAX,
        amount: taxAmount,
        description: 'Thuế TNCN (lũy tiến 5–35%)',
      });
    }
    const extraDetails = dto.details ?? [];
    const allDetails = [...autoDetails, ...extraDetails];

    const totalBonus = allDetails
      .filter((d) =>
        (
          [
            DetailType.BONUS,
            DetailType.OT,
            DetailType.ALLOWANCE,
          ] as DetailType[]
        ).includes(d.type),
      )
      .reduce((s, d) => s + d.amount, 0);

    const totalDeduction = allDetails
      .filter((d) =>
        (
          [
            DetailType.DEDUCTION,
            DetailType.INSURANCE,
            DetailType.TAX,
          ] as DetailType[]
        ).includes(d.type),
      )
      .reduce((s, d) => s + d.amount, 0);

    const netSalary = grossSalary + totalBonus - totalDeduction;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.salary.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: dto.employeeId,
            month: dto.month,
            year: dto.year,
          },
        },
      });
      if (existing) {
        await tx.salary.delete({ where: { id: existing.id } });
      }

      return tx.salary.create({
        data: {
          employeeId: dto.employeeId,
          month: dto.month,
          year: dto.year,
          baseSalary,
          workingDays: standardDays,
          actualWorkDays,
          unpaidDays: totalUnpaidDays,
          grossSalary,
          totalBonus,
          totalDeduction,
          netSalary,
          details: {
            create: allDetails.map((d) => ({
              type: d.type,
              amount: d.amount,
              description: d.description ?? null,
            })),
          },
        },
        include: {
          details: true,
          employee: { include: { user: { include: { profile: true } } } },
        },
      });
    });
  }

  async findAll(query: QuerySalaryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = calculatePaginationSkip(page, limit);

    const where: Prisma.SalaryWhereInput = {};
    if (query.month) where.month = query.month;
    if (query.year) where.year = query.year;
    if (query.status) where.status = query.status;
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.search) {
      where.employee = {
        OR: [
          { code: { contains: query.search, mode: 'insensitive' } },
          {
            user: {
              profile: {
                fullName: { contains: query.search, mode: 'insensitive' },
              },
            },
          },
        ],
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.salary.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: {
          details: true,
          employee: { include: { user: { include: { profile: true } } } },
        },
      }),
      this.prisma.salary.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const salary = await this.prisma.salary.findUnique({
      where: { id },
      include: {
        details: true,
        employee: { include: { user: { include: { profile: true } } } },
      },
    });
    if (!salary) throw new NotFoundException('Không tìm thấy bảng lương');
    return salary;
  }

  async getStatistics(year: number, month?: number) {
    const where: Prisma.SalaryWhereInput = { year };
    if (month) where.month = month;

    const salaries = await this.prisma.salary.findMany({
      where,
      select: {
        month: true,
        netSalary: true,
        totalBonus: true,
        totalDeduction: true,
        status: true,
        details: { select: { type: true, amount: true } },
      },
    });

    const totalNetSalary = salaries.reduce((s, r) => s + r.netSalary, 0);
    const totalBonus = salaries.reduce((s, r) => s + r.totalBonus, 0);
    const totalDeduction = salaries.reduce((s, r) => s + r.totalDeduction, 0);
    const totalInsurance = salaries
      .flatMap((r) => r.details)
      .filter((d) => d.type === DetailType.INSURANCE)
      .reduce((s, d) => s + d.amount, 0);

    const byStatus = { PENDING: 0, APPROVED: 0, PAID: 0, CANCELLED: 0 };
    for (const s of salaries) byStatus[s.status]++;

    const monthlyMap: Record<number, { total: number; count: number }> = {};
    for (const s of salaries) {
      if (!monthlyMap[s.month]) monthlyMap[s.month] = { total: 0, count: 0 };
      monthlyMap[s.month].total += s.netSalary;
      monthlyMap[s.month].count++;
    }
    const monthlyBreakdown = Object.entries(monthlyMap)
      .map(([m, v]) => ({ month: Number(m), ...v }))
      .sort((a, b) => a.month - b.month);

    return {
      totalEmployees: salaries.length,
      totalNetSalary,
      totalBonus,
      totalDeduction,
      totalInsurance,
      avgNetSalary:
        salaries.length > 0 ? Math.round(totalNetSalary / salaries.length) : 0,
      byStatus,
      monthlyBreakdown,
    };
  }

  async approve(id: string) {
    const salary = await this.getSalaryOrThrow(id);
    if (salary.status !== SalaryStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể duyệt bảng lương ở trạng thái PENDING',
      );
    }
    return this.prisma.salary.update({
      where: { id },
      data: { status: SalaryStatus.APPROVED },
      include: {
        details: true,
        employee: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async pay(id: string) {
    const salary = await this.getSalaryOrThrow(id);
    if (salary.status !== SalaryStatus.APPROVED) {
      throw new BadRequestException(
        'Chỉ có thể thanh toán bảng lương ở trạng thái APPROVED',
      );
    }
    return this.prisma.salary.update({
      where: { id },
      data: { status: SalaryStatus.PAID, paidAt: new Date() },
      include: {
        details: true,
        employee: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async addDetail(salaryId: string, dto: AddSalaryDetailDto) {
    await this.getSalaryOrThrow(salaryId);
    await this.prisma.salaryDetail.create({
      data: {
        salaryId,
        type: dto.type,
        amount: dto.amount,
        description: dto.description ?? null,
      },
    });
    return this.recalculateTotals(salaryId);
  }

  async removeDetail(salaryId: string, detailId: string) {
    await this.getSalaryOrThrow(salaryId);
    const detail = await this.prisma.salaryDetail.findFirst({
      where: { id: detailId, salaryId },
    });
    if (!detail) throw new NotFoundException('Không tìm thấy chi tiết lương');
    await this.prisma.salaryDetail.delete({ where: { id: detailId } });
    return this.recalculateTotals(salaryId);
  }

  async exportSalaries(month: number, year: number) {
    if (!month || !year) throw new BadRequestException('Thiếu tháng hoặc năm');

    const salaries = await this.prisma.salary.findMany({
      where: { month, year },
      orderBy: [{ employee: { code: 'asc' } }],
      include: {
        details: true,
        employee: { include: { user: { include: { profile: true } } } },
      },
    });

    const totalNetSalary = salaries.reduce((s, r) => s + r.netSalary, 0);
    const totalBonus = salaries.reduce((s, r) => s + r.totalBonus, 0);
    const totalDeduction = salaries.reduce((s, r) => s + r.totalDeduction, 0);

    return {
      month,
      year,
      exportedAt: new Date().toISOString(),
      count: salaries.length,
      summary: { totalNetSalary, totalBonus, totalDeduction },
      salaries: salaries.map((s) => ({
        id: s.id,
        employeeCode: s.employee.code,
        employeeName: s.employee.user.profile?.fullName ?? '',
        baseSalary: s.baseSalary,
        workingDays: s.workingDays,
        actualWorkDays: s.actualWorkDays,
        grossSalary: s.grossSalary,
        totalBonus: s.totalBonus,
        totalDeduction: s.totalDeduction,
        netSalary: s.netSalary,
        status: s.status,
        paidAt: s.paidAt,
        details: s.details.map((d) => ({
          type: d.type,
          amount: d.amount,
          description: d.description,
        })),
      })),
    };
  }

  // ==================== EMPLOYEE ====================

  async getMySalaries(
    userId: string,
    query: { year?: number; month?: number },
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee)
      throw new NotFoundException('Bạn chưa được gán là nhân viên');

    const where: any = { employeeId: employee.id };
    if (query.year) where.year = query.year;
    if (query.month) where.month = query.month;

    return this.prisma.salary.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        details: true,
        employee: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async getMyById(userId: string, id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee)
      throw new NotFoundException('Bạn chưa được gán là nhân viên');

    const salary = await this.prisma.salary.findFirst({
      where: { id, employeeId: employee.id },
      include: {
        details: true,
        employee: { include: { user: { include: { profile: true } } } },
      },
    });
    if (!salary)
      throw new ForbiddenException('Không có quyền xem bảng lương này');
    return salary;
  }

  // ==================== PRIVATE ====================

  private async getSalaryOrThrow(id: string) {
    const salary = await this.prisma.salary.findUnique({ where: { id } });
    if (!salary) throw new NotFoundException('Không tìm thấy bảng lương');
    return salary;
  }

  private async recalculateTotals(salaryId: string) {
    const salary = await this.prisma.salary.findUnique({
      where: { id: salaryId },
      include: { details: true },
    });
    if (!salary) throw new NotFoundException('Không tìm thấy bảng lương');

    const bonusTypes: DetailType[] = [
      DetailType.BONUS,
      DetailType.OT,
      DetailType.ALLOWANCE,
    ];
    const deductionTypes: DetailType[] = [
      DetailType.DEDUCTION,
      DetailType.INSURANCE,
      DetailType.TAX,
    ];

    const totalBonus = salary.details
      .filter((d) => bonusTypes.includes(d.type))
      .reduce((s, d) => s + d.amount, 0);

    const totalDeduction = salary.details
      .filter((d) => deductionTypes.includes(d.type))
      .reduce((s, d) => s + d.amount, 0);

    const netSalary = salary.grossSalary + totalBonus - totalDeduction;

    return this.prisma.salary.update({
      where: { id: salaryId },
      data: { totalBonus, totalDeduction, netSalary },
      include: {
        details: true,
        employee: { include: { user: { include: { profile: true } } } },
      },
    });
  }
}
