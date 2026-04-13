import { useEffect, useMemo, useState } from 'react'
import { useAdminStore } from '@/stores/admin.store'
import { reportService } from '@/services/report.service'
import type { RoleReportResponse } from '@/types/report.type'

const currentYear = new Date().getFullYear()

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)

const formatNumber = (num?: number) => (num || 0).toLocaleString('vi-VN')

export const useAdminReportPage = () => {
  const { report, isLoading, fetchDashboardReport } = useAdminStore()
  const [analyticsReport, setAnalyticsReport] = useState<RoleReportResponse | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  const [year, setYear] = useState(String(currentYear))
  const [month, setMonth] = useState('')

  useEffect(() => {
    void fetchDashboardReport({
      year: Number(year),
      month: month ? Number(month) : undefined,
    })
  }, [year, month, fetchDashboardReport])

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

  const years = useMemo(() => [currentYear, currentYear - 1, currentYear - 2], [])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  const periodLabel = useMemo(() => {
    if (!report?.period) return '-'
    return report.period.month
      ? `Tháng ${report.period.month}/${report.period.year}`
      : `Năm ${report.period.year}`
  }, [report])

  const quickStats = useMemo(
    () => [
      { title: 'Tổng đơn hàng', value: formatNumber(report?.sales?.totalOrders) },
      { title: 'Doanh thu', value: formatCurrency(report?.sales?.totalRevenue) },
      { title: 'Tổng giá trị nhập', value: formatCurrency(report?.warehouse?.totalImportValue) },
      {
        title: 'Tổng quỹ lương',
        value: formatCurrency((report?.hr?.totalSalaryPaid ?? 0) + (report?.hr?.totalBonus ?? 0)),
      },
    ],
    [report]
  )

  const detailStats = useMemo(
    () => ({
      sales: [
        { label: 'Sản phẩm đã xuất', value: formatNumber(report?.sales?.totalItemsSold) },
        { label: 'Lợi nhuận', value: formatCurrency(report?.sales?.totalProfit), highlight: true },
      ],
      hr: [
        { label: 'Nhân sự đang làm', value: formatNumber(report?.hr?.totalEmployees) },
        { label: 'Nhân sự đã nghỉ', value: formatNumber(report?.hr?.totalResigned) },
        { label: 'Bảng lương đã tính', value: formatNumber(report?.hr?.headcount) },
      ],
      warehouse: [
        { label: 'Số phiếu nhập', value: formatNumber(report?.warehouse?.totalStockIns) },
        { label: 'Tổng tồn kho', value: formatNumber(report?.warehouse?.totalStockQuantity) },
        { label: 'Loại sản phẩm', value: formatNumber(report?.warehouse?.totalProductTypes) },
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
