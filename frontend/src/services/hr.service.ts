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
    getSalaries: async (params?: QuerySalaryParams): Promise<Salary[]> => {
        return apiGet<Salary[]>(endpoints.salaries.root, params);
    },

    getMySalaries: async (params?: { month?: number; year?: number }): Promise<Salary[]> => {
        return apiGet<Salary[]>(endpoints.salaries.me, params);
    },

    getSalaryById: async (id: string): Promise<Salary> => {
        return apiGet<Salary>(endpoints.salaries.byId(id));
    },

    calculateAllSalaries: async (data: { month: number; year: number }): Promise<{ total: number; success: number }> => {
        return apiPost<{ total: number; success: number }>(endpoints.salaries.calculateAll, data);
    },

    calculateSalary: async (data: { employeeId: string; month: number; year: number }): Promise<Salary> => {
        return apiPost<Salary>(endpoints.salaries.calculate, data);
    },

    approveSalary: async (id: string): Promise<Salary> => {
        return apiPatch<Salary>(endpoints.salaries.status(id), { status: 'APPROVED' });
    },

    markAsPaid: async (id: string): Promise<Salary> => {
        return apiPatch<Salary>(endpoints.salaries.status(id), { status: 'PAID' });
    },

    cancelSalary: async (id: string): Promise<Salary> => {
        return apiPatch<Salary>(endpoints.salaries.status(id), { status: 'CANCELLED' });
    },

    addSalaryDetail: async (salaryId: string, detail: AddSalaryDetailDto): Promise<Salary> => {
        return apiPost<Salary>(endpoints.salaries.details(salaryId), detail);
    },
};
