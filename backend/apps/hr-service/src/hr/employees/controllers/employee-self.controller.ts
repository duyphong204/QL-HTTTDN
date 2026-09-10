import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmployeeSelfService } from '../services/employee-self.service';
import { UpdateProfileDto } from '../dto/update-me.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/common';
import { Role } from '@app/common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('employees/me')
export class EmployeeSelfController {
  constructor(private readonly employeeSelfService: EmployeeSelfService) {}

  @Get()
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.SALES_MANAGER,
    Role.WAREHOUSE_MANAGER,
  )
  getMe(@Request() req: any) {
    return this.employeeSelfService.getProfile(req.user.id);
  }

  @Patch()
  @Roles(
    Role.EMPLOYEE,
    Role.HR_MANAGER,
    Role.WAREHOUSE_MANAGER,
    Role.SALES_MANAGER,
  )
  updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.employeeSelfService.updateMe(req.user.id, dto);
  }
}


