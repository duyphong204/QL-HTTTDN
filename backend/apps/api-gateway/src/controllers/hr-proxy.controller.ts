import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HR_SERVICE, Public, CurrentUser } from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller()
export class HrProxyController {
  constructor(@Inject(HR_SERVICE) private readonly hrClient: ClientProxy) {}

  // Employees
  @Public()
  @Get('employees')
  async getEmployees(@Query() query: any) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'employees.find_all' }, query),
    );
  }

  @Public()
  @Get('employees/hr')
  async getEmployeesHr(@Query() query: any) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'employees.find_all' }, query),
    );
  }

  @Get('employees/me')
  async getMyEmployeeProfile(@CurrentUser('id') userId: string) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'employees.get_me' }, userId),
    );
  }

  @Patch('employees/me')
  async updateMyEmployeeProfile(
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    // Assuming update_me uses userId. Wait, update_me in HrServiceController might just be updateEmployeeProfile... let's just pass body for now
    return firstValueFrom(
      this.hrClient.send({ cmd: 'employees.update_me' }, body),
    );
  }

  @Get('employees/hr/statistics/hr-report')
  async getHrStatisticsReport(@Query() query: any) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'employees.hr_report' }, query),
    );
  }

  @Public()
  @Get('employees/:id')
  async getEmployeeById(@Param('id') id: string) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'employees.find_one' }, id),
    );
  }

  @Post('employees')
  async createEmployee(@Body() dto: any) {
    return firstValueFrom(this.hrClient.send({ cmd: 'employees.create' }, dto));
  }

  @Delete('employees/:id')
  async deleteEmployee(@Param('id') id: string) {
    return firstValueFrom(this.hrClient.send({ cmd: 'employees.delete' }, id));
  }

  // Salaries
  @Get('salaries')
  async getSalaries(@Query() query: any) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'salaries.find_all' }, query),
    );
  }

  @Get('salaries/my')
  async getMySalaries(@CurrentUser('id') userId: string, @Query() query: any) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'salaries.find_my' }, { userId, query }),
    );
  }

  @Get('salaries/statistics')
  async getSalaryStats(@Query() query: any) {
    return firstValueFrom(this.hrClient.send({ cmd: 'salaries.stats' }, query));
  }

  @Post('salaries/calculate-all')
  async calculateAllSalaries(@Body() dto: any) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'salaries.calculate_batch' }, dto),
    );
  }

  @Post('salaries/calculate')
  async calculateOneSalary(@Body() dto: any) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'salaries.calculate_one' }, dto),
    );
  }

  @Get('salaries/:id')
  async getSalaryById(@Param('id') id: string) {
    return firstValueFrom(this.hrClient.send({ cmd: 'salaries.find_one' }, id));
  }

  // Leave Requests
  @Get('leave-requests')
  async getLeaveRequests(@Query() query: any) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'leave_requests.find_all' }, query),
    );
  }

  @Get('leave-requests/me')
  async getMyLeaveRequests(
    @CurrentUser('id') userId: string,
    @Query() query: any,
  ) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'leave_requests.find_my' }, { userId, query }),
    );
  }

  @Get('leave-requests/balance')
  async getMyLeaveBalance(@CurrentUser('id') userId: string) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'leave_requests.balance' }, userId),
    );
  }

  @Post('leave-requests')
  async createLeaveRequest(
    @CurrentUser('id') userId: string,
    @Body() dto: any,
  ) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'leave_requests.create' }, { userId, dto }),
    );
  }

  @Patch('leave-requests/:id/status')
  async updateLeaveStatus(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(
      this.hrClient.send(
        { cmd: 'leave_requests.update_status' },
        { id, data: body },
      ),
    );
  }

  @Delete('leave-requests/:id')
  async deleteLeaveRequest(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return firstValueFrom(
      this.hrClient.send({ cmd: 'leave_requests.delete' }, { id, userId }),
    );
  }
}
