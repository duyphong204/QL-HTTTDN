import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StockInService } from './stock-in.service';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateStockInDto } from './dto/stock-in.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('StockIn')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-in')
export class StockInController {
  constructor(private readonly stockInService: StockInService) {}
  @Post()
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  create(@Body() dto: CreateStockInDto, @Request() req: any) {
    return this.stockInService.createStockIn(dto, req.user.userId);
  }
  @Get()
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  findAll() {
    return this.stockInService.findAll();
  }
}
