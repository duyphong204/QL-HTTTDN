import { Module } from '@nestjs/common';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';
import { CloudinaryModule } from '@app/common/cloudinary/cloudinary.module';
import { PrismaModule } from '@app/common/prisma/prisma.module';
import { RmqModule, RABBITMQ_SERVICE } from '@app/common';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    RmqModule.register({ name: RABBITMQ_SERVICE }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductsModule {}

