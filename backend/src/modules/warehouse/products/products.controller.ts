import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productService: ProductsService) { }
    @Get()
    findAll() {
        return this.productService.findAll();
    }
    @Post()
    create(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productService.remove(id);
    }
}
