import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UpdateEmployeeDto,
  UpdateProfileDto,
  CreateEmployeeDto,
  QueryEmployeeDto,
} from './dto/employee.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  calculatePaginationSkip,
  buildPaginatedResponse,
} from 'src/common/utils/pagination.helper';
@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  private async assertEmployeeNotAdminByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === 'ADMIN') {
      throw new ForbiddenException('Không được thao tác trên tài khoản ADMIN');
    }
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new NotFoundException('Bạn chưa được gán là nhân viên');
    }
    return this.prisma.profile.update({
      where: { userId },
      data: {
        phone: dto.phone,
        address: dto.address,
        avatar: dto.avatar,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
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
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { role: true },
    });

    if (existingUser?.role === 'ADMIN') {
      throw new ForbiddenException('Không được thao tác trên tài khoản ADMIN');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
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
          code: await this.generateEmployeeCode(tx),
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
            role: true,
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
  async findAll(query?: QueryEmployeeDto) {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'code',
      sortOrder = 'asc',
      department,
      position,
    } = query || {};

    const allowedSortBy = ['code', 'department', 'position', 'joinDate'] as const;
    const normalizedSortBy = allowedSortBy.includes(sortBy as (typeof allowedSortBy)[number])
      ? sortBy
      : 'code';
    const normalizedSortOrder: Prisma.SortOrder =
      sortOrder === 'desc' ? 'desc' : 'asc';

    const skip = calculatePaginationSkip(page, limit);

    const where: Prisma.EmployeeWhereInput = {
      resignDate: null,
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          {
            user: {
              email: { contains: search, mode: 'insensitive' },
            },
          },
          {
            user: {
              profile: {
                fullName: { contains: search, mode: 'insensitive' },
              },
            },
          },
        ],
      }),
      ...(department && { department }),
      ...(position && { position }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          [normalizedSortBy]: normalizedSortOrder,
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }
  //  cập nhật chức vụ/lương
  async update(id: string, dto: UpdateEmployeeDto) {
    const currentEmployee = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!currentEmployee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    await this.assertEmployeeNotAdminByUserId(currentEmployee.userId);

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

    await this.assertEmployeeNotAdminByUserId(employee.userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: employee.userId },
        data: { isActive: false },
      });

      await tx.employee.update({
        where: { id },
        data: { resignDate: new Date() },
      });
      await tx.jobHistory.updateMany({
        where: { employeeId: id, endDate: null },
        data: { endDate: new Date() },
      });
      // ← KHÔNG đổi role. Giữ nguyên để lịch sử rõ ràng
      return { message: 'Nhân sự đã được cho nghỉ việc' };
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
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return this.getHrStatisticsWithFilter(currentMonth, currentYear);
  }

  async getHrStatisticsWithFilter(month?: number, year?: number) {
    const currentMonth = month ?? new Date().getMonth() + 1;
    const currentYear = year ?? new Date().getFullYear();

    const totalEmployees = await this.prisma.employee.count({
      where: { resignDate: null },
    });
    const totalResigned = await this.prisma.employee.count({
      where: { resignDate: { not: null } },
    });

    const salaryWhere = { month: currentMonth, year: currentYear };
    const salaryAggregate = await this.prisma.salary.aggregate({
      where: salaryWhere,
      _sum: { amount: true, bonus: true, deduction: true },
    });

    const headcount = await this.prisma.salary.count({
      where: salaryWhere,
    });

    return {
      totalEmployees,
      totalResigned,
      headcount,
      salaryMonth: currentMonth,
      salaryYear: currentYear,
      totalSalaryPaid: salaryAggregate._sum.amount || 0,
      totalBonus: salaryAggregate._sum.bonus || 0,
    };
  }
}
