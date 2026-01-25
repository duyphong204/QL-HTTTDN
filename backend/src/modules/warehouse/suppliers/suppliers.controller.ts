import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/supplier.dto';

@Controller('suppliers')
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }
    @Get()
    findAll() {
        return this.suppliersService.findAll();
    }
    @Post()
    create(@Body() dto: CreateSupplierDto) {
        return this.suppliersService.create(dto);
    }
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.suppliersService.remove(id);
    }
}
