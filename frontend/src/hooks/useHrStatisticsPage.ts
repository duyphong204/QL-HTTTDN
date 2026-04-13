import { useEffect, useMemo, useState } from 'react'
import { useHrStore } from '@/stores/hr.store'

const currentYear = new Date().getFullYear()

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

export const useHrStatisticsPage = () => {
  const { statistics, salaries, loadingSalaries, loadingStatistics, fetchStatistics, fetchSalaries } = useHrStore()

  const [year, setYear] = useState(String(currentYear))
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))

  useEffect(() => {
    void Promise.all([
      fetchStatistics({ month: Number(month), year: Number(year) }),
      fetchSalaries({ month: Number(month), year: Number(year) }),
    ])
  }, [month, year, fetchStatistics, fetchSalaries])

  const totalBonus = useMemo(
    () => salaries.reduce((acc, salary) => acc + (salary.bonus || 0), 0),
    [salaries]
  )

  const totalBudget = useMemo(
    () => (statistics?.totalSalaryPaid || 0) + (statistics?.totalBonus || 0),
    [statistics]
  )

  const isLoading = loadingSalaries || loadingStatistics
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])
  const years = useMemo(() => [currentYear, currentYear - 1], [])

  return {
    statistics,
    salaries,
    month,
    year,
    totalBonus,
    totalBudget,
    isLoading,
    months,
    years,
    setMonth,
    setYear,
    formatCurrency,
  }
}
