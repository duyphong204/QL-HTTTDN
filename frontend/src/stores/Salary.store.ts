// stores/employee.store.ts
import { create } from 'zustand'
import { toast } from 'sonner'
import { salaryService } from '@/services/hr.service'
import { getErrorMessage } from '@/stores/store.helpers'
import type { AddSalaryDetailDto, Salary } from '@/types/salary.types'

interface SalaryState {
  // HR Manager - Salary
  salaries: Salary[]
  salariesMeta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  salariesFilters: {
    page: number
    limit: number
    month?: number
    year?: number
    employeeId?: string
    status?: string
  }
  isLoadingSalaries: boolean
  selectedSalary: Salary | null
  isLoadingSalaryDetail: boolean

  // Employee - My Salary
  mySalaries: Salary[]
  isLoadingSalary: boolean
  filterYear: string
  filterMonth: string

  // Setters
  setSalaries: (salaries: Salary[]) => void
  setSalariesMeta: (meta: any) => void
  setSalariesFilters: (filters: Partial<SalaryState['salariesFilters']>) => void
  setLoadingSalaries: (loading: boolean) => void
  setSelectedSalary: (salary: Salary | null) => void
  setLoadingSalaryDetail: (loading: boolean) => void

  setMySalaries: (salaries: Salary[]) => void
  setLoadingSalary: (loading: boolean) => void
  setFilterYear: (year: string) => void
  setFilterMonth: (month: string) => void

  // Actions HR
  fetchSalaries: () => Promise<void>
  calculateAllSalaries: (month: number, year: number) => Promise<void>
  approveSalary: (id: string) => Promise<void>
  markAsPaid: (id: string) => Promise<void>
  cancelSalary: (id: string) => Promise<void>
  addSalaryDetail: (salaryId: string, detail: AddSalaryDetailDto) => Promise<void>
  fetchSalaryById: (id: string) => Promise<Salary | null>

  // Actions My Salary
  fetchMySalaries: () => Promise<void>
}

export const useSalaryStore = create<SalaryState>((set, get) => ({
  // Initial State
  salaries: [],
  salariesMeta: { page: 1, limit: 10, total: 0, totalPages: 1 },
  salariesFilters: { page: 1, limit: 10 },
  isLoadingSalaries: false,
  selectedSalary: null,
  isLoadingSalaryDetail: false,

  mySalaries: [],
  isLoadingSalary: false,
  filterYear: String(new Date().getFullYear()),
  filterMonth: 'ALL',

  // Setters
  setSalaries: (salaries) => set({ salaries }),
  setSalariesMeta: (meta) => set({ salariesMeta: meta }),
  setSalariesFilters: (filters) => set((state) => ({
    salariesFilters: { ...state.salariesFilters, ...filters }
  })),
  setLoadingSalaries: (isLoadingSalaries) => set({ isLoadingSalaries }),
  setSelectedSalary: (selectedSalary) => set({ selectedSalary }),
  setLoadingSalaryDetail: (isLoadingSalaryDetail) => set({ isLoadingSalaryDetail }),

  setMySalaries: (mySalaries) => set({ mySalaries }),
  setLoadingSalary: (isLoadingSalary) => set({ isLoadingSalary }),
  setFilterYear: (filterYear) => set({ filterYear }),
  setFilterMonth: (filterMonth) => set({ filterMonth }),

  // ==================== HR SALARY ====================
  fetchSalaries: async () => {
    const { salariesFilters } = get()
    set({ isLoadingSalaries: true })

    try {
      const data = await salaryService.getSalaries({
        month: salariesFilters.month,
        year: salariesFilters.year,
        employeeId: salariesFilters.employeeId,
        status: salariesFilters.status,
      })

      set({ salaries: data })

      set({
        salariesMeta: {
          page: salariesFilters.page,
          limit: salariesFilters.limit,
          total: data.length,
          totalPages: Math.ceil(data.length / salariesFilters.limit),
        }
      })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải danh sách lương'))
    } finally {
      set({ isLoadingSalaries: false })
    }
  },

  calculateAllSalaries: async (month: number, year: number) => {
    set({ isLoadingSalaries: true })
    try {
      await salaryService.calculateAllSalaries({ month, year })
      toast.success(`Đã tính lương tháng ${month}/${year}`)
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Tính lương thất bại'))
    } finally {
      set({ isLoadingSalaries: false })
    }
  },

  approveSalary: async (id: string) => {
    try {
      await salaryService.approveSalary(id)
      toast.success('Đã duyệt lương')
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Duyệt lương thất bại'))
    }
  },

  markAsPaid: async (id: string) => {
    try {
      await salaryService.markAsPaid(id)
      toast.success('Đã thanh toán lương')
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Thanh toán thất bại'))
    }
  },

  cancelSalary: async (id: string) => {
    try {
      await salaryService.cancelSalary(id)
      toast.success('Đã hủy lương')
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Hủy lương thất bại'))
    }
  },

  addSalaryDetail: async (salaryId: string, detail: AddSalaryDetailDto) => {
    try {
      await salaryService.addSalaryDetail(salaryId, detail)
      toast.success('Đã thêm chi tiết lương')
      await get().fetchSalaries()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Thêm chi tiết thất bại'))
    }
  },

  fetchSalaryById: async (id: string) => {
    set({ isLoadingSalaryDetail: true })
    try {
      const salary = await salaryService.getSalaryById(id)
      set({ selectedSalary: salary })
      return salary
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải chi tiết lương'))
      return null
    } finally {
      set({ isLoadingSalaryDetail: false })
    }
  },

  // ==================== MY SALARY ====================
  fetchMySalaries: async () => {
    const { filterYear, filterMonth } = get()
    set({ isLoadingSalary: true })

    try {
      const params: { year: number; month?: number } = { year: Number(filterYear) }
      if (filterMonth !== 'ALL') {
        params.month = Number(filterMonth)
      }
      const data = await salaryService.getMySalaries(params)
      set({ mySalaries: data })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải bảng lương!'))
    } finally {
      set({ isLoadingSalary: false })
    }
  },
}))