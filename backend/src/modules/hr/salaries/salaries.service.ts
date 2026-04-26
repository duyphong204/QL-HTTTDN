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
    });

    const workingDays = 26;
    const actualWorkDays = attendances.length;

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
    const employees = await this.prisma.employee.findMany({
      where: { resignDate: null },
    });
    const results: any[] = []; 
    for (const emp of employees) {
      try {
        const res = await this.calculateSalary({
          employeeId: emp.id,
          month,
          year,
        });
        if (res) results.push(res);
      } catch (e) {
        console.error(`Error calculating for ${emp.id}:`, e);
      }
    }
    return { total: employees.length, success: results.length };
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
      include: { employee: true, details: true },
    });
    if (!salary) throw new NotFoundException('Salary not found');
    if (userId && salary.employee.userId !== userId)
      throw new ForbiddenException('Access denied');
    return salary;
  }

  // =========================
  // 3. TRẠNG THÁI & CHI TIẾT
  // =========================
  async updateStatus(id: string, status: SalaryStatus) {
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
    const stats = await this.prisma.salary.aggregate({
      _sum: { netSalary: true, totalBonus: true, totalDeduction: true },
      _avg: { netSalary: true },
      where: { month, year },
    });
    const list = await this.findAll({ month, year });
    return { stats, data: list };
  }
}
