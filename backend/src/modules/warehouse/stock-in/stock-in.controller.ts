import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StockInService } from './stock-in.service';
import {
  CreateStockInDto,
  QueryStockInDto,
  UpdateStockInDto,
} from './dto/stock-in.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('stock-ins')
export class StockInController {
  constructor(private readonly stockInService: StockInService) {}

  @Get()
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  findAll(@Query() query: QueryStockInDto) {
    return this.stockInService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.stockInService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  create(@Body() dto: CreateStockInDto, @Request() req: any) {
    return this.stockInService.createStockIn(dto, req.user.id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockInDto,
  ) {
    return this.stockInService.updateStockIn(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.stockInService.removeStockIn(id);
  }
}
