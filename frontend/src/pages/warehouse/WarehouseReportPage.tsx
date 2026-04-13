// frontend/src/pages/warehouse/WarehouseReportPage.tsx
import { BarChart3, Package, AlertTriangle, TrendingDown, Printer } from 'lucide-react'
import { useWarehouseReportPage } from '@/hooks/useWarehouseReportPage'
import { RoleChartCard } from '@/components/common/reports/RoleChartCard'

export default function WarehouseReportPage() {
    const {
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
    } = useWarehouseReportPage()

    const shownLowStockProducts = analyticsReport?.lowStockProducts?.length
        ? analyticsReport.lowStockProducts
        : lowStockProducts

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8 print:bg-white">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="text-blue-600 print:hidden" size={28} />
                            Báo cáo thống kê kho
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 print:hidden">Thống kê tình hình kho theo tháng / năm</p>
                    </div>
                    <button onClick={handlePrint}
                        className="print:hidden inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
                        <Printer size={16} /> In báo cáo
                    </button>
                </div>

                <div className="flex gap-3 print:hidden">
                    <select value={month} onChange={e => setMonth(e.target.value)}
                        className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white">
                        <option value="">Cả năm</option>
                        {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)}
                        className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white">
                        {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                    </select>
                </div>

                {isLoadingReport ? (
                    <div className="text-center py-20 text-gray-400">Đang tải báo cáo...</div>
                ) : report && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {statCards.map(card => {
                                const Icon = card.icon === 'importValue'
                                    ? TrendingDown
                                    : card.icon === 'types'
                                        ? BarChart3
                                        : Package

                                return (
                                <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <Icon size={20} className="text-blue-500 mb-3" />
                                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                                    <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                                </div>
                                )
                            })}
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                            <RoleChartCard
                                title="Tồn kho theo danh mục"
                                chart={analyticsReport?.charts?.stockByCategory}
                                type="bar"
                            />
                            <RoleChartCard
                                title="Nhập/Xuất theo xu hướng thời gian"
                                chart={analyticsReport?.charts?.movementTrend}
                                type="line"
                            />
                        </div>

                        {isLoadingAnalytics && (
                            <div className="text-center text-sm text-gray-400">Đang tải dữ liệu biểu đồ...</div>
                        )}

                        {shownLowStockProducts.length > 0 && (
                            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-amber-50 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-amber-500" />
                                    <span className="font-semibold text-gray-800">
                                        Sản phẩm sắp hết hàng ({shownLowStockProducts.length})
                                    </span>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-500 text-xs uppercase border-b border-gray-100">
                                            <th className="px-6 py-3 text-left">Tên sản phẩm</th>
                                            <th className="px-6 py-3 text-center">Tồn kho</th>
                                            <th className="px-6 py-3 text-center">Tồn tối thiểu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {shownLowStockProducts.map(p => (
                                            <tr key={p.id}>
                                                <td className="px-6 py-3 text-gray-800">{p.name}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                                        {p.stockQuantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-center text-gray-500">{p.minStock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
