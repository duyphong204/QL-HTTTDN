import type { UpdateProfileDto } from "@/types/user.types";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  Employee,
  CreateEmployeeDto,
  ChangePositionDto,
  UpdateEmployeeProfileByHrDto,
  JobHistory,
} from "@/types/employee.types";
import type {
  LeaveRequest,
  CreateLeaveRequestDto,
  ApproveLeaveRequestDto,
  QueryLeaveRequestDto,
} from "@/types/leave.types";
import type {
  Salary,
  AddSalaryDetailDto,
  QuerySalaryParams,
} from "@/types/salary.types";
import type { HrStatisticsReport } from "@/types/hr.type";
import type { BaseFilters, PaginatedResponse } from "@/types/common.types";

type EmployeeFilters = BaseFilters & {
  department?: string;
  position?: string;
  isActive?: boolean;
};

export const employeeService = {
  getEmployees: async (
    params?: EmployeeFilters,
  ): Promise<PaginatedResponse<Employee>> => {
    return apiGet<PaginatedResponse<Employee>>(
      endpoints.employees.root,
      params,
    );
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    return apiGet<Employee>(endpoints.employees.byId(id));
  },

  createEmployee: async (data: CreateEmployeeDto): Promise<Employee> => {
    return apiPost<Employee>(endpoints.employees.root, data);
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await apiDelete(endpoints.employees.byId(id));
  },

  getMyProfile: async (): Promise<Employee> => {
    return apiGet<Employee>(endpoints.employees.me);
  },

  updateMyProfile: async (data: UpdateProfileDto): Promise<Employee> => {
    return apiPatch<Employee>(endpoints.employees.me, data);
  },

  getHrStatistics: async (params?: {
    month?: number;
    year?: number;
  }): Promise<HrStatisticsReport> => {
    return apiGet<HrStatisticsReport>(endpoints.employees.hrReport, params);
  },

  getJobHistory: async (id: string): Promise<JobHistory[]> => {
    return apiGet<JobHistory[]>(endpoints.employees.jobHistory(id));
  },

  changePosition: async (
    id: string,
    data: ChangePositionDto,
  ): Promise<Employee> => {
    return apiPatch<Employee>(endpoints.employees.changePosition(id), data);
  },

  updateEmployeeProfile: async (
    id: string,
    data: UpdateEmployeeProfileByHrDto,
  ): Promise<Employee> => {
    return apiPatch<Employee>(endpoints.employees.updateProfile(id), data);
  },
};

export const leaveRequestService = {
  getLeaveRequests: async (
    params?: QueryLeaveRequestDto,
  ): Promise<LeaveRequest[]> => {
    return apiGet<LeaveRequest[]>(endpoints.leaveRequests.root, params);
  },

  getMyLeaveRequests: async (): Promise<LeaveRequest[]> => {
    return apiGet<LeaveRequest[]>(endpoints.leaveRequests.me);
  },

  createLeaveRequest: async (
    data: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> => {
    return apiPost<LeaveRequest>(endpoints.leaveRequests.root, data);
  },

  updateLeaveStatus: async (
    id: string,
    data: ApproveLeaveRequestDto,
  ): Promise<LeaveRequest> => {
    return apiPatch<LeaveRequest>(endpoints.leaveRequests.status(id), data);
  },

  deleteLeaveRequest: async (id: string): Promise<void> => {
    await apiDelete(endpoints.leaveRequests.byId(id));
  },
};

export const salaryService = {
  getSalaries: (params?: QuerySalaryParams) =>
    apiGet<PaginatedResponse<Salary>>("/salaries", params),

  getMySalaries: (params?: { year?: number; month?: number }) =>
    apiGet<Salary[]>("/salaries/my", params),

  getSalaryById: (id: string) => apiGet<Salary>(`/salaries/${id}`),

  calculateAll: (data: { month: number; year: number }) =>
    apiPost<{ count: number; message: string }>(
      "/salaries/calculate-all",
      data,
    ),

  calculateOne: (data: { employeeId: string; month: number; year: number }) =>
    apiPost<Salary>("/salaries/calculate", data),

  approve: (id: string) => apiPatch<Salary>(`/salaries/${id}/approve`, {}),

  pay: (id: string) => apiPatch<Salary>(`/salaries/${id}/pay`, {}),

  addDetail: (salaryId: string, data: AddSalaryDetailDto) =>
    apiPost<Salary>(`/salaries/${salaryId}/details`, data),

  deleteDetail: (salaryId: string, detailId: string) =>
    apiDelete<Salary>(`/salaries/${salaryId}/details/${detailId}`),

  getStatistics: (params: { year: number; month?: number }) =>
    apiGet("/salaries/statistics", params),

  exportSalaries: (params: { month: number; year: number }) =>
    apiGet<{
      month: number;
      year: number;
      exportedAt: string;
      count: number;
      summary: {
        totalNetSalary: number;
        totalBonus: number;
        totalDeduction: number;
      };
      salaries: Array<{
        id: string;
        employeeCode: string;
        employeeName: string;
        baseSalary: number;
        workingDays: number;
        actualWorkDays: number;
        grossSalary: number;
        totalBonus: number;
        totalDeduction: number;
        netSalary: number;
        status: string;
        paidAt: string | null;
        details: Array<{
          type: string;
          amount: number;
          description: string | null;
        }>;
      }>;
    }>("/salaries/export", params),
};
