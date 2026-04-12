import type { UpdateProfileDto } from "@/types/user.type";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/api/base"
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
} from "@/types/hr.type"
import type { BaseFilters, PaginatedResponse } from "@/types/common.type"

type EmployeeFilters = BaseFilters & {
    department?: string;
    position?: string;
    isActive?: boolean;
};

export const employeeService = {
    getEmployees: async (params?: EmployeeFilters): Promise<PaginatedResponse<Employee>> => {
        return apiGet<PaginatedResponse<Employee>>("/employees", params);
    },

    getEmployeeById: async (id: string): Promise<Employee> => {
        return apiGet<Employee>(`/employees/${id}`);
    },

    createEmployee: async (data: CreateEmployeeDto): Promise<Employee> => {
        return apiPost<Employee>("/employees", data);
    },

    updateEmployee: async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
        return apiPatch<Employee>(`/employees/${id}`, data);
    },

    deleteEmployee: async (id: string): Promise<void> => {
        await apiDelete(`/employees/${id}`);
    },

    getMyProfile: async (): Promise<Employee> => {
        return apiGet<Employee>('/employees/me');
    },

    updateMyProfile: async (data: UpdateProfileDto): Promise<Employee> => {
        return apiPatch<Employee>('/employees/me', data);
    },

    getHrStatistics: async (params?: { month?: number; year?: number }): Promise<HrStatisticsReport> => {
        return apiGet<HrStatisticsReport>('/employees/statistics/hr-report', params);
    },
};

export const leaveRequestService = {
    getLeaveRequests: async (): Promise<LeaveRequest[]> => {
        return apiGet<LeaveRequest[]>("/leave-requests");
    },

    getMyLeaveRequests: async (): Promise<LeaveRequest[]> => {
        return apiGet<LeaveRequest[]>("/leave-requests/me");
    },

    createLeaveRequest: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
        return apiPost<LeaveRequest>("/leave-requests", data);
    },

    approveLeaveRequest: async (id: string, data: ApproveLeaveRequestDto): Promise<LeaveRequest> => {
        const endpoint = data.status === 'APPROVED' ? 'approve' : 'reject';
        return apiPatch<LeaveRequest>(`/leave-requests/${id}/${endpoint}`);
    },

    deleteLeaveRequest: async (id: string): Promise<void> => {
        await apiDelete(`/leave-requests/${id}`);
    }
};

export const salaryService = {
    getSalaries: async (params?: { month?: number; year?: number }): Promise<Salary[]> => {
        return apiGet<Salary[]>("/salaries", params);
    },

    createSalary: async (data: CreateSalaryDto): Promise<Salary> => {
        return apiPost<Salary>("/salaries", data);
    },

    updateSalary: async (id: string, data: UpdateSalaryDto): Promise<Salary> => {
        return apiPatch<Salary>(`/salaries/${id}`, data);
    },

    deleteSalary: async (id: string): Promise<void> => {
        await apiDelete(`/salaries/${id}`);
    },

    getMySalaries: async (params?: { month?: number; year?: number }): Promise<Salary[]> => {
        return apiGet<Salary[]>("/salaries/me", params);
    },

    getSalaryReport: async (params?: { month?: number; year?: number }): Promise<any> => {
        return apiGet<any>("/salaries/report", params);
    },

    calculateAllSalaries: async (data: { month: number; year: number }): Promise<void> => {
        await apiPost<void>("/salaries/calculate-all", data);
    },

    calculateSalary: async (data: { employeeId: string; month: number; year: number }): Promise<void> => {
        await apiPost<void>("/salaries/calculate", data);
    },
};
