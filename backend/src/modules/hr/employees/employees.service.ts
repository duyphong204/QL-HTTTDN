import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateEmployeeFromUserDto, UpdateEmployeeDto, UpdateProfileDto } from "./dto/employee.dto";

@Injectable()
export class EmployeesService {
    constructor(private prisma: PrismaService) { }

    async updateMe(userId: string, dto: UpdateProfileDto) {
        return this.prisma.profile.update({
            where: { userId },
            data: dto
        })
    }
    async create(dto: CreateEmployeeFromUserDto) {
        return this.prisma.$transaction(async (tx) => {
            const employee = await tx.employee.create({
                data: dto
            })
            await tx.user.update({
                where: { id: dto.userId },
                data: { role: "EMPLOYEE" }
            })
            await tx.jobHistory.create({
                data: {
                    employeeId: employee.id,
                    department: dto.department,
                    position: dto.position,
                    baseSalary: dto.baseSalary,
                    startDate: new Date()
                }
            })
            return employee
        })
    }
    async getProfile(userId: string) {
        return this.prisma.employee.findUnique({
            where: { userId },
            include: {
                user: { include: { profile: true } },
                jobHistories: true
            }
        })
    }
    async findAll() {
        return this.prisma.employee.findMany({
            where: { resignDate: null },
            include: {
                user: { include: { profile: true } }
            }
        })
    }
    //  cập nhật chức vụ/lương 
    async update(id: string, dto: UpdateEmployeeDto) {
        const currentEmployee = await this.prisma.employee.findUnique({
            where: { id }
        })
        if (!currentEmployee) {
            throw new NotFoundException("Không tìm thấy nhân viên")
        }
        return this.prisma.$transaction(async (tx) => {
            // 1. Kết thúc job hiện tại
            await tx.jobHistory.updateMany({
                where: {
                    employeeId: id,
                    endDate: null
                },
                data: {
                    endDate: new Date()
                }
            });
            // 2. Lưu vào lịch sử công việc
            await tx.jobHistory.create({
                data: {
                    employeeId: id,
                    department: dto.department || currentEmployee.department,
                    position: dto.position || currentEmployee.position,
                    baseSalary: dto.baseSalary || currentEmployee.baseSalary,
                    startDate: new Date()
                }
            });
            return tx.employee.update({
                where: { id },
                data: dto
            });
        });
    }
    async remove(id: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: { user: true }
        })
        if (!employee) {
            throw new NotFoundException("Không tìm thấy nhân viên")
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.employee.update({
                where: { id },
                data: { resignDate: new Date() }
            })
            await tx.jobHistory.updateMany({
                where: { employeeId: id, endDate: null },
                data: { endDate: new Date() }
            })
            await tx.user.update({
                where: { id: employee.userId },
                data: { role: "CUSTOMER" }
            })
            return { message: "Nhân sự đã được cho nghĩ việc" }
        })
    }
}