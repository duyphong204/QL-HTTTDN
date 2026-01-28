import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }
    async findAll(search?: string, categoryId?: string) {
        return this.prisma.product.findMany({
            where: {
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ]
                }),
                ...(categoryId && { categoryId }),
            },
            include: {
                supplier: true,
                category: true,
            }
        });
    }
    async create(dto: CreateProductDto) {
        return this.prisma.product.create({ data: dto });
    }
    async remove(id: string) {
        return this.prisma.product.delete({ where: { id } });
    }
}
