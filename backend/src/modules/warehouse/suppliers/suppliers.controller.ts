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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { QuerySupplierDto } from './dto/supplier.dto';

@ApiTags('Suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'name' | 'email' | 'phone',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const query: QuerySupplierDto = {
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy,
      sortOrder,
    };

    return this.suppliersService.findAll(query);
  }
  @Post()
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
