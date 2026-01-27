import { Body, Controller, Delete, Get, Param, Patch, Put, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";

@ApiTags('Admin - User Management')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    getAllUsers() {
        return this.usersService.findAll();
    }
    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
    @Patch(':id/role')
    changeRole(@Param('id') id: string, @Body('role') role: string) {
        return this.usersService.updateRole(id, role);
    }
}