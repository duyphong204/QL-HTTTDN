// frontend/src/pages/admin/ReportPage.tsx
import { useEffect, useState } from 'react'
import { orderApi } from '@/api/order.api'
import { BarChart3, TrendingUp, ShoppingCart, Package } from 'lucide-react'

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

const currentYear = new Date().getFullYear()
const YEARS = [currentYear, currentYear - 1, currentYear - 2]
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

interface Stats {
    month: number
    year: number
    totalOrders: number
    totalItemsSold: number
    totalRevenue: number
    totalProfit: number
}

export default function ReportPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(false)
    const [month, setMonth] = useState(String(new Date().getMonth() + 1))
    const [year, setYear] = useState(String(currentYear))

    useEffect(() => {
        setLoading(true)
        orderApi.getSalesStats({ month: Number(month), year: Number(year) })
            .then(setStats).finally(() => setLoading(false))
    }, [month, year])

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" size={28} /> Báo cáo kinh doanh
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Doanh thu và lợi nhuận theo tháng</p>
                </div>

                <div className="flex gap-3">
                    <select value={month} onChange={e => setMonth(e.target.value)}
                        className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white">
                        {MONTHS.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)}
                        className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white">
                        {YEARS.map(y => <option key={y} value={y}>Năm {y}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Đang tải báo cáo...</div>
                ) : stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Tổng đơn hàng', value: stats.totalOrders, icon: ShoppingCart },
                            { label: 'Sản phẩm đã xuất', value: stats.totalItemsSold, icon: Package },
                            { label: 'Doanh thu', value: formatCurrency(stats.totalRevenue), icon: TrendingUp },
                            { label: 'Lợi nhuận', value: formatCurrency(stats.totalProfit), icon: BarChart3 },
                        ].map((card) => (
                            <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
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
