import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeaveDto, QueryLeaveRequestDto } from './dto/leave.dto';
import { LeaveType, Prisma } from '@prisma/client';

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) {}

  private async getEmployeeOrThrow(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      select: { id: true, code: true },
    });
    if (!employee) throw new NotFoundException('Không tìm thấy nhân viên');
    return employee;
  }

  async create(userId: string, dto: CreateLeaveDto) {
    const employee = await this.getEmployeeOrThrow(userId);
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end < start) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    return this.prisma.leaveRequest.create({
      data: {
        startDate: start,
        endDate: end,
        type: dto.type,
        reason: dto.reason,
        employeeId: employee.id,
      },
    });
  }

  async getMyRequests(userId: string) {
    const employee = await this.getEmployeeOrThrow(userId);
    return this.prisma.leaveRequest
      .findMany({
        where: { employeeId: employee.id },
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: {
              user: {
                select: { profile: { select: { fullName: true } } },
              },
            },
          },
        },
      })
      .then((requests) =>
        requests.map((item) => ({
          ...item,
          employeeName: item.employee.user.profile?.fullName ?? 'Bạn',
          employee: undefined,
        })),
      );
  }

  async findAll(query?: QueryLeaveRequestDto) {
    const { status, type, employeeId, year } = query || {};
    const where: Prisma.LeaveRequestWhereInput = {
      ...(status ? { status } : {}),
      ...(type ? { type: type as LeaveType } : {}),
      ...(employeeId ? { employeeId } : {}),
    };

    if (year) {
      where.createdAt = {
        gte: new Date(`${year}-01-01T00:00:00Z`),
        lte: new Date(`${year}-12-31T23:59:59Z`),
      };
    }

    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            code: true,
            user: { select: { profile: { select: { fullName: true } } } },
          },
        },
      },
    });

    return leaveRequests.map((item) => ({
      id: item.id,
      employeeName: item.employee.user.profile?.fullName ?? item.employee.code,
      type: item.type,
      startDate: item.startDate,
      endDate: item.endDate,
      reason: item.reason,
      status: item.status,
      createdAt: item.createdAt,
    }));
  }

  async updateStatus(
    id: string,
    status: string,
    adminId: string,
    rejectionReason?: string,
  ) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) throw new NotFoundException('Không tìm thấy đơn nghỉ');
    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Đơn đã được xử lý');
    }

    return this.prisma.$transaction(async (tx) => {
      if (status === 'APPROVED') {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateOnly = new Date(d.toISOString().split('T')[0]);

          await tx.attendance.upsert({
            where: {
              employeeId_date: {
                employeeId: leave.employeeId,
                date: dateOnly,
              },
            },
            create: {
              employeeId: leave.employeeId,
              date: dateOnly,
              status: 'LEAVE',
            },
            update: { status: 'LEAVE' },
          });
        }
      }
      return tx.leaveRequest.update({
        where: { id },
        data: {
          status,
          approvedById: adminId,
        },
      });
    });
  }

  async delete(id: string, userId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leave) throw new NotFoundException('Không tìm thấy đơn nghỉ');
    if (leave.employee.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền');
    }
    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Chỉ xóa đơn đang chờ');
    }

    return this.prisma.leaveRequest.delete({ where: { id } });
  }
}
