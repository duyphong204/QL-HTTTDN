import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employees.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';

@Module({
    imports: [
        EmployeesModule,
        LeaveRequestsModule,
        // Sau này thêm SalaryModule vào đây
    ],
})
export class HRModule { }