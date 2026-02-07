import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto"

@ApiTags('Admin - User Management')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    getAllUsers() {
        return this.usersService.findAll();
    }
    // GET /users/:id
    @Get(':id')
    getUserById(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
    // POST /users
    @Post()
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }
    // PATCH /users/:id
    @Patch(':id')
    updateUser(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto
    ) {
        return this.usersService.update(id, dto);
    }
    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
    @Patch(':id/role')
    changeRole(@Param('id') id: string, @Body('role') role: Role) {
        return this.usersService.updateRole(id, role);
    }
}