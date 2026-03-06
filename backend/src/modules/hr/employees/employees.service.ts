import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateEmployeeFromUserDto,
  UpdateEmployeeDto,
  UpdateProfileDto,
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
  async createFromUser(userId: string, dto: CreateEmployeeFromUserDto) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { employee: true },
      });

      if (!user) {
        throw new NotFoundException('User không tồn tại');
      }

      if (user.employee) {
        throw new ConflictException('User đã là nhân viên');
      }

      // 🔥 Sinh mã tự động
      const generatedCode = await this.generateEmployeeCode(tx);

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          code: generatedCode,
          department: dto.department,
          position: dto.position,
          baseSalary: dto.baseSalary,
          joinDate: dto.joinDate ? new Date(dto.joinDate) : new Date(),
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { role: 'EMPLOYEE' },
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
  async getProfile(userId: string) {
    return this.prisma.employee.findUnique({
      where: { userId },
      include: {
        user: { include: { profile: true } },
        jobHistories: true,
      },
    });
  }
  async findAll() {
    return this.prisma.employee.findMany({
      where: { resignDate: null },
      include: {
        user: { include: { profile: true } },
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
}
