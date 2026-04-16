import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAdminStore } from '@/stores/admin.store'
import { adminService } from '@/services/admin.service'
import { reportService } from '@/services/report.service'
import { getErrorMessage } from '@/stores/store.helpers'
import { getCurrentYear, getRecentYears, MONTH_OPTIONS } from '@/utils/date'
import { formatCurrencyVnd, formatNumberVi } from '@/utils/format'
import type { RoleReportResponse } from '@/types/report.types'

const currentYear = getCurrentYear()

export const useAdminReportPage = () => {
  const { report, isLoading, setReport, setLoading, setError } = useAdminStore()
  const [analyticsReport, setAnalyticsReport] = useState<RoleReportResponse | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  const [year, setYear] = useState(String(currentYear))
  const [month, setMonth] = useState('')

  useEffect(() => {
    const loadDashboardReport = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await adminService.getDashboardReport({
          year: Number(year),
          month: month ? Number(month) : undefined,
        })
        setReport(data)
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Không thể tải báo cáo tổng hợp')
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    void loadDashboardReport()
  }, [month, setError, setLoading, setReport, year])

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true)
      try {
        const data = await reportService.getAdminReport({
          year: Number(year),
          month: month ? Number(month) : undefined,
        })
        setAnalyticsReport(data)
      } catch {
        setAnalyticsReport(null)
      } finally {
        setIsLoadingAnalytics(false)
      }
    }

    void loadAnalytics()
  }, [year, month])

  const years = useMemo(() => getRecentYears(3, currentYear), [])
  const months = useMemo(() => MONTH_OPTIONS, [])

  const periodLabel = useMemo(() => {
    if (!report?.period) return '-'
    return report.period.month
      ? `Tháng ${report.period.month}/${report.period.year}`
      : `Năm ${report.period.year}`
  }, [report])

  const quickStats = useMemo(
    () => [
      { title: 'Tổng đơn hàng', value: formatNumberVi(report?.sales?.totalOrders ?? 0) },
      { title: 'Doanh thu', value: formatCurrencyVnd(report?.sales?.totalRevenue ?? 0) },
      { title: 'Tổng giá trị nhập', value: formatCurrencyVnd(report?.warehouse?.totalImportValue ?? 0) },
      {
        title: 'Tổng quỹ lương',
        value: formatCurrencyVnd((report?.hr?.totalSalaryPaid ?? 0) + (report?.hr?.totalBonus ?? 0)),
      },
    ],
    [report]
  )

  const detailStats = useMemo(
    () => ({
      sales: [
        { label: 'Sản phẩm đã xuất', value: formatNumberVi(report?.sales?.totalItemsSold ?? 0) },
        { label: 'Lợi nhuận', value: formatCurrencyVnd(report?.sales?.totalProfit ?? 0), highlight: true },
      ],
      hr: [
        { label: 'Nhân sự đang làm', value: formatNumberVi(report?.hr?.totalEmployees ?? 0) },
        { label: 'Nhân sự đã nghỉ', value: formatNumberVi(report?.hr?.totalResigned ?? 0) },
        { label: 'Bảng lương đã tính', value: formatNumberVi(report?.hr?.headcount ?? 0) },
      ],
      warehouse: [
        { label: 'Số phiếu nhập', value: formatNumberVi(report?.warehouse?.totalStockIns ?? 0) },
        { label: 'Tổng tồn kho', value: formatNumberVi(report?.warehouse?.totalStockQuantity ?? 0) },
        { label: 'Loại sản phẩm', value: formatNumberVi(report?.warehouse?.totalProductTypes ?? 0) },
      ],
    }),
    [report]
  )

  const lowStockProducts = report?.warehouse?.lowStockProducts ?? []

  const handlePrint = () => window.print()

  return {
    report,
    isLoading,
    year,
    month,
    years,
    months,
    periodLabel,
    quickStats,
    detailStats,
    lowStockProducts,
    analyticsReport,
    isLoadingAnalytics,
    setYear,
    setMonth,
    handlePrint,
  }
}
