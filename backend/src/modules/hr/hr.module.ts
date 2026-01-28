import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employees.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { SalariesModule } from './salaries/salaries.module';

@Module({
    imports: [
        EmployeesModule,
        LeaveRequestsModule,
        SalariesModule
    ],
})
export class HRModule { }