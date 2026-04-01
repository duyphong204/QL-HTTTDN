import { useEffect, useMemo, useState } from 'react';
import { useSalesStore } from '@/store/sales.store';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Printer, Package } from 'lucide-react';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

type PeriodType = 'month' | 'quarter' | 'year';

export default function SalesReportPage() {
  const { stats, isLoadingStats, fetchStats, fetchStatsByPeriod } = useSalesStore();

  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [quarter, setQuarter] = useState('1');
  const [year, setYear] = useState(String(currentYear));

  useEffect(() => {
    if (periodType === 'month') {
      fetchStats({ month: Number(month), year: Number(year) });
    } else if (periodType === 'quarter') {
      fetchStatsByPeriod({ year: Number(year), quarter: Number(quarter) });
    } else {
      fetchStatsByPeriod({ year: Number(year) });
    }
  }, [periodType, month, quarter, year, fetchStats, fetchStatsByPeriod]);

  const periodLabel = useMemo(() => {
    if (periodType === 'month') return `Tháng ${month}/${year}`;
    if (periodType === 'quarter') return `Quý ${quarter}/${year}`;
    return `Năm ${year}`;
  }, [periodType, month, quarter, year]);

  const itemsSold = stats?.totalItemsSold ?? stats?.totalProductsSold ?? 0;
  const revenue = stats?.totalRevenue ?? 0;
  const profit = stats?.totalProfit ?? 0;
  const cost = Math.max(0, revenue - profit);
  const avgOrderValue = stats?.totalOrders ? revenue / stats.totalOrders : 0;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const maxScale = Math.max(revenue, cost, Math.abs(profit), 1);
  const revenuePercent = Math.min(100, (revenue / maxScale) * 100);
  const costPercent = Math.min(100, (cost / maxScale) * 100);
  const profitPercent = Math.min(100, (Math.abs(profit) / maxScale) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 size={32} className="text-blue-600" />
              Báo cáo thống kê kinh doanh
            </h1>
            <p className="text-gray-600 mt-1">Theo dõi hiệu quả bán hàng theo kỳ</p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 px-5 py-3 rounded-2xl text-sm font-medium text-gray-700 transition shadow-sm hover:shadow"
          >
            <Printer size={18} />
            In báo cáo
          </button>
        </div>

        {/* Bộ chọn kỳ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-wrap gap-4 items-center">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(['month', 'quarter', 'year'] as PeriodType[]).map((t) => (
              <button
                key={t}
                onClick={() => setPeriodType(t)}
                className={`px-6 py-3 text-sm font-medium transition-all ${
                  periodType === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t === 'month' ? 'Theo tháng' : t === 'quarter' ? 'Theo quý' : 'Theo năm'}
              </button>
            ))}
          </div>

          {periodType === 'month' && (
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-11 px-4 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          )}

          {periodType === 'quarter' && (
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="h-11 px-4 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Quý 1</option>
              <option value="2">Quý 2</option>
              <option value="3">Quý 3</option>
              <option value="4">Quý 4</option>
            </select>
          )}

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-11 px-4 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>

          <div className="ml-auto text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2.5 rounded-xl">
            {periodLabel}
          </div>
        </div>

        {isLoadingStats ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-20 text-center text-gray-500">
            Đang tải báo cáo...
          </div>
        ) : stats ? (
          <>
            {/* Thống kê chính */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Tổng đơn hàng',
                  value: stats.totalOrders || 0,
                  icon: ShoppingCart,
                  color: 'text-blue-600',
                },
                {
                  label: 'Sản phẩm đã bán',
                  value: itemsSold,
                  icon: Package,
                  color: 'text-indigo-600',
                },
                {
                  label: 'Doanh thu',
                  value: formatCurrency(revenue),
                  icon: TrendingUp,
                  color: 'text-emerald-600',
                },
                {
                  label: 'Lợi nhuận',
                  value: formatCurrency(profit),
                  icon: DollarSign,
                  color: profit >= 0 ? 'text-green-600' : 'text-red-600',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow transition">
                  <item.icon size={28} className={`${item.color} mb-4`} />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{item.value}</div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>

            {/* So sánh Doanh thu - Chi phí - Lợi nhuận */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">So sánh Doanh thu - Chi phí - Lợi nhuận</h3>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Doanh thu</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${revenuePercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Chi phí ước tính</span>
                    <span className="font-semibold text-amber-600">{formatCurrency(cost)}</span>
                  </div>
                  <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${costPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Lợi nhuận</span>
                    <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden ${profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div
                      className={`h-full rounded-full ${profit >= 0 ? 'bg-green-600' : 'bg-red-500'}`}
                      style={{ width: `${profitPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hiệu quả bán hàng */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Hiệu quả bán hàng</h3>

              <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Vòng tròn biên lợi nhuận */}
                <div className="relative w-56 h-56 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="14" />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="14"
                      strokeDasharray={`${profitMargin * 3.27} 327`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500 mt-1">Biên lợi nhuận</span>
                  </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <div className="text-sm text-gray-600">Giá trị trung bình / đơn</div>
                      <div className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(avgOrderValue)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <div className="text-sm text-gray-600">Sản phẩm trung bình / đơn</div>
                      <div className="text-2xl font-bold text-gray-900 mt-2">
                        {stats.totalOrders ? (itemsSold / stats.totalOrders).toFixed(1) : 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 py-20 text-center text-gray-500">
            Chưa có dữ liệu báo cáo cho kỳ đã chọn.
          </div>
        )}
      </div>
    </div>
  );
}