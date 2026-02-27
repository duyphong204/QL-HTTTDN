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
} from "@/types/hr.type"

export const employeeApi = {
    getEmployees: async () => {
        const res = await axiosInstance.get<Employee[]>("/employees");
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
};

export const leaveRequestApi = {
    getLeaveRequests: async () => {
        const res = await axiosInstance.get<LeaveRequest[]>("/leave-requests");
        return res.data;
    },

    createLeaveRequest: async (data: CreateLeaveRequestDto) => {
        const res = await axiosInstance.post<LeaveRequest>("/leave-requests", data);
        return res.data;
    },

    approveLeaveRequest: async (id: string, data: ApproveLeaveRequestDto) => {
        const res = await axiosInstance.patch<LeaveRequest>(
            `/leave-requests/${id}`,
            data
        );
        return res.data;
    },
};

export const salaryApi = {
    getSalaries: async () => {
        const res = await axiosInstance.get<Salary[]>("/salaries");
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
};