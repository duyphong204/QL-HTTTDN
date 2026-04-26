import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useEmployeeStore } from '@/stores/employee.store'
import { salaryService } from '@/services/hr.service'
import { getErrorMessage } from '@/stores/store.helpers'
import type { AddSalaryDetailDto, Salary } from '@/types/salary.types'

// ==================== HR SALARY MANAGEMENT ====================
export const useSalary = () => {
  const {
    salaries,
    salariesMeta,
    salariesFilters,
    isLoadingSalaries,
    selectedSalary,
    isLoadingSalaryDetail,
    setSalaries,
    setSalariesMeta,
    setSalariesFilters,
    setLoadingSalaries,
    setSelectedSalary,
    setLoadingSalaryDetail,
  } = useEmployeeStore()

  // Fetch salaries (manager view)
  const fetchSalaries = useCallback(async () => {
    setLoadingSalaries(true)
    try {
      const data = await salaryService.getSalaries({
        month: salariesFilters.month,
        year: salariesFilters.year,
        employeeId: salariesFilters.employeeId,
        status: salariesFilters.status,
      })
      setSalaries(data)
      setSalariesMeta({
        page: salariesFilters.page,
        limit: salariesFilters.limit,
        total: data.length,
        totalPages: Math.ceil(data.length / salariesFilters.limit),
      })
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể tải danh sách lương'))
    } finally {
      setLoadingSalaries(false)
    }
  }, [salariesFilters, setSalaries, setSalariesMeta, setLoadingSalaries])

  // Calculate all salaries
  const calculateAllSalaries = useCallback(async (month: number, year: number) => {
    setLoadingSalaries(true)
    try {
      await salaryService.calculateAllSalaries({ month, year })
      toast.success(`Đã tính lương tháng ${month}/${year}`)
      await fetchSalaries()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Tính lương thất bại'))
    } finally {
      setLoadingSalaries(false)
    }
  }, [fetchSalaries, setLoadingSalaries])

  // Approve salary
  const approveSalary = useCallback(async (id: string) => {
    try {
      await salaryService.approveSalary(id)
      toast.success('Đã duyệt lương')
      await fetchSalaries()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Duyệt lương thất bại'))
    }
  }, [fetchSalaries])

  // Mark as paid
  const markAsPaid = useCallback(async (id: string) => {
    try {
      await salaryService.markAsPaid(id)
      toast.success('Đã thanh toán lương')
      await fetchSalaries()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Thanh toán thất bại'))
    }
  }, [fetchSalaries])

  // Cancel salary
  const cancelSalary = useCallback(async (id: string) => {
    try {
      await salaryService.cancelSalary(id)
      toast.success('Đã hủy lương')
      await fetchSalaries()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Hủy lương thất bại'))
    }
  }, [fetchSalaries])

  // Add salary detail (bonus/deduction)
  const addSalaryDetail = useCallback(async (salaryId: string, detail: AddSalaryDetailDto) => {
    try {
      await salaryService.addSalaryDetail(salaryId, detail)
      toast.success('Đã thêm chi tiết lương')
      await fetchSalaries()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Thêm chi tiết thất bại'))
    }
  }, [fetchSalaries])

  // Get salary by ID
  const fetchSalaryById = useCallback(async (id: string) => {
    setLoadingSalaryDetail(true)
    try {
      const salary = await salaryService.getSalaryById(id)
      setSelectedSalary(salary)
      return salary
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể tải chi tiết lương'))
      return null
    } finally {
      setLoadingSalaryDetail(false)
    }
  }, [setLoadingSalaryDetail, setSelectedSalary])

  // Filter helpers
  const updateFilters = useCallback((filters: Partial<typeof salariesFilters>) => {
    setSalariesFilters(filters)
  }, [setSalariesFilters])

  const goToPage = useCallback((page: number) => {
    setSalariesFilters({ page })
  }, [setSalariesFilters])

  // Auto fetch on mount
  useEffect(() => {
    void fetchSalaries()
  }, [fetchSalaries])

  // Statistics
  const stats = useCallback(() => {
    const total = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0)
    const paid = salaries.filter(s => s.status === 'PAID').length
    const pending = salaries.filter(s => s.status === 'PENDING').length
    const approved = salaries.filter(s => s.status === 'APPROVED').length

    return {
      total,
      count: salaries.length,
      paid,
      pending,
      approved,
      avgSalary: salaries.length > 0 ? total / salaries.length : 0,
    }
  }, [salaries])

  return {
    // Data
    salaries,
    salariesMeta,
    isLoadingSalaries,
    selectedSalary,
    isLoadingSalaryDetail,
    salariesFilters,

    // Actions
    fetchSalaries,
    fetchSalaryById,
    calculateAllSalaries,
    approveSalary,
    markAsPaid,
    cancelSalary,
    addSalaryDetail,

    // Filter
    updateFilters,
    goToPage,
    stats,
  }
}

// ==================== NHÂN VIÊN XEM LƯƠNG ====================
export const useMySalary = () => {
  const {
    mySalaries,
    isLoadingSalary,
    setMySalaries,
    setLoadingSalary,
  } = useEmployeeStore()

  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()))
  const [filterMonth, setFilterMonth] = useState<string>('ALL')

  // Fetch my salaries
  const fetchMySalaries = useCallback(async () => {
    setLoadingSalary(true)
    try {
      const params: { year: number; month?: number } = {
        year: Number(filterYear),
      }
      if (filterMonth !== 'ALL') {
        params.month = Number(filterMonth)
      }
      const data = await salaryService.getMySalaries(params)
      setMySalaries(data)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể tải bảng lương!'))
    } finally {
      setLoadingSalary(false)
    }
  }, [filterYear, filterMonth, setMySalaries, setLoadingSalary])

  // Auto fetch
  useEffect(() => {
    void fetchMySalaries()
  }, [fetchMySalaries])

  // Get salary for specific month
  const monthlySalary = useMemo(() => {
    if (filterMonth === 'ALL') return null
    const month = Number(filterMonth)
    return mySalaries.find(s => s.month === month && s.year === Number(filterYear)) || null
  }, [mySalaries, filterMonth, filterYear])

  // Print monthly
  const printMonthly = () => {
    if (filterMonth === 'ALL') return
    document.body.classList.add('print-monthly')
    window.print()
    document.body.classList.remove('print-monthly')
  }

  // Print yearly
  const printYearly = () => {
    document.body.classList.add('print-yearly')
    window.print()
    document.body.classList.remove('print-yearly')
  }

  // Calculate salary breakdown
  const salaryBreakdown = useCallback((salary: Salary) => {
    const dailyRate = (salary.baseSalary || 0) / (salary.workingDays || 26)
    const workedAmount = dailyRate * (salary.actualWorkDays || 0)

    return {
      baseSalary: salary.baseSalary || 0,
      workingDays: salary.workingDays || 26,
      actualWorkDays: salary.actualWorkDays || 0,
      dailyRate,
      workedAmount,
      totalBonus: salary.totalBonus || 0,
      totalDeduction: salary.totalDeduction || 0,
      grossSalary: salary.grossSalary || 0,
      netSalary: salary.netSalary || 0,
      details: salary.details || [],
    }
  }, [])

  return {
    // Data
    mySalaries,
    isLoadingSalary,
    filterYear,
    setFilterYear,
    filterMonth,
    setFilterMonth,

    // Actions
    fetchMySalaries,
    monthlySalary,
    printMonthly,
    printYearly,
    salaryBreakdown,
  }
}