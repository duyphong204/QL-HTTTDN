import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { SalariesService } from './salaries.service';
import {
  CalculateAllSalaryDto,
  CreateSalaryDto,
  QuerySalaryDto,
  UpdateSalaryDto,
} from './dto/salary.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
@ApiTags('HR - Salaries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('salaries')
export class SalariesController {
  constructor(private readonly salariesService: SalariesService) { }

  @Post()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  create(@Body() dto: CreateSalaryDto) {
    return this.salariesService.calculateSalary(dto);
  }

  @Post('calculate')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  calculate(@Body() dto: CreateSalaryDto) {
    return this.salariesService.calculateSalary(dto);
  }

  @Post('calculate-all')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  calculateAll(@Body() dto: CalculateAllSalaryDto) {
    return this.salariesService.calculateAllForMonth(dto.month, dto.year);
  }

  @Get('me')
  getMySalaries(
    @Request() req: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const monthNumber = month ? Number(month) : undefined;
    const yearNumber = year ? Number(year) : undefined;
    return this.salariesService.getMySalaries(
      req.user.id,
      monthNumber,
      yearNumber,
    );
  }
  @Get('my')
  getMySalariesAlias(
    @Request() req: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const monthNumber = month ? Number(month) : undefined;
    const yearNumber = year ? Number(year) : undefined;
    return this.salariesService.getMySalaries(
      req.user.id,
      monthNumber,
      yearNumber,
    );
  }
  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  findAll(@Query() query: QuerySalaryDto) {
    return this.salariesService.findAll(query);
  }
  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  findOne(@Param('id') id: string) {
    return this.salariesService.findOne(id);
  }
  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateSalaryDto) {
    return this.salariesService.update(id, dto);
  }
  @Patch(':id/pay')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  pay(@Param('id') id: string) {
    return this.salariesService.markAsPaid(id);
  }
}
