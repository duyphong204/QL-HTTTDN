import { useEffect, useMemo, useState } from 'react'
import { useSalesStore } from '@/stores/sales.store'

export type ReportPeriodType = 'month' | 'quarter' | 'year'

const currentYear = new Date().getFullYear()

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

export const useSalesReportPage = () => {
  const { stats, isLoadingStats, fetchStats, fetchStatsByPeriod } = useSalesStore()

  const [periodType, setPeriodType] = useState<ReportPeriodType>('month')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [quarter, setQuarter] = useState('1')
  const [year, setYear] = useState(String(currentYear))

  useEffect(() => {
    if (periodType === 'month') {
      void fetchStats({ month: Number(month), year: Number(year) })
      return
    }

    if (periodType === 'quarter') {
      void fetchStatsByPeriod({ year: Number(year), quarter: Number(quarter) })
      return
    }

    void fetchStatsByPeriod({ year: Number(year) })
  }, [periodType, month, quarter, year, fetchStats, fetchStatsByPeriod])

  const years = useMemo(() => [currentYear, currentYear - 1, currentYear - 2], [])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  const statCards = useMemo(
    () => [
      { label: 'Tổng đơn hàng', value: stats?.totalOrders ?? 0, icon: 'orders' as const },
      { label: 'Sản phẩm xuất', value: stats?.totalItemsSold ?? 0, icon: 'items' as const },
      { label: 'Doanh thu', value: formatCurrency(stats?.totalRevenue ?? 0), icon: 'revenue' as const },
      { label: 'Lợi nhuận', value: formatCurrency(stats?.totalProfit ?? 0), icon: 'profit' as const },
    ],
    [stats]
  )

  const handlePrint = () => window.print()

  return {
    stats,
    isLoadingStats,
    periodType,
    month,
    quarter,
    year,
    years,
    months,
    statCards,
    setPeriodType,
    setMonth,
    setQuarter,
    setYear,
    handlePrint,
  }
}
