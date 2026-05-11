import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SalariesService } from './salaries.service';
import {
  CalculateAllDto,
  CalculateSalaryDto,
  StatisticsQueryDto,
} from './dto/calculate-salary.dto';
import { AddSalaryDetailDto } from './dto/salary-detail.dto';
import { QuerySalaryDto } from './dto/query-salary.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';


@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('salaries')
export class SalariesController {
  constructor(private readonly salariesService: SalariesService) {}

  // ==================== EMPLOYEE SELF SERVICE ====================

  @Get('my')
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.ADMIN,
    Role.SALES_MANAGER,
    Role.WAREHOUSE_MANAGER,
  )
  getMySalaries(
    @Request() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.salariesService.getMySalaries(req.user.id, {
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    });
  }

  @Get('my/:id')
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.ADMIN,
    Role.SALES_MANAGER,
    Role.WAREHOUSE_MANAGER,
  )
  getMyById(@Request() req: any, @Param('id') id: string) {
    return this.salariesService.getMyById(req.user.id, id);
  }

  // ==================== HR / ADMIN ====================

  @Get('statistics')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  getStatistics(@Query() query: StatisticsQueryDto) {
    return this.salariesService.getStatistics(query.year, query.month);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  findAll(@Query() query: QuerySalaryDto) {
    return this.salariesService.findAll(query);
  }

  @Get('export')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  exportSalaries(@Query('month') month: string, @Query('year') year: string) {
    return this.salariesService.exportSalaries(Number(month), Number(year));
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  findOne(@Param('id') id: string) {
    return this.salariesService.findOne(id);
  }

  @Post('calculate-all')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  calculateAll(@Body() body: CalculateAllDto) {
    return this.salariesService.calculateAll(body.month, body.year);
  }

  @Post('calculate')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  calculateOne(@Body() dto: CalculateSalaryDto) {
    return this.salariesService.calculateOne(dto);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  approve(@Param('id') id: string) {
    return this.salariesService.approve(id);
  }

  @Patch(':id/pay')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  pay(@Param('id') id: string) {
    return this.salariesService.pay(id);
  }

  @Post(':id/details')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  addDetail(@Param('id') id: string, @Body() dto: AddSalaryDetailDto) {
    return this.salariesService.addDetail(id, dto);
  }

  @Delete(':id/details/:detailId')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  removeDetail(@Param('id') id: string, @Param('detailId') detailId: string) {
    return this.salariesService.removeDetail(id, detailId);
  }
}
