import { useEffect, useMemo, useState } from 'react'
import { useAdminStore } from '@/stores/admin.store'

const currentYear = new Date().getFullYear()

export const useAdminReport = () => {
  const { report, isLoading, fetchDashboardReport } = useAdminStore()
  const [year, setYear] = useState(String(currentYear))
  const [month, setMonth] = useState('')

  useEffect(() => {
    void fetchDashboardReport({
      year: Number(year),
      month: month ? Number(month) : undefined,
    })
  }, [year, month, fetchDashboardReport])

  const periodLabel = useMemo(() => {
    if (!report?.period) return '-'
    return report.period.month
      ? `Tháng ${report.period.month}/${report.period.year}`
      : `Năm ${report.period.year}`
  }, [report])

  return {
    report,
    isLoading,
    year,
    setYear,
    month,
    setMonth,
    periodLabel,
  }
}
