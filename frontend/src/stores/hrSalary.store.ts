import { create } from 'zustand'
import type { Salary } from '@/types/salary.types'

interface HrSalaryState {
  salaries: Salary[]
  isLoading: boolean
  setSalaries: (salaries: Salary[]) => void
  setLoading: (isLoading: boolean) => void
}

export const useHrSalaryStore = create<HrSalaryState>((set) => ({
  salaries: [],
  isLoading: false,
  setSalaries: (salaries) => set({ salaries }),
  setLoading: (isLoading) => set({ isLoading }),
}))
