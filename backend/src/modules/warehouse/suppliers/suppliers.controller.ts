import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/supplier.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('Suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }
    @Get()
    findAll() {
        return this.suppliersService.findAll();
    }
    @Post()
    @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
    create(@Body() dto: CreateSupplierDto) {
        return this.suppliersService.create(dto);
    }
    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.suppliersService.remove(id);
    }
}
