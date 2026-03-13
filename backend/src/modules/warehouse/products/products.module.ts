import { Module } from '@nestjs/common';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductsModule {}
