import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAll(search, categoryId);
  }
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }
  @Get('statistics/inventory-report')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  getInventoryStatistics() {
    return this.productsService.getInventoryStatistics();
  }
}
