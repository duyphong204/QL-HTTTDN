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
} from "@/types/leave.types"
import type {
    Salary,
    CreateSalaryDto,
    UpdateSalaryDto,
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
    getLeaveRequests: async (): Promise<LeaveRequest[]> => {
        return apiGet<LeaveRequest[]>(endpoints.leaveRequests.root);
    },

    getMyLeaveRequests: async (): Promise<LeaveRequest[]> => {
        return apiGet<LeaveRequest[]>(endpoints.leaveRequests.me);
    },

    createLeaveRequest: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
        return apiPost<LeaveRequest>(endpoints.leaveRequests.root, data);
    },

    approveLeaveRequest: async (id: string, data: ApproveLeaveRequestDto): Promise<LeaveRequest> => {
        const path = data.status === 'APPROVED'
            ? endpoints.leaveRequests.approve(id)
            : endpoints.leaveRequests.reject(id);
        return apiPatch<LeaveRequest>(path);
    },

    deleteLeaveRequest: async (id: string): Promise<void> => {
        await apiDelete(endpoints.leaveRequests.byId(id));
    }
};

export const salaryService = {
    getSalaries: async (params?: { month?: number; year?: number }): Promise<Salary[]> => {
        return apiGet<Salary[]>(endpoints.salaries.root, params);
    },

    createSalary: async (data: CreateSalaryDto): Promise<Salary> => {
        return apiPost<Salary>(endpoints.salaries.root, data);
    },

    updateSalary: async (id: string, data: UpdateSalaryDto): Promise<Salary> => {
        return apiPatch<Salary>(endpoints.salaries.byId(id), data);
    },

    deleteSalary: async (id: string): Promise<void> => {
        await apiDelete(endpoints.salaries.byId(id));
    },

    getMySalaries: async (params?: { month?: number; year?: number }): Promise<Salary[]> => {
        return apiGet<Salary[]>(endpoints.salaries.me, params);
    },

    getSalaryReport: async (params?: { month?: number; year?: number }): Promise<any> => {
        return apiGet<any>(endpoints.salaries.report, params);
    },

    calculateAllSalaries: async (data: { month: number; year: number }): Promise<void> => {
        await apiPost<void>(endpoints.salaries.calculateAll, data);
    },

    calculateSalary: async (data: { employeeId: string; month: number; year: number }): Promise<void> => {
        await apiPost<void>(endpoints.salaries.calculate, data);
    },
};
