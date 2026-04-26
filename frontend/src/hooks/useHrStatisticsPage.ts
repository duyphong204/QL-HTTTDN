import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useHrStatisticsStore } from '@/stores/hrStatistics.store'
import { useHrSalaryStore } from '@/stores/hrSalary.store'
import { employeeService, salaryService } from '@/services/hr.service'
import { reportService } from '@/services/report.service'
import { getErrorMessage } from '@/stores/store.helpers'
import { getCurrentYear, getRecentYears, MONTH_OPTIONS } from '@/utils/date'
import { formatCurrencyVnd } from '@/utils/format'
import type { RoleReportResponse } from '@/types/report.types'

const currentYear = getCurrentYear()

export const useHrStatisticsPage = () => {
  const statistics = useHrStatisticsStore((state) => state.statistics)
  const loadingStatistics = useHrStatisticsStore((state) => state.isLoading)
  const setStatistics = useHrStatisticsStore((state) => state.setStatistics)
  const setLoadingStatistics = useHrStatisticsStore((state) => state.setLoading)

  const salaries = useHrSalaryStore((state) => state.salaries)
  const loadingSalaries = useHrSalaryStore((state) => state.isLoading)
  const setSalaries = useHrSalaryStore((state) => state.setSalaries)
  const setLoadingSalaries = useHrSalaryStore((state) => state.setLoading)
  const [reportData, setReportData] = useState<RoleReportResponse | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)

  const [year, setYear] = useState(String(currentYear))
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))

  const fetchStatistics = useCallback(
    async (params?: { month?: number; year?: number }) => {
      setLoadingStatistics(true)
      try {
        const data = await employeeService.getHrStatistics(params)
        setStatistics(data)
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Không thể tải thống kê HR'))
      } finally {
        setLoadingStatistics(false)
      }
    },
    [setLoadingStatistics, setStatistics],
  )

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

  useEffect(() => {
    void Promise.all([
      fetchStatistics({ month: Number(month), year: Number(year) }),
      fetchSalaries({ month: Number(month), year: Number(year) }),
    ])
  }, [month, year, fetchStatistics, fetchSalaries])

  useEffect(() => {
    const loadReport = async () => {
      setLoadingReport(true)
      try {
        const data = await reportService.getHrReport({
          month: Number(month),
          year: Number(year),
        })
        setReportData(data)
      } catch {
        setReportData(null)
      } finally {
        setLoadingReport(false)
      }
    }

    void loadReport()
  }, [month, year])

  const totalBonus = useMemo(
    () => salaries.reduce((acc, salary) => acc + (salary.totalBonus || 0), 0),
    [salaries]
  )

  const totalBudget = useMemo(
    () => (statistics?.totalSalaryPaid || 0) + (statistics?.totalBonus || 0),
    [statistics]
  )

  const isLoading = loadingSalaries || loadingStatistics
  const months = useMemo(() => MONTH_OPTIONS, [])
  const years = useMemo(() => getRecentYears(2, currentYear), [])

  return {
    statistics,
    salaries,
    month,
    year,
    totalBonus,
    totalBudget,
    isLoading,
    reportData,
    loadingReport,
    months,
    years,
    setMonth,
    setYear,
    formatCurrency: formatCurrencyVnd,
  }
}
