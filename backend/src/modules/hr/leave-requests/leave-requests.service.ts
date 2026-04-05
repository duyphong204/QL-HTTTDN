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

  // Helper nội bộ để lấy ID nhân viên, tránh lặp code
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
    const requests = await this.prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            user: { select: { profile: { select: { fullName: true } } } },
          },
        },
      },
    });

    return requests.map((item) => ({
      ...item,
      employeeName: item.employee.user.profile?.fullName ?? 'Bạn',
      // Loại bỏ field employee lồng nhau để trả về đúng format cũ
      employee: undefined,
    }));
  }

  async findAll(query?: {
    status?: string;
    type?: string;
    employeeId?: string;
    year?: string;
  }) {
    const { status, type, employeeId, year } = query || {};

    // Xử lý filter năm gọn hơn
    const dateFilter = year
      ? {
          createdAt: {
            gte: new Date(Number(year), 0, 1),
            lte: new Date(Number(year), 11, 31, 23, 59, 59),
          },
        }
      : {};

    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: {
        status,
        type,
        employeeId,
        ...dateFilter,
      },
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

  async updateStatus(id: string, status: string, adminId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });

    if (!leave) throw new NotFoundException('Không tìm thấy đơn nghỉ');
    if (leave.status !== 'PENDING')
      throw new BadRequestException('Đơn đã được xử lý');

    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status, approvedById: adminId },
    });
  }

  async delete(id: string, userId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      select: {
        status: true,
        employee: { select: { userId: true } },
      },
    });

    if (!leave) throw new NotFoundException('Không tìm thấy đơn nghỉ');
    if (leave.employee.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa đơn này');
    if (leave.status !== 'PENDING')
      throw new BadRequestException('Chỉ có thể xóa đơn đang chờ duyệt');

    return this.prisma.leaveRequest.delete({ where: { id } });
  }
}
