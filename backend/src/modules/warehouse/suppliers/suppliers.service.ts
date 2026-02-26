import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    return this.prisma.supplier.findMany();
  }
  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async findOne(id: string) {
    return this.prisma.supplier.findUnique({ where: { id } });
  }

  async update(id: string, dto: any) {
    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.supplier.delete({ where: { id } });
  }
}
