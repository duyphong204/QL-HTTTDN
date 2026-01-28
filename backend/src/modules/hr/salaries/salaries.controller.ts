import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { SalariesService } from './salaries.service';
import { CreateSalaryDto } from './dto/salary.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('HR - Salaries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hr/salaries')

export class SalariesController {
    constructor(private readonly salariesService: SalariesService) { }

    @Post()
    @Roles(Role.ADMIN, Role.HR_MANAGER)
    create(@Body() dto: CreateSalaryDto) {
        return this.salariesService.calculateSalary(dto);
    }
    @Get('me')
    getMySalaries(@Request() req: any) {
        return this.salariesService.getMySalaries(req.user.userId);
    }
    @Get()
    @Roles(Role.ADMIN, Role.HR_MANAGER)
    findAll(@Query('month') month?: string, @Query('year') year?: string) {
        return this.salariesService.findAll(month ? +month : undefined, year ? +year : undefined);
    }
}