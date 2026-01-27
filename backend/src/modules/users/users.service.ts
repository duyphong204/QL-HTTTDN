import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }
    async findAll() {
        return this.prisma.user.findMany({
            include: { profile: true }
        });
    }
    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });
    }

    async create(data: any) {
        return this.prisma.user.create({
            data,
            include: { profile: true }
        });
    }
    async remove(id: string) {
        return this.prisma.user.delete({
            where: { id }
        })
    }
    async updateRole(id: string, role: any) {
        return this.prisma.user.update({
            where: { id },
            data: { role }
        })
    }
}
