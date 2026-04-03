import type { UpdateProfileDto } from "@/types/user.type";
import { axiosInstance } from "./axios"
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
};

export const employeeApi = {
    getEmployees: async (params?: EmployeeFilters) => {
        const res = await axiosInstance.get<PaginatedResponse<Employee>>("/employees", { params });
        return res.data;
    },

    getEmployeeById: async (id: string) => {
        const res = await axiosInstance.get<Employee>(`/employees/${id}`);
        return res.data;
    },

    createEmployee: async (data: CreateEmployeeDto) => {
        const res = await axiosInstance.post<Employee>("/employees", data);
        return res.data;
    },

    updateEmployee: async (id: string, data: UpdateEmployeeDto) => {
        const res = await axiosInstance.patch<Employee>(`/employees/${id}`, data);
        return res.data;
    },
    deleteEmployee: async (id: string) => {
        const res = await axiosInstance.delete(`/employees/${id}`);
        return res.data;
    },
    getMyProfile: async () => {
        const res = await axiosInstance.get('/employees/me');
        return res.data;
    },
    updateMyProfile: async (data: UpdateProfileDto) => {
        const res = await axiosInstance.patch('/employees/me', data);
        return res.data;
    },
    getHrStatistics: async (params?: { month?: number; year?: number }) => {
        const res = await axiosInstance.get<HrStatisticsReport>('/employees/statistics/hr-report', { params });
        return res.data;
    },
};

export const leaveRequestApi = {
    getLeaveRequests: async () => {
        const res = await axiosInstance.get<LeaveRequest[]>("/leave-requests");
        return res.data;
    },

    getMyLeaveRequests: async () => {
        const res = await axiosInstance.get<LeaveRequest[]>("/leave-requests/me")
        return res.data
    },

    createLeaveRequest: async (data: CreateLeaveRequestDto) => {
        const res = await axiosInstance.post<LeaveRequest>("/leave-requests", data);
        return res.data;
    },

    approveLeaveRequest: async (id: string, data: ApproveLeaveRequestDto) => {
        const endpoint = data.status === 'APPROVED' ? 'approve' : 'reject';
        const res = await axiosInstance.patch<LeaveRequest>(
            `/leave-requests/${id}/${endpoint}`,
        );
        return res.data;
    },
    deleteLeaveRequest: async (id: string) => {
        const res = await axiosInstance.delete(`/leave-requests/${id}`);
        return res.data;
    }
};

export const salaryApi = {
    getSalaries: async (params?: { month?: number; year?: number }) => {
        const res = await axiosInstance.get<Salary[]>("/salaries", { params });
        return res.data;
    },

    createSalary: async (data: CreateSalaryDto) => {
        const res = await axiosInstance.post<Salary>("/salaries", data);
        return res.data;
    },

    updateSalary: async (id: string, data: UpdateSalaryDto) => {
        const res = await axiosInstance.patch<Salary>(`/salaries/${id}`, data);
        return res.data;
    },
    getMySalaries: async (params?: { month?: number; year?: number }) => {
        const res = await axiosInstance.get('/salaries/me', { params });
        return res.data;
    },
    calculateSalary: async (data: CreateSalaryDto) => {
        const res = await axiosInstance.post('/salaries', data);
        return res.data;
    },
    calculateAllSalaries: async (data: { month: number; year: number }) => {
        const res = await axiosInstance.post('/salaries/calculate-all', data);
        return res.data;
    },
};