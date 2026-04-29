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
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateProfileDto,
  QueryEmployeeDto,
} from './dto/employee.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ValidationPipe } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  // ==================== EMPLOYEE SELF SERVICE ====================
  @Get('me')
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.SALES_MANAGER,
    Role.WAREHOUSE_MANAGER,
  )
  getMe(@Request() req: any) {
    return this.employeesService.getProfile(req.user.id);
  }

  @Patch('me')
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.WAREHOUSE_MANAGER,
    Role.SALES_MANAGER,
  )
  updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.employeesService.updateMe(req.user.id, dto);
  }

  @Get(':id/job-history')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  getJobHistory(@Param('id') id: string, @Request() req: any) {
    return this.employeesService.getJobHistory(id, req.user);
  }

  // ==================== MANAGER / HR ====================
  @Post()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  findAll(@Query() query?: QueryEmployeeDto) {
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.employeesService.getEmployeeById(id, req.user);
  }

  // Thay đổi chức vụ + lương (có effectiveDate)
  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  updateEmployee(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.updateEmployee(id, dto);
  }

  @Patch(':id/position')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  updatePosition(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.updateEmployee(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Get('statistics/hr-report')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  getHrStatistics(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.employeesService.getHrStatisticsWithFilter(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }
}
