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
  @Get('me')
  getMe(@Request() req: any) {
    return this.employeesService.getProfile(req.user.id);
  }
  @Get('statistics/hr-report')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  getHrStatistics(@Query('month') month?: string, @Query('year') year?: string) {
    return this.employeesService.getHrStatisticsWithFilter(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }
  @Patch('me') //Nhân viên tự sửa thông tin
  updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.employeesService.updateMe(req.user.id, dto);
  }
  @Post('')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }
  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async findAll(@Query() query?: QueryEmployeeDto) {
    return this.employeesService.findAll(query);
  }
  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }
  @Delete(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async findOne(@Param('id') id: string) {
    return this.employeesService.getEmployeeById(id);
  }
}
