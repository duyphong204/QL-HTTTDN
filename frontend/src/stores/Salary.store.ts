import { create } from 'zustand'
import { toast } from 'sonner'
import { salaryService } from '@/services/hr.service'
import { getErrorMessage } from '@/stores/store.helpers'
import type { Salary } from '@/types/salary.types'

interface MySalaryState {
  mySalaries: Salary[]
  isLoading: boolean
  filterYear: string
  filterMonth: string

  setFilterYear: (year: string) => void
  setFilterMonth: (month: string) => void
  fetchMySalaries: () => Promise<void>
}

export const useMySalaryStore = create<MySalaryState>((set, get) => ({
  mySalaries: [],
  isLoading: false,
  filterYear: String(new Date().getFullYear()),
  filterMonth: 'ALL',

  setFilterYear: (filterYear) => set({ filterYear }),
  setFilterMonth: (filterMonth) => set({ filterMonth }),

  fetchMySalaries: async () => {
    const { filterYear, filterMonth } = get()
    set({ isLoading: true })
    try {
      const params: { year: number; month?: number } = { year: Number(filterYear) }
      if (filterMonth !== 'ALL') params.month = Number(filterMonth)
      const data = await salaryService.getMySalaries(params)
      set({ mySalaries: data })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải bảng lương!'))
    } finally {
      set({ isLoading: false })
    }
  },
}))
