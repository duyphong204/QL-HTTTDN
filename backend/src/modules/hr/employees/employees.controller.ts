import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards, UsePipes } from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeFromUserDto, UpdateEmployeeDto, UpdateProfileDto } from "./dto/employee.dto";
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { ValidationPipe } from "@nestjs/common";

@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('hr/employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }
    @Get('me')
    getMe(@Request() req: any) {
        return this.employeesService.getProfile(req.user.userId);
    }
    @Patch('me') //Nhân viên tự sửa thông tin
    updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
        return this.employeesService.updateMe(req.user.userId, dto);
    }
    @Post()
    @Roles(Role.ADMIN, Role.HR_MANAGER)
    async create(@Body() dto: CreateEmployeeFromUserDto) {
        return this.employeesService.create(dto);
    }
    @Get()
    @Roles(Role.ADMIN, Role.HR_MANAGER)
    async findAll() {
        return this.employeesService.findAll();
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
}