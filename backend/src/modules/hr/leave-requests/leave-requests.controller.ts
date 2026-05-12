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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { LeaveRequestsService } from './leave-requests.service';
import {
  CreateLeaveDto,
  UpdateLeaveStatusDto,
  QueryLeaveRequestDto,
} from './dto/leave.dto';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ValidationPipe } from '@nestjs/common';
import { LeaveStatus } from '@prisma/client';
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.WAREHOUSE_MANAGER,
    Role.SALES_MANAGER,
  )
  @Post()
  async create(@Request() req: any, @Body() dto: CreateLeaveDto) {
    return this.leaveRequestsService.create(req.user.id, dto);
  }
  @Get('me')
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.WAREHOUSE_MANAGER,
    Role.SALES_MANAGER,
  )
  async getMyRequests(@Request() req: any) {
    return this.leaveRequestsService.getMyRequests(req.user.id);
  }

  @Get('balance')
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.WAREHOUSE_MANAGER,
    Role.SALES_MANAGER,
  )
  async getMyBalance(@Request() req: any) {
    return this.leaveRequestsService.getMyBalance(req.user.id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveStatusDto,
    @Request() req: any,
  ) {
    return this.leaveRequestsService.updateStatus(
      id,
      dto.status as LeaveStatus,
      req.user.id,
      dto.rejectionReason,
    );
  }
  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  findAll(@Query() query: QueryLeaveRequestDto) {
    return this.leaveRequestsService.findAll(query);
  }
  @Delete(':id')
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.WAREHOUSE_MANAGER,
    Role.SALES_MANAGER,
  )
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.leaveRequestsService.delete(id, req.user.id);
  }
}
