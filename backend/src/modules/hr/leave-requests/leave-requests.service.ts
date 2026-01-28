import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateLeaveDto } from "./dto/leave.dto";

@Injectable()
export class LeaveRequestsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateLeaveDto) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId }
        })
        if (!employee) {
            throw new NotFoundException("Không tìm thấy nhân viên")
        }
        return this.prisma.leaveRequest.create({
            data: {
                ...dto,
                employeeId: employee.id,
            }
        })
    }

    async findAll() {
        return this.prisma.leaveRequest.findMany({
            include: {
                employee: {
                    include: {
                        user: { include: { profile: true } }
                    }
                }
            }
        })
    }
    async updateStatus(id: string, status: string, adminId: string) {
        return this.prisma.leaveRequest.update({
            where: { id },
            data: { status, approvedById: adminId }
        })
    }
}