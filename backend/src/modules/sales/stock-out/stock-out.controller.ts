import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StockOutService } from './stock-out.service';
import { CreateStockOutDto } from './dto/create-stock-out.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { FindStockOutQueryDto } from './dto/find-stock-out-query.dto';
import { UpdateStockOutDto } from './dto/update-stock-out.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-outs')
export class StockOutController {
  constructor(private readonly service: StockOutService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  create(@Body() dto: CreateStockOutDto, @Request() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockOutDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  findAll(@Query() query: FindStockOutQueryDto) {
    return this.service.findAll(query);
  }
}
