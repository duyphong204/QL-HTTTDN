import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UpdateEmployeeDto,
  UpdateProfileDto,
  CreateEmployeeDto,
} from './dto/employee.dto';
import { Prisma } from '@prisma/client';
@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new NotFoundException('Bạn chưa được gán là nhân viên');
    }
    return this.prisma.profile.update({
      where: { userId },
      data: dto,
    });
  }
  private async generateEmployeeCode(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const lastEmployee = await tx.employee.findFirst({
      orderBy: { code: 'desc' },
    });

    if (!lastEmployee) {
      return 'NV0001';
    }

    const lastCode: string = lastEmployee.code;
    const numberPart = parseInt(lastCode.replace('NV', ''), 10);
    const nextNumber = numberPart + 1;

    return `NV${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateEmployeeDto) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: dto.password,
          role: 'EMPLOYEE',
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          fullName: dto.fullName,
          phone: dto.phone,
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          code: await this.generateEmployeeCode(tx) ,
          department: dto.department,
          position: dto.position,
          baseSalary: dto.baseSalary,
        },
      });

      await tx.jobHistory.create({
        data: {
          employeeId: employee.id,
          department: dto.department,
          position: dto.position,
          baseSalary: dto.baseSalary,
        },
      });

      return employee;
    });
  }
  async getProfile(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        code: true,
        department: true,
        position: true,
        baseSalary: true,
        joinDate: true,
        resignDate: true,

        user: {
          select: {
            email: true,
            profile: {
              select: {
                fullName: true,
                phone: true,
                address: true,
                avatar: true,
                dateOfBirth: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    return employee;
  }
  async findAll() {
    return this.prisma.employee.findMany({
      where: {
        resignDate: null,
      },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }
  //  cập nhật chức vụ/lương
  async update(id: string, dto: UpdateEmployeeDto) {
    const currentEmployee = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!currentEmployee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    return this.prisma.$transaction(async (tx) => {
      // 1. Kết thúc job hiện tại
      await tx.jobHistory.updateMany({
        where: {
          employeeId: id,
          endDate: null,
        },
        data: {
          endDate: new Date(),
        },
      });
      await tx.jobHistory.create({
        data: {
          employeeId: id,
          department: dto.department ?? currentEmployee.department,
          position: dto.position ?? currentEmployee.position,
          baseSalary: dto.baseSalary ?? currentEmployee.baseSalary,
          startDate: new Date(),
        },
      });
      return tx.employee.update({
        where: { id },
        data: dto,
      });
    });
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id },
        data: { resignDate: new Date() },
      });
      await tx.jobHistory.updateMany({
        where: { employeeId: id, endDate: null },
        data: { endDate: new Date() },
      });
      await tx.user.update({
        where: { id: employee.userId },
        data: { role: 'CUSTOMER' },
      });
      return { message: 'Nhân sự đã được cho nghĩ việc' };
    });
  }
  async getEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                fullName: true,
                phone: true,
                address: true,
                avatar: true,
                dateOfBirth: true,
              },
            },
          },
        },
        jobHistories: {
          orderBy: {
            startDate: 'desc',
          },
        },
      },
    });
    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    return employee;
  }
  async getHrStatistics() {
    const totalEmployees = await this.prisma.employee.count({
      where: { resignDate: null },
    });
    const totalResigned = await this.prisma.employee.count({
      where: { resignDate: { not: null } },
    });

    // Tổng lương phải trả tháng hiện tại
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const salaryAggregate = await this.prisma.salary.aggregate({
      where: { month: currentMonth, year: currentYear },
      _sum: { amount: true, bonus: true, deduction: true },
    });
    return {
      totalEmployees,
      totalResigned,
      salaryMonth: currentMonth,
      salaryYear: currentYear,
      totalSalaryPaid: salaryAggregate._sum.amount || 0,
      totalBonus: salaryAggregate._sum.bonus || 0,
    };
  }
}
