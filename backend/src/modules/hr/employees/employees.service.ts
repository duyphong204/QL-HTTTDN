import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
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
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  private async assertEmployeeNotAdminByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role === Role.ADMIN) {
      throw new ForbiddenException('Không được thao tác trên tài khoản ADMIN');
    }
  }

  // ==================== NHÂN VIÊN TỰ XỬ LÝ ====================
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
        fullName: dto.fullName,
        phone: dto.phone,
        address: dto.address,
        avatar: dto.avatar,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }

  async getProfile(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      select: {
        id: true,
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
        jobHistories: {
          orderBy: { startDate: 'desc' },
          take: 5, // lấy vài cái gần nhất
        },
      },
    });

    if (!employee) throw new NotFoundException('Nhân viên không tồn tại');
    return employee;
  }

  // ==================== QUẢN LÝ NHÂN SỰ ====================
  private async generateEmployeeCode(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const lastEmployee = await tx.employee.findFirst({
      orderBy: {
        joinDate: 'desc',
      },
    });

    if (!lastEmployee) return 'NV0001';

    const lastCode = lastEmployee.code;
    const numberPart = parseInt(lastCode.replace('NV', ''), 10);
    const nextNumber = isNaN(numberPart) ? 1 : numberPart + 1;

    return `NV${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateEmployeeDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { role: true },
    });

    if (existingUser) {
      if (existingUser.role === Role.ADMIN) {
        throw new ForbiddenException(
          'Không được thao tác trên tài khoản ADMIN',
        );
      }
      throw new BadRequestException('Email đã tồn tại trong hệ thống');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: Role.EMPLOYEE,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          fullName: dto.fullName,
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          code: await this.generateEmployeeCode(tx),
          department: dto.department,
          position: dto.position,
          baseSalary: dto.baseSalary,
          joinDate: new Date(),
        },
      });

      await tx.jobHistory.create({
        data: {
          employeeId: employee.id,
          department: dto.department,
          position: dto.position,
          baseSalary: dto.baseSalary,
          startDate: new Date(),
        },
      });

      return employee;
    });
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    const current = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!current) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    await this.assertEmployeeNotAdminByUserId(current.userId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.role && dto.role !== current.user.role) {
        if (dto.role === Role.ADMIN) {
          throw new ForbiddenException(
            'Không được cấp quyền ADMIN cho nhân viên',
          );
        }

        await tx.user.update({
          where: { id: current.userId },
          data: { role: dto.role },
        });
      }

      const hasJobChange =
        (dto.department !== undefined &&
          dto.department !== current.department) ||
        (dto.position !== undefined && dto.position !== current.position) ||
        (dto.baseSalary !== undefined && dto.baseSalary !== current.baseSalary);

      if (hasJobChange) {
        const effectiveDate = dto.effectiveDate
          ? new Date(dto.effectiveDate)
          : new Date();

        await tx.jobHistory.updateMany({
          where: {
            employeeId: id,
            endDate: null,
          },
          data: { endDate: effectiveDate },
        });

        await tx.jobHistory.create({
          data: {
            employeeId: id,
            department: dto.department ?? current.department,
            position: dto.position ?? current.position,
            baseSalary: dto.baseSalary ?? current.baseSalary,
            startDate: effectiveDate,
          },
        });

        await tx.employee.update({
          where: { id },
          data: {
            department: dto.department,
            position: dto.position,
            baseSalary: dto.baseSalary,
          },
        });
      }
      return tx.employee.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: true,
            },
          },
          jobHistories: {
            orderBy: { startDate: 'desc' },
            take: 5,
          },
        },
      });
    });
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) throw new NotFoundException('Không tìm thấy nhân viên');
    await this.assertEmployeeNotAdminByUserId(employee.userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: employee.userId },
        data: {
          isActive: false,
          deletedAt: new Date(), // soft delete
        },
      });

      await tx.employee.update({
        where: { id },
        data: { resignDate: new Date() },
      });

      await tx.jobHistory.updateMany({
        where: { employeeId: id, endDate: null },
        data: { endDate: new Date() },
      });

      return { message: 'Nhân sự đã được cho nghỉ việc thành công' };
    });
  }

  // ==================== QUERY & STATISTICS ====================
  async findAll(query?: QueryEmployeeDto) {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'code',
      sortOrder = 'asc',
      department,
      position,
      isActive,
    } = query || {};

    const allowedSortBy = [
      'code',
      'department',
      'position',
      'joinDate',
      'baseSalary',
    ] as const;
    const normalizedSortBy = allowedSortBy.includes(sortBy as any)
      ? sortBy
      : 'code';
    const normalizedSortOrder: Prisma.SortOrder =
      sortOrder === 'desc' ? 'desc' : 'asc';

    const skip = calculatePaginationSkip(page, limit);

    const where: Prisma.EmployeeWhereInput = {
      user: { role: { notIn: [Role.ADMIN, Role.CUSTOMER] } },
      ...(isActive === true
        ? { resignDate: null }
        : isActive === false
          ? { resignDate: { not: null } }
          : {}),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          {
            user: {
              profile: { fullName: { contains: search, mode: 'insensitive' } },
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
                select: { fullName: true, phone: true, avatar: true },
              },
            },
          },
        },
        orderBy: { [normalizedSortBy]: normalizedSortOrder },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async getEmployeeById(id: string, requester?: { id: string; role: Role }) {
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
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!employee) throw new NotFoundException('Không tìm thấy nhân viên');

    if (requester?.role === Role.EMPLOYEE && requester.id !== employee.userId) {
      throw new ForbiddenException('Bạn chỉ được xem hồ sơ của chính mình');
    }

    return employee;
  }

  async getJobHistory(id: string, requester?: { id: string; role: Role }) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!employee) throw new NotFoundException('Không tìm thấy nhân viên');

    if (requester?.role === Role.EMPLOYEE && requester.id !== employee.userId) {
      throw new ForbiddenException('Bạn chỉ được xem lịch sử của chính mình');
    }

    return this.prisma.jobHistory.findMany({
      where: { employeeId: id },
      orderBy: { startDate: 'desc' },
    });
  }

  async getHrStatisticsWithFilter(month?: number, year?: number) {
    const currentMonth = month ?? new Date().getMonth() + 1;
    const currentYear = year ?? new Date().getFullYear();

    const [totalEmployees, totalResigned, salaryAggregate, headcount] =
      await Promise.all([
        this.prisma.employee.count({ where: { resignDate: null } }),
        this.prisma.employee.count({ where: { resignDate: { not: null } } }),
        this.prisma.salary.aggregate({
          where: { month: currentMonth, year: currentYear },
          _sum: { amount: true, bonus: true, deduction: true },
        }),
        this.prisma.salary.count({
          where: { month: currentMonth, year: currentYear },
        }),
      ]);

    return {
      totalEmployees,
      totalResigned,
      headcount,
      salaryMonth: currentMonth,
      salaryYear: currentYear,
      totalSalaryPaid: salaryAggregate._sum.amount || 0,
      totalBonus: salaryAggregate._sum.bonus || 0,
      totalDeduction: salaryAggregate._sum.deduction || 0,
    };
  }
}
