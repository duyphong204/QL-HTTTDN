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
import { HrManagementService } from '../services/hr-management.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import {
  QueryEmployeeDto,
  ChangePositionDto,
  UpdateEmployeeProfileByHrDto,
} from '../dto/hr-filter.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common';
import { Roles } from '@app/common';
import { Role } from '@app/common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('employees/hr')
export class HrManagementController {
  constructor(private readonly hrManagementService: HrManagementService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  create(@Body() dto: CreateEmployeeDto) {
    return this.hrManagementService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  findAll(@Query() query?: QueryEmployeeDto) {
    return this.hrManagementService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.hrManagementService.getEmployeeById(id, req.user);
  }

  @Get(':id/job-history')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  getJobHistory(@Param('id') id: string, @Request() req: any) {
    return this.hrManagementService.getJobHistory(id, req.user);
  }

  @Patch(':id/position')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  changePosition(@Param('id') id: string, @Body() dto: ChangePositionDto) {
    return this.hrManagementService.changePosition(id, dto);
  }

  @Patch(':id/profile')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  updateEmployeeProfile(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeProfileByHrDto,
  ) {
    return this.hrManagementService.updateEmployeeProfile(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  remove(@Param('id') id: string) {
    return this.hrManagementService.remove(id);
  }

  @Get('statistics/hr-report')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  getHrStatistics(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.hrManagementService.getHrStatisticsWithFilter(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }
}


