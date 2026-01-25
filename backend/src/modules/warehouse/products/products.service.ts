import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }
    async findAll() {
        return this.prisma.product.findMany();
    }
    async create(dto: CreateProductDto) {
        return this.prisma.product.create({ data: dto });
    }
    async remove(id: string) {
        return this.prisma.product.delete({ where: { id } });
    }
}
