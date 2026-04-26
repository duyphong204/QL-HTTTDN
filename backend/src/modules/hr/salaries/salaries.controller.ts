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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CalculateSalaryDto } from './dto/calculate-salary.dto';
import { QuerySalaryDto } from './dto/query-salary.dto';
import { AddSalaryDetailDto } from './dto/salary-detail.dto';
import { SalaryStatus } from '@prisma/client';

@ApiTags('HR - Salaries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('salaries')
export class SalariesController {
  constructor(private readonly salariesService: SalariesService) {}

  @Post('calculate')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  calculate(@Body() dto: CalculateSalaryDto) {
    return this.salariesService.calculateSalary(dto);
  }

  @Post('calculate-all')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  calculateAll(@Body() dto: CalculateSalaryDto) {
    return this.salariesService.calculateAllSalaries(dto.month, dto.year);
  }

  @Get('me')
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.WAREHOUSE_MANAGER,
    Role.SALES_MANAGER,
  )
  getMySalary(@Request() req, @Query() query: QuerySalaryDto) {
    return this.salariesService.findAll(query, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  getSalaries(@Query() query: QuerySalaryDto) {
    return this.salariesService.findAll(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  getStats(@Query() query: QuerySalaryDto) {
    return this.salariesService.getStats(query.month, query.year);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  updateStatus(@Param('id') id: string, @Body('status') status: SalaryStatus) {
    return this.salariesService.updateStatus(id, status);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  getById(@Param('id') id: string, @Request() req) {
    const userId = req.user.role === Role.EMPLOYEE ? req.user.id : undefined;
    return this.salariesService.findOne(id, userId);
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
