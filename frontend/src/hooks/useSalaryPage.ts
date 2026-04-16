import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useHrSalaryStore } from '@/stores/hrSalary.store'
import { useClientTable } from '@/hooks/useClientTable'
import { salaryService } from '@/services/hr.service'
import { getErrorMessage } from '@/stores/store.helpers'
import { getCurrentYear, getRecentYears, MONTH_OPTIONS } from '@/utils/date'
import { formatNumberWithDong } from '@/utils/format'

export const SALARY_STATUS_BADGE = {
  PAID: {
    label: 'Đã thanh toán',
    color: 'bg-green-100 text-green-600',
  },
  PENDING: {
    label: 'Chưa thanh toán',
    color: 'bg-yellow-100 text-yellow-600',
  },
} as const

const currentYear = getCurrentYear()

export const useSalaryPage = () => {
  const salaries = useHrSalaryStore((state) => state.salaries)
  const loadingSalaries = useHrSalaryStore((state) => state.isLoading)
  const setSalaries = useHrSalaryStore((state) => state.setSalaries)
  const setLoadingSalaries = useHrSalaryStore((state) => state.setLoading)

  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(currentYear))
  const [calculating, setCalculating] = useState(false)

  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } = useClientTable({
    data: salaries,
    pageSize: 10,
    searchFn: (salary, keyword) => {
      const name = salary.employee?.user?.profile?.fullName?.toLowerCase() ?? ''
      return name.includes(keyword)
    },
  })

  const fetchSalaries = useCallback(
    async (params?: { month?: number; year?: number }) => {
      setLoadingSalaries(true)
      try {
        const data = await salaryService.getSalaries(params)
        setSalaries(data)
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Không thể tải bảng lương'))
      } finally {
        setLoadingSalaries(false)
      }
    },
    [setLoadingSalaries, setSalaries],
  )

  const calculateAllSalaries = useCallback(
    async (params: { month: number; year: number }) => {
      try {
        await salaryService.calculateAllSalaries(params)
        toast.success('Đã tính lương tháng cho toàn bộ nhân sự active')
        await fetchSalaries(params)
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Không thể tính lương hàng loạt'))
        throw error
      }
    },
    [fetchSalaries],
  )

  useEffect(() => {
    void fetchSalaries({ month: Number(month), year: Number(year) })
  }, [month, year, fetchSalaries])

  const summary = useMemo(() => {
    let total = 0
    let paid = 0

    salaries.forEach((salary) => {
      total += salary.amount || 0
      if (salary.status === 'PAID') paid += 1
    })

    return {
      total: (total / 1000000).toFixed(1) + 'M',
      count: salaries.length,
      paid,
    }
  }, [salaries])

  const years = useMemo(() => getRecentYears(3, currentYear), [])
  const months = useMemo(() => MONTH_OPTIONS, [])

  const handleCalculateAll = async () => {
    setCalculating(true)
    try {
      await calculateAllSalaries({ month: Number(month), year: Number(year) })
    } finally {
      setCalculating(false)
    }
  }

  const handlePrint = () => {
    document.body.classList.add('print-salary-management')
    window.print()
    document.body.classList.remove('print-salary-management')
  }

  return {
    salaries,
    loadingSalaries,
    month,
    year,
    calculating,
    searchTerm,
    page,
    pagedData,
    meta,
    summary,
    years,
    months,
    setMonth,
    setYear,
    setSearchTerm,
    setPage,
    handleCalculateAll,
    handlePrint,
    formatCurrency: (amount: number) => formatNumberWithDong(amount, true),
  }
}
