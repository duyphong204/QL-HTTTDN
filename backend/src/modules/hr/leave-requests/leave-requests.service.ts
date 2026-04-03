import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeaveDto } from './dto/leave.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateLeaveDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }
    return this.prisma.leaveRequest.create({
      data: {
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        type: dto.type,
        reason: dto.reason,
        employeeId: employee.id,
      },
    });
  }
  async getMyRequests(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) throw new NotFoundException('Không tìm thấy nhân viên');
    const requests = await this.prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        startDate: true,
        endDate: true,
        reason: true,
        status: true,
        createdAt: true,
        employee: {
          select: {
            user: { select: { profile: { select: { fullName: true } } } },
          },
        },
      },
    });
    return requests.map((item) => ({
      id: item.id,
      employeeName: item.employee.user.profile?.fullName ?? 'Bạn',
      type: item.type,
      startDate: item.startDate,
      endDate: item.endDate,
      reason: item.reason,
      status: item.status,
      createdAt: item.createdAt,
    }));
  }
  async findAll(query?: {
    status?: string;
    type?: string;
    employeeId?: string;
    year?: string;
  }) {
    const { status, type, employeeId, year } = query || {};

    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(employeeId ? { employeeId } : {}),
        ...(year
          ? {
              createdAt: {
                gte: new Date(Number(year), 0, 1),
                lte: new Date(Number(year), 11, 31, 23, 59, 59),
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        type: true,
        startDate: true,
        endDate: true,
        reason: true,
        status: true,
        createdAt: true,
        employee: {
          select: {
            code: true,
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
  async updateStatus(id: string, status: string, adminId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException('Không tìm thấy đơn nghỉ');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Đơn đã được xử lý');
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById: adminId,
      },
    });
  }
  async delete(id: string, userId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: { select: { userId: true } } },
    });
    if (!leave) throw new NotFoundException('Không tìm thấy đơn nghỉ');
    // Kiểm tra quyền sở hữu
    if (leave.employee.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa đơn này');
    if (leave.status !== 'PENDING')
      throw new BadRequestException('Chỉ có thể xóa đơn đang chờ duyệt');
    return this.prisma.leaveRequest.delete({ where: { id } });
  }
}
