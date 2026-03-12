import { create } from "zustand"
import { toast } from "sonner"
import {
  employeeApi,
  leaveRequestApi,
  salaryApi
} from "@/api/hr.api"
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  LeaveRequest,
  Salary,
  CreateSalaryDto,
  UpdateSalaryDto
} from "@/types/hr.type"
interface HrStatistics {
  totalEmployees: number
  activeEmployees: number
  resignedEmployees: number
  totalSalary: number
}

interface HrState {

  // =================
  // STATE
  // =================

  employees: Employee[]
  leaveRequests: LeaveRequest[]
  salaries: Salary[]

  statistics: HrStatistics | null

  loadingEmployees: boolean
  loadingLeaveRequests: boolean
  loadingSalaries: boolean
  loadingStatistics: boolean

  // =================
  // EMPLOYEE
  // =================

  fetchEmployees: () => Promise<void>
  createEmployee: (data: CreateEmployeeDto) => Promise<void>
  updateEmployee: (id: string, data: UpdateEmployeeDto) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>

  // =================
  // LEAVE REQUEST
  // =================

  fetchLeaveRequests: () => Promise<void>
  approveLeaveRequest: (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => Promise<void>

  // =================
  // SALARY
  // =================

  fetchSalaries: () => Promise<void>
  calculateSalary: (data: CreateSalaryDto) => Promise<void>
  createSalary: (data: CreateSalaryDto) => Promise<void>
  updateSalary: (id: string, data: UpdateSalaryDto) => Promise<void>

  // =================
  // STATISTICS
  // =================

  fetchStatistics: () => Promise<void>
}

export const useHrStore = create<HrState>((set, get) => ({

  employees: [],
  leaveRequests: [],
  salaries: [],
  statistics: null,

  loadingEmployees: false,
  loadingLeaveRequests: false,
  loadingSalaries: false,
  loadingStatistics: false,

  // =================
  // EMPLOYEES
  // =================

  fetchEmployees: async () => {

    set({ loadingEmployees: true })

    try {

      const data = await employeeApi.getEmployees()

      set({
        employees: data
      })

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Không thể tải danh sách nhân viên"
      )

    } finally {
      set({ loadingEmployees: false })
    }
  },

  createEmployee: async (data) => {

    try {

      const newEmployee = await employeeApi.createEmployee(data)

      set((state) => ({
        employees: [...state.employees, newEmployee]
      }))

      toast.success("Thêm nhân sự thành công")

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Thêm nhân sự thất bại"
      )

      throw error
    }
  },

  updateEmployee: async (id, data) => {

    try {

      const updated = await employeeApi.updateEmployee(id, data)

      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.id === id ? updated : emp
        )
      }))

      toast.success("Cập nhật nhân sự thành công")

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Cập nhật nhân sự thất bại"
      )

      throw error
    }
  },

  deleteEmployee: async (id) => {

    try {

      await employeeApi.deleteEmployee(id)

      set((state) => ({
        employees: state.employees.filter(
          (emp) => emp.id !== id
        )
      }))

      toast.success("Đã xóa nhân sự")

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Xóa nhân sự thất bại"
      )
    }
  },

  // =================
  // LEAVE REQUEST
  // =================

  fetchLeaveRequests: async () => {

    set({ loadingLeaveRequests: true })

    try {

      const data = await leaveRequestApi.getLeaveRequests()

      set({
        leaveRequests: data
      })

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Không thể tải đơn nghỉ phép"
      )

    } finally {
      set({ loadingLeaveRequests: false })
    }
  },

  approveLeaveRequest: async (id, status) => {

    try {

      await leaveRequestApi.approveLeaveRequest(id, { status })

      set((state) => ({
        leaveRequests: state.leaveRequests.map((item) =>
          item.id === id
            ? { ...item, status }
            : item
        )
      }))

      toast.success(
        status === "APPROVED"
          ? "Đã duyệt đơn nghỉ"
          : "Đã từ chối đơn nghỉ"
      )

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Duyệt đơn thất bại"
      )
    }
  },

  // =================
  // SALARY
  // =================

  fetchSalaries: async () => {

    set({ loadingSalaries: true })

    try {

      const data = await salaryApi.getSalaries()

      set({
        salaries: data
      })

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Không thể tải bảng lương"
      )

    } finally {
      set({ loadingSalaries: false })
    }
  },

  calculateSalary: async (data) => {

    try {

      await salaryApi.calculateSalary(data)

      toast.success("Tính lương thành công")

      await get().fetchSalaries()

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Tính lương thất bại"
      )
    }
  },

  createSalary: async (data) => {

    try {

      const salary = await salaryApi.createSalary(data)

      set((state) => ({
        salaries: [...state.salaries, salary]
      }))

      toast.success("Tạo bảng lương thành công")

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Tạo bảng lương thất bại"
      )
    }
  },

  updateSalary: async (id, data) => {

    try {

      const updated = await salaryApi.updateSalary(id, data)

      set((state) => ({
        salaries: state.salaries.map((s) =>
          s.id === id ? updated : s
        )
      }))

      toast.success("Cập nhật bảng lương thành công")

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Cập nhật bảng lương thất bại"
      )
    }
  },

  // =================
  // STATISTICS
  // =================

  fetchStatistics: async () => {

    set({ loadingStatistics: true })

    try {

      const data = await employeeApi.getHrStatistics()

      set({
        statistics: data
      })

    } catch {

      toast.error("Không thể tải thống kê HR")

    } finally {

      set({ loadingStatistics: false })

    }
  }

}))