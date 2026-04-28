import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    return this.prisma.category.findMany();
  }
  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Không thể xóa danh mục vì đang có ${productCount} sản phẩm sử dụng danh mục này. Vui lòng chuyển sản phẩm sang danh mục khác hoặc xóa sản phẩm trước.`,
      );
    }

    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Không thể xóa danh mục do còn dữ liệu liên quan trong hệ thống.',
        );
      }

      throw new BadRequestException(
        'Xóa danh mục thất bại do lỗi dữ liệu. Vui lòng thử lại sau.',
      );
    }
  }
}
