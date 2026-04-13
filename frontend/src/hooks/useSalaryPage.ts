import { useEffect, useMemo, useState } from 'react'
import { useHrStore } from '@/stores/hr.store'
import { useClientTable } from '@/hooks/useClientTable'

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

const currentYear = new Date().getFullYear()

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount || 0) + ' đ'

export const useSalaryPage = () => {
  const { salaries, loadingSalaries, fetchSalaries, calculateAllSalaries } = useHrStore()

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

  const years = useMemo(() => [currentYear, currentYear - 1, currentYear - 2], [])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

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
    formatCurrency,
  }
}
