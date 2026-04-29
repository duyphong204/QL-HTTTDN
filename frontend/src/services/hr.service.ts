import type { UpdateProfileDto } from "@/types/user.types";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/api/client"
import { endpoints } from "@/api/endpoints"
import type {
    Employee,
    CreateEmployeeDto,
    UpdateEmployeeDto,
} from "@/types/employee.types"
import type {
    LeaveRequest,
    CreateLeaveRequestDto,
    ApproveLeaveRequestDto,
    QueryLeaveRequestDto,
} from "@/types/leave.types"
import type {
    Salary,
    AddSalaryDetailDto,
    QuerySalaryParams,
} from "@/types/salary.types"
import type { HrStatisticsReport } from "@/types/report.types"
import type { BaseFilters, PaginatedResponse } from "@/types/common.types"

type EmployeeFilters = BaseFilters & {
    department?: string;
    position?: string;
    isActive?: boolean;
};

export const employeeService = {
    getEmployees: async (params?: EmployeeFilters): Promise<PaginatedResponse<Employee>> => {
        return apiGet<PaginatedResponse<Employee>>(endpoints.employees.root, params);
    },

    getEmployeeById: async (id: string): Promise<Employee> => {
        return apiGet<Employee>(endpoints.employees.byId(id));
    },

    createEmployee: async (data: CreateEmployeeDto): Promise<Employee> => {
        return apiPost<Employee>(endpoints.employees.root, data);
    },

    updateEmployee: async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
        return apiPatch<Employee>(endpoints.employees.byId(id), data);
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

    getHrStatistics: async (params?: { month?: number; year?: number }): Promise<HrStatisticsReport> => {
        return apiGet<HrStatisticsReport>(endpoints.employees.hrReport, params);
    },
};

export const leaveRequestService = {
    getLeaveRequests: async (params?: QueryLeaveRequestDto): Promise<LeaveRequest[]> => {
        return apiGet<LeaveRequest[]>(endpoints.leaveRequests.root, params);
    },

    getMyLeaveRequests: async (): Promise<LeaveRequest[]> => {
        return apiGet<LeaveRequest[]>(endpoints.leaveRequests.me);
    },

    createLeaveRequest: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
        return apiPost<LeaveRequest>(endpoints.leaveRequests.root, data);
    },

    updateLeaveStatus: async (id: string, data: ApproveLeaveRequestDto): Promise<LeaveRequest> => {
        return apiPatch<LeaveRequest>(endpoints.leaveRequests.status(id), data);
    },

    deleteLeaveRequest: async (id: string): Promise<void> => {
        await apiDelete(endpoints.leaveRequests.byId(id));
    }
};

export const salaryService = {
  getSalaries: (params?: QuerySalaryParams) =>
    apiGet<Salary[]>('/salary', params),

  getMySalaries: (params?: { year?: number }) =>
    apiGet<Salary[]>('/salary/my', params),

  getSalaryById: (id: string) =>
    apiGet<Salary>(`/salary/${id}`),

  calculateAll: (data: { month: number; year: number }) =>
    apiPost('/salary/calculate-all', data),

  calculateOne: (data: { employeeId: string; month: number; year: number }) =>
    apiPost('/salary/calculate', data),

  approve: (id: string) =>
    apiPatch(`/salary/${id}/approve`, {}),

  pay: (id: string) =>
    apiPatch(`/salary/${id}/pay`, {}),

  addDetail: (salaryId: string, data: AddSalaryDetailDto) =>
    apiPost(`/salary/${salaryId}/details`, data),
};
