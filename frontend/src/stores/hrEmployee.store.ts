import { create } from 'zustand'
import type { Employee } from '@/types/employee.types'
import type { BaseFilters, PaginationMeta, SortOrder } from '@/types/common.types'
import { mergeFiltersWithPageReset } from '@/stores/store.helpers'

type EmployeeFilters = BaseFilters & {
  department?: string
  position?: string
  isActive?: boolean
}

interface HrEmployeeState {
  employees: Employee[]
  meta: PaginationMeta | null
  filters: EmployeeFilters
  selectedEmployee: Employee | null
  loadingEmployees: boolean
  loadingEmployeeDetail: boolean
  setFilters: (filters: Partial<EmployeeFilters>) => void
  setEmployees: (employees: Employee[]) => void
  setMeta: (meta: PaginationMeta | null) => void
  setSelectedEmployee: (employee: Employee | null) => void
  clearSelectedEmployee: () => void
  setLoadingEmployees: (loading: boolean) => void
  setLoadingEmployeeDetail: (loading: boolean) => void
}

export const useHrEmployeeStore = create<HrEmployeeState>((set) => ({
  employees: [],
  meta: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'code',
    sortOrder: 'asc' as SortOrder,
    department: '',
    position: '',
    isActive: true,
  },
  selectedEmployee: null,
  loadingEmployees: false,
  loadingEmployeeDetail: false,
  setFilters: (newFilters) => {
    set((state) => ({
      filters: mergeFiltersWithPageReset(state.filters, newFilters),
    }))
  },
  setEmployees: (employees) => set({ employees }),
  setMeta: (meta) => set({ meta }),
  setSelectedEmployee: (selectedEmployee) => set({ selectedEmployee }),
  clearSelectedEmployee: () => set({ selectedEmployee: null }),
  setLoadingEmployees: (loadingEmployees) => set({ loadingEmployees }),
  setLoadingEmployeeDetail: (loadingEmployeeDetail) => set({ loadingEmployeeDetail }),
}))

export type { EmployeeFilters }
