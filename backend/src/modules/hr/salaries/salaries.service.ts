import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateSalaryDto } from "./dto/salary.dto";

@Injectable()
export class SalariesService {
    constructor(private prisma: PrismaService) { }
    async calculateSalary(dto: CreateSalaryDto) {
        const exist = await this.prisma.salary.findFirst({
            where: {
                employeeId: dto.employeeId,
                month: dto.month,
                year: dto.year
            }
        })
        if (exist) throw new ConflictException('Nhân viên này đã được tính lương tháng này rồi!');
        // Lấy lương cơ bản của nhân viên
        const employee = await this.prisma.employee.findUnique(
            {
                where:
                    { id: dto.employeeId },
                include: {
                    user:
                    {
                        include:
                            { profile: true }
                    }
                }
            });
        if (!employee) throw new NotFoundException('Nhân viên không tồn tại');
        // Công thức: Tổng nhận = Lương CB + Thưởng - Phạt
        const finalAmount = employee.baseSalary + dto.bonus - dto.deduction;
        return this.prisma.salary.create({
            data: {
                ...dto,
                amount: finalAmount
            }
        });
    }

    async getMySalaries(userId: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId }
        })
        if (!employee) throw new NotFoundException('Nhân viên không tồn tại');
        return this.prisma.salary.findMany({
            where: { employeeId: employee.id },
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        })
    }
    async findAll(month?: number, year?: number) {
        return this.prisma.salary.findMany({
            where: {
                ...month && { month },
                ...year && { year }
            },
            include: { employee: { include: { user: { include: { profile: true } } } } }
        })
    }
}