import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HrManagementService } from './hr/employees/services/hr-management.service';
import { EmployeeSelfService } from './hr/employees/services/employee-self.service';
import { LeaveRequestsService } from './hr/leave-requests/leave-requests.service';
import { SalariesService } from './hr/salaries/salaries.service';
import { LeaveStatus } from '@prisma/client';

@Controller()
export class HrServiceController {
  constructor(
    private readonly hrManagementService: HrManagementService,
    private readonly employeeSelfService: EmployeeSelfService,
    private readonly leaveRequestsService: LeaveRequestsService,
    private readonly salariesService: SalariesService,
  ) {}

  @MessagePattern({ cmd: 'hr.health' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'hr-service',
      timestamp: new Date().toISOString(),
    };
  }

  // Employees
  @MessagePattern({ cmd: 'employees.find_all' })
  async findAllEmployees(@Payload() query: any) {
    return this.hrManagementService.findAll(query || {});
  }

  @MessagePattern({ cmd: 'employees.find_one' })
  async findOneEmployee(@Payload() id: string) {
    return this.hrManagementService.getEmployeeById(id);
  }

  @MessagePattern({ cmd: 'employees.create' })
  async createEmployee(@Payload() dto: any) {
    return this.hrManagementService.create(dto);
  }

  @MessagePattern({ cmd: 'employees.update' })
  async updateEmployee(@Payload() payload: { id: string; data: any }) {
    return this.hrManagementService.updateEmployeeProfile(
      payload.id,
      payload.data,
    );
  }

  @MessagePattern({ cmd: 'employees.delete' })
  async deleteEmployee(@Payload() id: string) {
    return this.hrManagementService.remove(id);
  }

  @MessagePattern({ cmd: 'employees.get_me' })
  async getMyProfile(@Payload() userId: string) {
    return this.employeeSelfService.getProfile(userId);
  }

  @MessagePattern({ cmd: 'employees.hr_report' })
  async getHrReport(@Payload() query: any) {
    return this.hrManagementService.getHrStatisticsWithFilter(
      query?.month ? Number(query.month) : undefined,
      query?.year ? Number(query.year) : undefined,
    );
  }

  // Leave Requests
  @MessagePattern({ cmd: 'leave_requests.find_all' })
  async findAllLeaveRequests(@Payload() query: any) {
    return this.leaveRequestsService.findAll(query || {});
  }

  @MessagePattern({ cmd: 'leave_requests.find_my' })
  async findMyLeaveRequests(
    @Payload() payload: { userId: string; query: any },
  ) {
    return this.leaveRequestsService.getMyRequests(
      payload.userId || 'system',
      payload.query || {},
    );
  }

  @MessagePattern({ cmd: 'leave_requests.balance' })
  async getLeaveBalance(@Payload() userId: string) {
    return this.leaveRequestsService.getMyBalance(userId || 'system');
  }

  @MessagePattern({ cmd: 'leave_requests.create' })
  async createLeaveRequest(@Payload() payload: { userId: string; dto: any }) {
    return this.leaveRequestsService.create(
      payload.userId || 'system',
      payload.dto || payload,
    );
  }

  @MessagePattern({ cmd: 'leave_requests.update_status' })
  async updateLeaveStatus(@Payload() payload: { id: string; data: any }) {
    return this.leaveRequestsService.updateStatus(
      payload.id,
      payload.data?.status || LeaveStatus.APPROVED,
      'system',
      payload.data?.rejectionReason,
    );
  }

  @MessagePattern({ cmd: 'leave_requests.delete' })
  async deleteLeaveRequest(@Payload() payload: { id: string; userId: string }) {
    const id = typeof payload === 'string' ? payload : payload.id;
    return this.leaveRequestsService.delete(id, payload.userId || 'system');
  }

  // Salaries
  @MessagePattern({ cmd: 'salaries.find_all' })
  async findAllSalaries(@Payload() query: any) {
    return this.salariesService.findAll(query || {});
  }

  @MessagePattern({ cmd: 'salaries.find_my' })
  async findMySalaries(@Payload() payload: { userId: string; query: any }) {
    return this.salariesService.getMySalaries(
      payload.userId || 'system',
      payload.query || {},
    );
  }

  @MessagePattern({ cmd: 'salaries.stats' })
  async getSalaryStats(@Payload() query: any) {
    return this.salariesService.getStatistics(
      Number(query?.year) || new Date().getFullYear(),
      query?.month ? Number(query.month) : undefined,
    );
  }

  @MessagePattern({ cmd: 'salaries.calculate_batch' })
  async calculateAllSalaries(
    @Payload() payload: { month: number; year: number },
  ) {
    return this.salariesService.calculateAll(payload.month, payload.year);
  }

  @MessagePattern({ cmd: 'salaries.calculate_one' })
  async calculateOneSalary(@Payload() dto: any) {
    return this.salariesService.calculateOne(dto);
  }

  @MessagePattern({ cmd: 'salaries.find_one' })
  async findOneSalary(@Payload() id: string) {
    return this.salariesService.findOne(id);
  }

  @MessagePattern({ cmd: 'salaries.approve' })
  async approveSalary(@Payload() id: string) {
    return this.salariesService.approve(id);
  }

  @MessagePattern({ cmd: 'salaries.pay' })
  async paySalary(@Payload() id: string) {
    return this.salariesService.pay(id);
  }
}
