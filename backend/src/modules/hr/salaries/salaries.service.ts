import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalaryDto, QuerySalaryDto, UpdateSalaryDto } from './dto/salary.dto';
import { Prisma } from '@prisma/client';
@Injectable()
export class SalariesService {
  constructor(private prisma: PrismaService) {}

  private addNetSalary<T extends { amount: number; bonus: number; deduction: number }>(salary: T) {
    return {
      ...salary,
      netSalary: salary.amount,
    };
  }

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
    const salary = await this.prisma.salary.create({
      data: {
        ...dto,
        status: dto.status ?? 'PENDING',
        amount: finalAmount,
      },
      include: {
        employee: {
          select: {
            id: true,
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

    return this.addNetSalary(salary);
  }

  async calculateAllForMonth(month: number, year: number) {
    const activeEmployees = await this.prisma.employee.findMany({
      where: {
        resignDate: null,
        user: {
          isActive: true,
        },
      },
      select: {
        id: true,
        baseSalary: true,
      },
    });

    return this.prisma.$transaction(async (tx) => {
      let created = 0;
      let skipped = 0;

      for (const employee of activeEmployees) {
        const existing = await tx.salary.findFirst({
          where: {
            employeeId: employee.id,
            month,
            year,
          },
          select: { id: true },
        });

        if (existing) {
          skipped += 1;
          continue;
        }

        await tx.salary.create({
          data: {
            employeeId: employee.id,
            month,
            year,
            bonus: 0,
            deduction: 0,
            amount: employee.baseSalary,
            status: 'PENDING',
          },
        });
        created += 1;
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

    return salaries.map((salary) => this.addNetSalary(salary));
  }
  async findAll(query: QuerySalaryDto) {
    const { month, year, employeeId, status } = query;
    const where: Prisma.SalaryWhereInput = {};

    if (month !== undefined) {
      where.month = month;
    }

    if (year !== undefined) {
      where.year = year;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    const salaries = await this.prisma.salary.findMany({
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

    return salaries.map((salary) => this.addNetSalary(salary));
  }

  async findOne(id: string) {
    const salary = await this.prisma.salary.findUnique({
      where: { id },
      include: {
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

    if (!salary) {
      throw new NotFoundException('Lương không tồn tại');
    }

    return this.addNetSalary(salary);
  }

  async markAsPaid(id: string) {
    const exist = await this.prisma.salary.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException('Lương không tồn tại');
    }

    const salary = await this.prisma.salary.update({
      where: { id },
      data: { status: 'PAID' },
      include: {
        employee: {
          select: {
            id: true,
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

    return this.addNetSalary(salary);
  }
  async update(id: string, dto: UpdateSalaryDto) {
    const exist = await this.prisma.salary.findUnique({
      where: { id },
    });
    if (!exist) throw new NotFoundException('Lương không tồn tại');
    const salary = await this.prisma.salary.update({
      where: { id },
      data: dto,
      include: {
        employee: {
          select: {
            id: true,
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

    return this.addNetSalary(salary);
  }
}
