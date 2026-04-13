import { useEffect, useMemo, useState } from 'react'
import { useProductStore } from '@/stores/product.store'
import { reportService } from '@/services/report.service'
import type { RoleReportResponse } from '@/types/report.type'

const currentYear = new Date().getFullYear()

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

export const useWarehouseReportPage = () => {
  const { report, isLoadingReport, fetchReport } = useProductStore()
  const [analyticsReport, setAnalyticsReport] = useState<RoleReportResponse | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  const [month, setMonth] = useState('')
  const [year, setYear] = useState(String(currentYear))

  useEffect(() => {
    void fetchReport({
      month: month ? Number(month) : undefined,
      year: Number(year),
    })
  }, [month, year, fetchReport])

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true)
      try {
        const data = await reportService.getWarehouseReport({
          month: month ? Number(month) : undefined,
          year: Number(year),
        })
        setAnalyticsReport(data)
      } catch {
        setAnalyticsReport(null)
      } finally {
        setIsLoadingAnalytics(false)
      }
    }

    void loadAnalytics()
  }, [month, year])

  const years = useMemo(() => [currentYear, currentYear - 1, currentYear - 2], [])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  const statCards = useMemo(
    () => [
      { label: 'Số phiếu nhập', value: report?.totalStockIns ?? 0, icon: 'stockIns' as const },
      {
        label: 'Giá trị nhập',
        value: formatCurrency(report?.totalImportValue ?? 0),
        icon: 'importValue' as const,
      },
      { label: 'Loại sản phẩm', value: report?.totalProductTypes ?? 0, icon: 'types' as const },
      { label: 'Tổng tồn kho', value: report?.totalStockQuantity ?? 0, icon: 'stockQty' as const },
    ],
    [report]
  )

  const lowStockProducts = report?.lowStockProducts ?? []

  const handlePrint = () => window.print()

  return {
    report,
    isLoadingReport,
    month,
    year,
    years,
    months,
    statCards,
    lowStockProducts,
    analyticsReport,
    isLoadingAnalytics,
    setMonth,
    setYear,
    handlePrint,
  }
}
