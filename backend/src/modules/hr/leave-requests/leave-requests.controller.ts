import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards, UsePipes } from "@nestjs/common";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { LeaveRequestsService } from "./leave-requests.service";
import { CreateLeaveDto } from "./dto/leave.dto";
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { ValidationPipe } from "@nestjs/common";
@ApiTags('HR - Leave Requests')
@ApiBearerAuth()

@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('hr/leave-requests')
export class LeaveRequestsController {
    constructor(private readonly leaveRequestsService: LeaveRequestsService) { }
    @Post()
    async create(@Request() req: any, @Body() dto: CreateLeaveDto) {
        return this.leaveRequestsService.create(req.user.userId, dto);
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN, Role.HR_MANAGER)
    updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
        return this.leaveRequestsService.updateStatus(id, status, req.user.userId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.HR_MANAGER)
    findAll() {
        return this.leaveRequestsService.findAll();
    }

}