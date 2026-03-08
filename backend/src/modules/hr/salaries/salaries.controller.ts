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
import { CreateSalaryDto, UpdateSalaryDto } from './dto/salary.dto';
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

  @Post('calculate')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  create(@Body() dto: CreateSalaryDto) {
    return this.salariesService.calculateSalary(dto);
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
  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  findAll(@Query('month') month?: string, @Query('year') year?: string) {
    return this.salariesService.findAll(
      month ? +month : undefined,
      year ? +year : undefined,
    );
  }
  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateSalaryDto) {
    return this.salariesService.update(id, dto);
  }
}
