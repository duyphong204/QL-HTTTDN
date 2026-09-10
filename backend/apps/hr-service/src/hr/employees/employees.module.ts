import { Module } from '@nestjs/common';
import { EmployeeSelfController } from './controllers/employee-self.controller';
import { HrManagementController } from './controllers/hr-management.controller';
import { EmployeeSelfService } from './services/employee-self.service';
import { HrManagementService } from './services/hr-management.service';

@Module({
  controllers: [EmployeeSelfController, HrManagementController],
  providers: [EmployeeSelfService, HrManagementService],
  exports: [EmployeeSelfService, HrManagementService],
})
export class EmployeesModule {}
