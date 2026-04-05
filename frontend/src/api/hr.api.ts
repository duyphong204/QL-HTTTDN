import type { UpdateProfileDto } from "@/types/user.type";
import { apiDelete, apiGet, apiPatch, apiPost } from "./base";
import type { EmployeeProfile } from "@/types/employee.type";
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  LeaveRequest,
  CreateLeaveRequestDto,
  ApproveLeaveRequestDto,
  Salary,
  CreateSalaryDto,
  UpdateSalaryDto,
  HrStatisticsReport,
} from "@/types/hr.type";
import type { BaseFilters, PaginatedResponse } from "@/types/common.type";

type EmployeeFilters = BaseFilters & {
  department?: string;
  position?: string;
};

export const employeeApi = {
  getEmployees: async (params?: EmployeeFilters) => {
    return apiGet<PaginatedResponse<Employee>>("/employees", params);
  },

  getEmployeeById: async (id: string) => {
    return apiGet<Employee>(`/employees/${id}`);
  },

  createEmployee: async (data: CreateEmployeeDto) => {
    return apiPost<Employee>("/employees", data);
  },

  updateEmployee: async (id: string, data: UpdateEmployeeDto) => {
    return apiPatch<Employee>(`/employees/${id}`, data);
  },
  deleteEmployee: async (id: string) => {
    return apiDelete(`/employees/${id}`);
  },
  getMyProfile: async () => {
    return apiGet<EmployeeProfile>("/employees/me");
  },
  updateMyProfile: async (data: UpdateProfileDto) => {
    return apiPatch("/employees/me", data);
  },
  getHrStatistics: async (params?: { month?: number; year?: number }) => {
    return apiGet<HrStatisticsReport>(
      "/employees/statistics/hr-report",
      params,
    );
  },
};

export const leaveRequestApi = {
  getLeaveRequests: async () => {
    return apiGet<LeaveRequest[]>("/leave-requests");
  },

  getMyLeaveRequests: async () => {
    return apiGet<LeaveRequest[]>("/leave-requests/me");
  },

  createLeaveRequest: async (data: CreateLeaveRequestDto) => {
    return apiPost<LeaveRequest>("/leave-requests", data);
  },

  approveLeaveRequest: async (id: string, data: ApproveLeaveRequestDto) => {
    const endpoint = data.status === "APPROVED" ? "approve" : "reject";
    return apiPatch<LeaveRequest>(`/leave-requests/${id}/${endpoint}`);
  },
  deleteLeaveRequest: async (id: string) => {
    return apiDelete(`/leave-requests/${id}`);
  },
};

export const salaryApi = {
  getSalaries: async (params?: { month?: number; year?: number }) => {
    return apiGet<Salary[]>("/salaries", params);
  },

  createSalary: async (data: CreateSalaryDto) => {
    return apiPost<Salary>("/salaries", data);
  },

  updateSalary: async (id: string, data: UpdateSalaryDto) => {
    return apiPatch<Salary>(`/salaries/${id}`, data);
  },
  getMySalaries: async (params?: { month?: number; year?: number }) => {
    return apiGet<Salary[]>("/salaries/me", params);
  },
  calculateSalary: async (data: CreateSalaryDto) => {
    return apiPost("/salaries", data);
  },
  calculateAllSalaries: async (data: { month: number; year: number }) => {
    return apiPost("/salaries/calculate-all", data);
  },
};
