import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { CreateLeaveDto, QueryLeaveRequestDto } from './dto/leave.dto';
import { LeaveType, LeaveStatus, Prisma } from '@prisma/client';
import { countWeekdays } from '../salaries/salary.utils';
import {
  calculatePaginationSkip,
  buildPaginatedResponse,
} from '@app/common/utils/pagination.helper';

const DEFAULT_ANNUAL_DAYS = 12;

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

    // Kiểm tra trùng lịch với đơn đang PENDING hoặc APPROVED
    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
    if (overlap) {
      throw new BadRequestException(
        'Đã có đơn nghỉ phép trùng với khoảng thời gian này',
      );
    }

    // Kiểm tra số ngày phép còn lại nếu là ANNUAL
    if (dto.type === LeaveType.ANNUAL) {
      const year = start.getFullYear();
      const requestedDays = countWeekdays(start, end);

      const balance = await this.prisma.leaveBalance.findUnique({
        where: { employeeId_year: { employeeId: employee.id, year } },
      });

      const totalDays = balance?.totalDays ?? DEFAULT_ANNUAL_DAYS;
      const usedDays = balance?.usedDays ?? 0;
      const remaining = totalDays - usedDays;

      if (requestedDays > remaining) {
        throw new BadRequestException(
          `Không đủ ngày phép. Còn lại: ${remaining} ngày, yêu cầu: ${requestedDays} ngày`,
        );
      }
    }

    return this.prisma.leaveRequest.create({
      data: {
        startDate: start,
        endDate: end,
        type: dto.type,
        reason: dto.reason,
        employeeId: employee.id,
        totalDays: countWeekdays(start, end),
      },
    });
  }

  async getMyRequests(userId: string, query?: QueryLeaveRequestDto) {
    const employee = await this.getEmployeeOrThrow(userId);
    const { page = 1, limit = 10 } = query || {};
    const skip = calculatePaginationSkip(Number(page), Number(limit));

    const where: Prisma.LeaveRequestWhereInput = { employeeId: employee.id };

    const [requests, total] = await this.prisma.$transaction([
      this.prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          employee: {
            select: {
              user: { select: { profile: { select: { fullName: true } } } },
            },
          },
        },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    const data = requests.map((item) => ({
      ...item,
      employeeName: item.employee.user.profile?.fullName ?? 'Bạn',
      employee: undefined,
    }));

    return buildPaginatedResponse(data, total, Number(page), Number(limit));
  }

  async getMyBalance(userId: string) {
    const employee = await this.getEmployeeOrThrow(userId);
    const year = new Date().getFullYear();

    const balance = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_year: { employeeId: employee.id, year } },
    });

    const totalDays = balance?.totalDays ?? DEFAULT_ANNUAL_DAYS;
    const usedDays = balance?.usedDays ?? 0;
    return { year, totalDays, usedDays, remainingDays: totalDays - usedDays };
  }

  async findAll(query?: QueryLeaveRequestDto) {
    const {
      status,
      type,
      employeeId,
      year,
      month,
      page = 1,
      limit = 10,
    } = query || {};
    const skip = calculatePaginationSkip(Number(page), Number(limit));

    const where: Prisma.LeaveRequestWhereInput = {};
    if (status) where.status = status as LeaveStatus;
    if (type) where.type = type;
    if (employeeId) where.employeeId = employeeId;

    if (year || month) {
      const y = year ? parseInt(year) : new Date().getFullYear();
      if (month) {
        const m = parseInt(month);
        where.startDate = {
          gte: new Date(y, m - 1, 1),
          lte: new Date(y, m, 0, 23, 59, 59, 999),
        };
      } else {
        where.startDate = {
          gte: new Date(y, 0, 1),
          lte: new Date(y, 11, 31, 23, 59, 59, 999),
        };
      }
    }

    const [leaveRequests, total] = await this.prisma.$transaction([
      this.prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          employee: {
            select: {
              code: true,
              user: {
                select: { profile: { select: { fullName: true } } },
              },
            },
          },
        },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    const data = leaveRequests.map((item) => ({
      id: item.id,
      employeeId: item.employeeId,
      employeeName: item.employee.user.profile?.fullName ?? item.employee.code,
      type: item.type,
      startDate: item.startDate,
      endDate: item.endDate,
      totalDays: item.totalDays,
      status: item.status,
      reason: item.reason,
      rejectionReason: item.rejectionReason,
      createdAt: item.createdAt,
    }));

    return buildPaginatedResponse(data, total, Number(page), Number(limit));
  }

  async updateStatus(
    id: string,
    status: LeaveStatus,
    adminId: string,
    rejectionReason?: string,
  ) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) throw new NotFoundException('Không tìm thấy đơn nghỉ');

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Đơn đã được xử lý');
    }

    return this.prisma.$transaction(async (tx) => {
      if (status === LeaveStatus.APPROVED) {
        if (leave.type === LeaveType.ANNUAL) {
          const year = leave.startDate.getFullYear();
          const days = countWeekdays(leave.startDate, leave.endDate);

          await tx.leaveBalance.upsert({
            where: {
              employeeId_year: { employeeId: leave.employeeId, year },
            },
            create: {
              employeeId: leave.employeeId,
              year,
              totalDays: DEFAULT_ANNUAL_DAYS,
              usedDays: days,
            },
            update: { usedDays: { increment: days } },
          });
        }

        if (leave.type === LeaveType.RESIGNATION) {
          await tx.employee.update({
            where: { id: leave.employeeId },
            data: { resignDate: leave.endDate },
          });
        }
      }

      return tx.leaveRequest.update({
        where: { id },
        data: {
          status,
          approvedById: adminId,
          rejectionReason:
            status === LeaveStatus.REJECTED ? rejectionReason : null,
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

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Chỉ được xóa đơn đang chờ xử lý');
    }

    return this.prisma.leaveRequest.delete({ where: { id } });
  }
}
