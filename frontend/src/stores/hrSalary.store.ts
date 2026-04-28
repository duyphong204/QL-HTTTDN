import { create } from 'zustand'
import { toast } from 'sonner'
import { salaryService } from '@/services/hr.service'
import { getErrorMessage } from '@/stores/store.helpers'
import type { AddSalaryDetailDto, Salary, SalaryStatus } from '@/types/salary.types'

interface HrSalaryFilters {
  page: number
  limit: number
  month?: number
  year?: number
  employeeId?: string
  status?: SalaryStatus
}

interface HrSalaryState {
  salaries: Salary[]
  filters: HrSalaryFilters
  isLoading: boolean
  selectedSalary: Salary | null
  isLoadingDetail: boolean

  setFilters: (filters: Partial<HrSalaryFilters>) => void
  setSelectedSalary: (salary: Salary | null) => void

  fetchSalaries: () => Promise<void>
  calculateAllSalaries: (month: number, year: number) => Promise<void>
  approveSalary: (id: string) => Promise<void>
  markAsPaid: (id: string) => Promise<void>
  cancelSalary: (id: string) => Promise<void>
  addSalaryDetail: (salaryId: string, detail: AddSalaryDetailDto) => Promise<void>
  fetchSalaryById: (id: string) => Promise<Salary | null>
}

export const useHrSalaryStore = create<HrSalaryState>((set, get) => ({
  salaries: [],
  filters: { page: 1, limit: 10 },
  isLoading: false,
  selectedSalary: null,
  isLoadingDetail: false,

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  setSelectedSalary: (selectedSalary) => set({ selectedSalary }),

  fetchSalaries: async () => {
    const { filters } = get()
    set({ isLoading: true })
    try {
      const data = await salaryService.getSalaries({
        month: filters.month,
        year: filters.year,
        employeeId: filters.employeeId,
        status: filters.status,
      })
      set({ salaries: data })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải danh sách lương'))
    } finally {
      set({ isLoading: false })
    }
  },

  calculateAllSalaries: async (month, year) => {
    set({ isLoading: true })
    try {
      await salaryService.calculateAllSalaries({ month, year })
      toast.success(`Đã tính lương tháng ${month}/${year}`)
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Tính lương thất bại'))
    } finally {
      set({ isLoading: false })
    }
  },

  approveSalary: async (id) => {
    try {
      await salaryService.approveSalary(id)
      toast.success('Đã duyệt lương')
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Duyệt lương thất bại'))
    }
  },

  markAsPaid: async (id) => {
    try {
      await salaryService.markAsPaid(id)
      toast.success('Đã thanh toán lương')
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Thanh toán thất bại'))
    }
  },

  cancelSalary: async (id) => {
    try {
      await salaryService.cancelSalary(id)
      toast.success('Đã hủy lương')
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Hủy lương thất bại'))
    }
  },

  addSalaryDetail: async (salaryId, detail) => {
    try {
      await salaryService.addSalaryDetail(salaryId, detail)
      toast.success('Đã thêm chi tiết lương')
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Thêm chi tiết thất bại'))
    }
  },

  fetchSalaryById: async (id) => {
    set({ isLoadingDetail: true })
    try {
      const salary = await salaryService.getSalaryById(id)
      set({ selectedSalary: salary })
      return salary
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải chi tiết lương'))
      return null
    } finally {
      set({ isLoadingDetail: false })
    }
  },
}))
