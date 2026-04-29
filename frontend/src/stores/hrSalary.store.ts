// src/stores/hrSalary.store.ts
import { create } from 'zustand'
import { toast } from 'sonner'
import { salaryService } from '@/services/hr.service'
import { getErrorMessage } from '@/stores/store.helpers'
import type { Salary, AddSalaryDetailDto } from '@/types/salary.types'

interface State {
  salaries: Salary[]
  isLoading: boolean

  filters: {
    page: number
    limit: number
    month?: number
    year?: number
  }

  setFilters: (f: Partial<State['filters']>) => void

  fetch: () => Promise<void>
  calculateAll: (month: number, year: number) => Promise<void>
  approve: (id: string) => Promise<void>
  pay: (id: string) => Promise<void>
  addDetail: (id: string, data: AddSalaryDetailDto) => Promise<void>
}

export const useHrSalaryStore = create<State>((set, get) => ({
  salaries: [],
  isLoading: false,

  filters: {
    page: 1,
    limit: 10,
  },

  setFilters: (f) =>
    set((state) => ({
      filters: { ...state.filters, ...f },
    })),

  fetch: async () => {
    set({ isLoading: true })
    try {
      const data = await salaryService.getSalaries(get().filters)
      set({ salaries: data })
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      set({ isLoading: false })
    }
  },

  calculateAll: async (month, year) => {
    try {
      await salaryService.calculateAll({ month, year })
      toast.success('Tính lương thành công')
      await get().fetch()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  },

  approve: async (id) => {
    try {
      await salaryService.approve(id)
      toast.success('Đã duyệt')
      await get().fetch()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  },

  pay: async (id) => {
    try {
      await salaryService.pay(id)
      toast.success('Đã thanh toán')
      await get().fetch()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  },


  addDetail: async (id, data) => {
    try {
      await salaryService.addDetail(id, data)
      toast.success('Thêm chi tiết thành công')
      await get().fetch()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  },
}))