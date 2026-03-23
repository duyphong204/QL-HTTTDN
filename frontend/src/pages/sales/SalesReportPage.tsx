// frontend/src/pages/sales/SalesReportPage.tsx
import { useEffect, useState } from 'react'
import { useSalesStore } from '@/store/sales.store'
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Printer } from 'lucide-react'

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

const currentYear = new Date().getFullYear()
const YEARS = [currentYear, currentYear - 1, currentYear - 2]
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

type PeriodType = 'month' | 'quarter' | 'year'

export default function SalesReportPage() {
    const { stats, isLoadingStats, fetchStats } = useSalesStore()
    const [periodType, setPeriodType] = useState<PeriodType>('month')
    const [month, setMonth] = useState(String(new Date().getMonth() + 1))
    const [year, setYear] = useState(String(currentYear))

    useEffect(() => {
        if (periodType === 'month') {
            fetchStats({ month: Number(month), year: Number(year) })
        } else {
            fetchStats({ year: Number(year) })
        }
    }, [periodType, month, year])

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8 print:bg-white">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between print:block">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="text-blue-600 print:hidden" size={28} />
                            Thống kê kinh doanh
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 print:hidden">Doanh thu và lợi nhuận theo kỳ</p>
                    </div>
                    <button onClick={() => window.print()}
                        className="print:hidden inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
                        <Printer size={16} /> In báo cáo
                    </button>
                </div>

                <div className="flex gap-3 flex-wrap print:hidden">
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        {(['month', 'quarter', 'year'] as PeriodType[]).map(t => (
                            <button key={t} onClick={() => setPeriodType(t)}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${periodType === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}>
                                {t === 'month' ? 'Tháng' : t === 'quarter' ? 'Quý' : 'Năm'}
                            </button>
                        ))}
                    </div>

                    {periodType === 'month' && (
                        <select value={month} onChange={e => setMonth(e.target.value)}
                            className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white">
                            {MONTHS.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                        </select>
                    )}

                    <select value={year} onChange={e => setYear(e.target.value)}
                        className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white">
                        {YEARS.map(y => <option key={y} value={y}>Năm {y}</option>)}
                    </select>
                </div>

                {isLoadingStats ? (
                    <div className="text-center py-20 text-gray-400">Đang tải thống kê...</div>
                ) : stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Tổng đơn hàng', value: stats.totalOrders, icon: ShoppingCart },
                            { label: 'Sản phẩm xuất', value: stats.totalItemsSold, icon: BarChart3 },
                            { label: 'Doanh thu', value: formatCurrency(stats.totalRevenue), icon: TrendingUp },
                            { label: 'Lợi nhuận', value: formatCurrency(stats.totalProfit), icon: DollarSign },
                        ].map(card => (
                            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <card.icon size={20} className="text-blue-500 mb-3" />
                                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                                <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
