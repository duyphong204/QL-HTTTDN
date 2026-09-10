import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { UpdateProfileDto } from '../dto/update-me.dto';

export const COMMON_USER_SELECT = {
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
};

@Injectable()
export class EmployeeSelfService {
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
          select: COMMON_USER_SELECT,
        },
        jobHistories: {
          orderBy: { startDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!employee) throw new NotFoundException('Nhân viên không tồn tại');
    return employee;
  }
}
