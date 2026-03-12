import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalaryDto, UpdateSalaryDto } from './dto/salary.dto';
import { Prisma } from '@prisma/client';
@Injectable()
export class SalariesService {
  constructor(private prisma: PrismaService) {}

  async calculateSalary(dto: CreateSalaryDto) {
    const exist = await this.prisma.salary.findFirst({
      where: {
        employeeId: dto.employeeId,
        month: dto.month,
        year: dto.year,
      },
    });
    if (exist)
      throw new ConflictException(
        'Nhân viên này đã được tính lương tháng này rồi!',
      );
    // Lấy lương cơ bản của nhân viên
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });
    if (!employee) throw new NotFoundException('Nhân viên không tồn tại');
    // Công thức: Tổng nhận = Lương CB + Thưởng - Phạt
    const finalAmount = employee.baseSalary + dto.bonus - dto.deduction;
    return this.prisma.salary.create({
      data: {
        ...dto,
        amount: finalAmount,
      },
    });
  }

  async getMySalaries(userId: string, month?: number, year?: number) {
    return this.prisma.salary.findMany({
      where: {
        employee: {
          userId,
        },
        ...(month && { month }),
        ...(year && { year }),
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        employee: {
          select: {
            code: true,
            baseSalary: true,
            user: {
              select: {
                profile: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  async findAll(month?: number, year?: number) {
    const where: Prisma.SalaryWhereInput = {};

    if (month !== undefined) {
      where.month = month;
    }

    if (year !== undefined) {
      where.year = year;
    }

    return this.prisma.salary.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: {
        id: true,
        month: true,
        year: true,
        amount: true,
        bonus: true,
        deduction: true,
        status: true,
        createdAt: true,

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
                  select: {
                    fullName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  async update(id: string, dto: UpdateSalaryDto) {
    const exist = await this.prisma.salary.findUnique({
      where: { id },
    });
    if (!exist) throw new NotFoundException('Lương không tồn tại');
    return this.prisma.salary.update({
      where: { id },
      data: dto,
    });
  }
}
