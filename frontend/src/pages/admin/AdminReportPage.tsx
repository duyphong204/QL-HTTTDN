import { 
  BarChart3, Building2, Users, ShoppingCart, 
  Printer, AlertTriangle, Loader2, TrendingUp, 
  UserCheck, Package 
} from 'lucide-react'
import { useAdminReportPage } from '@/hooks/useAdminReportPage'
import { RoleChartCard } from '@/components/common/reports/RoleChartCard'

// --- MAIN PAGE COMPONENT ---
export default function AdminReportPage() {
  const {
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
  } = useAdminReportPage()

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <BarChart3 className="text-blue-600 print:hidden" size={28} />
              Báo cáo tổng hợp Admin
            </h1>
            <p className="mt-1 text-sm text-slate-500 print:hidden">
              Tổng hợp doanh thu, kho và nhân sự theo thời gian thực
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <div className="flex gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Cả năm</option>
                {months.map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Printer size={16} /> In báo cáo
            </button>
          </div>
        </div>

        {/* CONTENT SECTION */}
        {isLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-slate-500">Đang tải dữ liệu báo cáo...</p>
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
              <span className="font-medium">Kỳ báo cáo:</span>
              <span className="ml-2 font-bold">{periodLabel}</span>
            </div>

            {/* QUICK STATS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title={quickStats[0].title}
                value={quickStats[0].value}
                icon={<ShoppingCart className="text-blue-600" size={20} />}
                bgColor="bg-blue-50"
              />
              <StatCard
                title={quickStats[1].title}
                value={quickStats[1].value}
                icon={<BarChart3 className="text-emerald-600" size={20} />}
                bgColor="bg-emerald-50"
              />
              <StatCard
                title={quickStats[2].title}
                value={quickStats[2].value}
                icon={<Building2 className="text-indigo-600" size={20} />}
                bgColor="bg-indigo-50"
              />
              <StatCard
                title={quickStats[3].title}
                value={quickStats[3].value}
                icon={<Users className="text-amber-600" size={20} />}
                bgColor="bg-amber-50"
              />
            </div>

            {/* DETAILED STATS */}
            <div className="grid gap-4 md:grid-cols-3">
              <DetailCard 
                title="Kinh doanh" 
                icon={<TrendingUp size={18} className="text-emerald-600" />}
                items={detailStats.sales}
              />
              <DetailCard 
                title="Nhân sự" 
                icon={<UserCheck size={18} className="text-blue-600" />}
                items={detailStats.hr}
              />
              <DetailCard 
                title="Kho" 
                icon={<Package size={18} className="text-indigo-600" />}
                items={detailStats.warehouse}
              />
            </div>

            {/* CHARTS */}
            <div className="grid gap-4 xl:grid-cols-2">
              <RoleChartCard
                title="Xu hướng doanh thu - lợi nhuận"
                chart={analyticsReport?.charts?.trend}
                type="line"
                className="xl:col-span-2"
              />
              <RoleChartCard
                title="Top 10 sản phẩm"
                chart={analyticsReport?.charts?.topProducts}
                type="bar"
              />
              <RoleChartCard
                title="Cơ cấu theo danh mục"
                chart={analyticsReport?.charts?.categoryDistribution}
                type="pie"
              />
            </div>

            {isLoadingAnalytics && (
              <div className="text-center text-sm text-slate-400">Đang tải dữ liệu biểu đồ...</div>
            )}

            {/* WARNING TABLE */}
            <LowStockTable products={lowStockProducts} />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white py-20 text-center text-slate-500">
            Không có dữ liệu cho khoảng thời gian này.
          </div>
        )}
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon, bgColor }: { title: string; value: string; icon: React.ReactNode, bgColor: string }) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  )
}

function DetailCard({ title, icon, items }: { title: string, icon: React.ReactNode, items: {label: string, value: string, highlight?: boolean}[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
        {icon}
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-slate-500">{item.label}</span>
            <span className={`font-semibold ${item.highlight ? 'text-emerald-600' : 'text-slate-900'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LowStockTable({ products = [] }: { products?: any[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-amber-50 px-6 py-4">
        <AlertTriangle size={20} className="text-amber-500" />
        <h3 className="text-base font-bold text-amber-900">
          Cảnh báo: Sản phẩm sắp hết ({products.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-semibold">Tên sản phẩm</th>
              <th className="px-6 py-4 text-center font-semibold">Tồn kho hiện tại</th>
              <th className="px-6 py-4 text-center font-semibold">Tồn tối thiểu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                  Tuyệt vời! Không có sản phẩm nào đang cảnh báo tồn kho.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex rounded-full bg-red-50 px-3 py-1 font-bold text-red-600">
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500">{product.minStock}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
