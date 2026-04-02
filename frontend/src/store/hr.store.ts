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
  UpdateSalaryDto,
  HrStatisticsReport,
} from "@/types/hr.type"
import type { BaseFilters, PaginationMeta, SortOrder } from "@/types/common.type"
import { getErrorMessage, mergeFiltersWithPageReset } from "@/store/store.helpers"

type EmployeeFilters = BaseFilters & {
  department?: string;
  position?: string;
};

interface HrState {

  // =================
  // STATE
  // =================

  employees: Employee[]
  meta: PaginationMeta | null
  filters: EmployeeFilters
  leaveRequests: LeaveRequest[]
  salaries: Salary[]
  selectedEmployee: Employee | null

  statistics: HrStatisticsReport | null

  loadingEmployees: boolean
  loadingEmployeeDetail: boolean
  loadingLeaveRequests: boolean
  loadingSalaries: boolean
  loadingStatistics: boolean

  // =================
  // EMPLOYEE
  // =================

  setFilters: (filters: Partial<EmployeeFilters>) => void
  fetchEmployees: () => Promise<void>
  fetchEmployeeById: (id: string) => Promise<Employee | null>
  clearSelectedEmployee: () => void
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

  fetchSalaries: (params?: { month?: number; year?: number }) => Promise<void>
  calculateAllSalaries: (data: { month: number; year: number }) => Promise<void>
  calculateSalary: (data: CreateSalaryDto) => Promise<void>
  createSalary: (data: CreateSalaryDto) => Promise<void>
  updateSalary: (id: string, data: UpdateSalaryDto) => Promise<void>

  // =================
  // STATISTICS
  // =================

  fetchStatistics: (params?: { month?: number; year?: number }) => Promise<void>
}

export const useHrStore = create<HrState>((set, get) => ({

  employees: [],
  meta: null,
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "code",
    sortOrder: "asc" as SortOrder,
    department: "",
    position: "",
  },
  leaveRequests: [],
  salaries: [],
  selectedEmployee: null,
  statistics: null,

  loadingEmployees: false,
  loadingEmployeeDetail: false,
  loadingLeaveRequests: false,
  loadingSalaries: false,
  loadingStatistics: false,

  // =================
  // EMPLOYEES
  // =================

  setFilters: (newFilters) => {
    set((state) => ({
      filters: mergeFiltersWithPageReset(state.filters, newFilters),
    }));
  },

  fetchEmployees: async () => {

    set({ loadingEmployees: true })

    try {

      const { filters } = get()
      const response = await employeeApi.getEmployees({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder as SortOrder,
        department: filters.department,
        position: filters.position,
      })

      set({
        employees: response.data,
        meta: response.meta,
      })

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Không thể tải danh sách nhân viên"))

    } finally {
      set({ loadingEmployees: false })
    }
  },

  fetchEmployeeById: async (id) => {

    set({ loadingEmployeeDetail: true })

    try {

      const employee = await employeeApi.getEmployeeById(id)

      set({
        selectedEmployee: employee
      })

      return employee

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Không thể tải chi tiết nhân viên"))

      return null

    } finally {
      set({ loadingEmployeeDetail: false })
    }
  },

  clearSelectedEmployee: () => {
    set({ selectedEmployee: null })
  },

  createEmployee: async (data) => {

    try {

      const newEmployee = await employeeApi.createEmployee(data)

      set((state) => ({
        employees: [...state.employees, newEmployee]
      }))

      toast.success("Thêm nhân sự thành công")

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Thêm nhân sự thất bại"))

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

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Cập nhật nhân sự thất bại"))

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

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Xóa nhân sự thất bại"))
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

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Không thể tải đơn nghỉ phép"))

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

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Duyệt đơn thất bại"))
    }
  },

  // =================
  // SALARY
  // =================

  fetchSalaries: async (params) => {

    set({ loadingSalaries: true })

    try {

      const data = await salaryApi.getSalaries(params)

      set({
        salaries: data
      })

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Không thể tải bảng lương"))

    } finally {
      set({ loadingSalaries: false })
    }
  },

  calculateAllSalaries: async (data) => {
    try {
      await salaryApi.calculateAllSalaries(data)

      toast.success("Đã tính lương tháng cho toàn bộ nhân sự active")

      await get().fetchSalaries(data)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể tính lương hàng loạt"))
      throw error
    }
  },

  calculateSalary: async (data) => {

    try {

      await salaryApi.calculateSalary(data)

      toast.success("Tính lương thành công")

      await get().fetchSalaries()

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Tính lương thất bại"))
    }
  },

  createSalary: async (data) => {

    try {

      const salary = await salaryApi.createSalary(data)

      set((state) => ({
        salaries: [...state.salaries, salary]
      }))

      toast.success("Tạo bảng lương thành công")

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Tạo bảng lương thất bại"))
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

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, "Cập nhật bảng lương thất bại"))
    }
  },

  // =================
  // STATISTICS
  // =================

  fetchStatistics: async (params) => {

    set({ loadingStatistics: true })

    try {

      const data = await employeeApi.getHrStatistics(params)

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