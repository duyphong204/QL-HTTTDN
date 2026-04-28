import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CalculateSalaryDto } from './dto/calculate-salary.dto';
import { QuerySalaryDto } from './dto/query-salary.dto';
import { SalaryStatus } from '@prisma/client';
import { AddSalaryDetailDto } from './dto/salary-detail.dto';

@Injectable()
export class SalariesService {
  constructor(private prisma: PrismaService) {}

  private async refreshSalaryTotals(salaryId: string) {
    const salary = await this.prisma.salary.findUnique({
      where: { id: salaryId },
      include: { details: true, employee: true },
    });
    if (!salary) return null;

    const totalBonus = salary.details
      .filter((d) => ['BONUS', 'OT', 'ALLOWANCE'].includes(d.type))
      .reduce((sum, d) => sum + d.amount, 0);

    const totalDeduction = salary.details
      .filter((d) => !['BONUS', 'OT', 'ALLOWANCE'].includes(d.type))
      .reduce((sum, d) => sum + d.amount, 0);

    const baseAmount =
      (salary.employee.baseSalary / salary.workingDays) * salary.actualWorkDays;
    const grossSalary = baseAmount + totalBonus;
    const netSalary = grossSalary - totalDeduction;

    return this.prisma.salary.update({
      where: { id: salaryId },
      data: { totalBonus, totalDeduction, grossSalary, netSalary },
      include: {
        details: true,
        employee: {
          include: { user: { include: { profile: true } } },
        },
      },
    });
  }

  private getMonthDateRange(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 1, 0, 0, 0, 0);
    endDate.setTime(endDate.getTime() - 1);
    return { startDate, endDate };
  }

  // =========================
  // 1. TÍNH LƯƠNG (ĐƠN LẺ & HÀNG LOẠT)
  // =========================
  async calculateSalary(dto: CalculateSalaryDto) {
    const { employeeId, month, year, details = [] } = dto;
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) throw new BadRequestException('Employee not found');

    const { startDate, endDate } = this.getMonthDateRange(month, year);
    const attendances = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: startDate, lte: endDate },
        status: { in: ['PRESENT', 'LEAVE', 'LATE'] },
      },
      select: {
        date: true,
        status: true,
      },
    });

    const approvedLeaveRequests = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    const approvedLeaveDates = new Set<string>();
    for (const leave of approvedLeaveRequests) {
      const leaveStart = leave.startDate > startDate ? leave.startDate : startDate;
      const leaveEnd = leave.endDate < endDate ? leave.endDate : endDate;

      for (
        const d = new Date(leaveStart.getFullYear(), leaveStart.getMonth(), leaveStart.getDate());
        d <= leaveEnd;
        d.setDate(d.getDate() + 1)
      ) {
        approvedLeaveDates.add(d.toISOString().split('T')[0]);
      }
    }

    const workingDays = 26;
    const actualWorkDays = attendances.reduce((sum, attendance) => {
      if (attendance.status === 'PRESENT' || attendance.status === 'LATE') {
        return sum + 1;
      }

      if (attendance.status === 'LEAVE') {
        const attendanceDate = new Date(
          attendance.date.getFullYear(),
          attendance.date.getMonth(),
          attendance.date.getDate(),
        )
          .toISOString()
          .split('T')[0];

        if (approvedLeaveDates.has(attendanceDate)) {
          return sum + 1;
        }
      }

      return sum;
    }, 0);

    const salary = await this.prisma.salary.upsert({
      where: { employeeId_month_year: { employeeId, month, year } },
      create: {
        employeeId,
        month,
        year,
        baseSalary: employee.baseSalary,
        workingDays,
        actualWorkDays,
        grossSalary: 0,
        totalBonus: 0,
        totalDeduction: 0,
        netSalary: 0,
        details: { create: details },
      },
      update: {
        actualWorkDays,
        details:
          details.length > 0 ? { deleteMany: {}, create: details } : undefined,
      },
    });

    return this.refreshSalaryTotals(salary.id);
  }

  async calculateAllSalaries(month: number, year: number) {
    const { endDate } = this.getMonthDateRange(month, year);
    const employees = await this.prisma.employee.findMany({
      where: {
        OR: [{ resignDate: null }, { resignDate: { gt: endDate } }],
      },
    });
    const results = await Promise.allSettled(
      employees.map((emp) =>
        this.calculateSalary({ employeeId: emp.id, month, year }),
      ),
    );
    const success = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    return { total: employees.length, success, failed };
  }

  // =========================
  // 2. TRUY VẤN LƯƠNG
  // =========================
  async findAll(query: QuerySalaryDto, userId?: string) {
    const { month, year, employeeId, status } = query;

    let finalEmployeeId = employeeId;
    if (userId) {
      const emp = await this.prisma.employee.findUnique({ where: { userId } });
      finalEmployeeId = emp?.id;
    }

    return this.prisma.salary.findMany({
      where: {
        month,
        year,
        employeeId: finalEmployeeId,
        status,
      },
      include: {
        employee: {
          include: {
            user: {
              include: { profile: true }
            }
          }
        },
        details: true,
      },
      // SỬA TẠI ĐÂY: Chuyển object thành mảng
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
    });
  }

  async findOne(id: string, userId?: string) {
    const salary = await this.prisma.salary.findUnique({
      where: { id },
      include: {
        details: true,
        employee: { include: { user: { include: { profile: true } } } },
      },
    });
    if (!salary) throw new NotFoundException('Salary not found');
    if (userId && salary.employee.userId !== userId)
      throw new ForbiddenException('Access denied');
    return salary;
  }

  // =========================
  // 3. TRẠNG THÁI & CHI TIẾT
  // =========================
  private static readonly VALID_TRANSITIONS: Record<SalaryStatus, SalaryStatus[]> = {
    [SalaryStatus.PENDING]: [SalaryStatus.APPROVED, SalaryStatus.CANCELLED],
    [SalaryStatus.APPROVED]: [SalaryStatus.PAID, SalaryStatus.CANCELLED],
    [SalaryStatus.PAID]: [],
    [SalaryStatus.CANCELLED]: [],
  };

  async updateStatus(id: string, status: SalaryStatus) {
    const current = await this.prisma.salary.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) throw new NotFoundException('Salary not found');

    const allowed = SalariesService.VALID_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${current.status} sang ${status}`,
      );
    }

    return this.prisma.salary.update({
      where: { id },
      data: {
        status,
        paidAt: status === SalaryStatus.PAID ? new Date() : null,
      },
    });
  }

  async addDetail(salaryId: string, dto: AddSalaryDetailDto) {
    await this.prisma.salaryDetail.create({ data: { salaryId, ...dto } });
    return this.refreshSalaryTotals(salaryId);
  }

  async removeDetail(salaryId: string, detailId: string) {
    await this.prisma.salaryDetail.delete({ where: { id: detailId } });
    return this.refreshSalaryTotals(salaryId);
  }

  // =========================
  // 4. THỐNG KÊ (Dùng chung cho Report)
  // =========================
  async getStats(month?: number, year?: number) {
    const [stats, data] = await Promise.all([
      this.prisma.salary.aggregate({
        _sum: { netSalary: true, totalBonus: true, totalDeduction: true },
        _avg: { netSalary: true },
        where: { month, year },
      }),
      this.prisma.salary.findMany({
        where: { month, year },
        select: {
          id: true,
          month: true,
          year: true,
          baseSalary: true,
          netSalary: true,
          totalBonus: true,
          totalDeduction: true,
          status: true,
          employee: {
            select: {
              code: true,
              user: { select: { profile: { select: { fullName: true } } } },
            },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
    ]);
    return { stats, data };
  }
}
