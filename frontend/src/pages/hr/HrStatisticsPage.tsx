import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  UserCheck,
} from "lucide-react";
import { useHrStatisticsStore } from "@/stores/hrStatistics.store";
import { PageLoading } from "@/components/common/Loading";

const MONTH_LABELS = [
  "T1", "T2", "T3", "T4", "T5", "T6",
  "T7", "T8", "T9", "T10", "T11", "T12",
];

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Nghỉ phép năm",
  SICK: "Nghỉ ốm",
  MATERNITY: "Thai sản",
  RESIGNATION: "Nghỉ việc",
  UNPAID: "Nghỉ không lương",
};

const LEAVE_TYPE_COLORS: Record<string, string> = {
  ANNUAL: "bg-blue-100 text-blue-700",
  SICK: "bg-red-100 text-red-700",
  MATERNITY: "bg-pink-100 text-pink-700",
  RESIGNATION: "bg-gray-100 text-gray-700",
  UNPAID: "bg-yellow-100 text-yellow-700",
};

function formatCurrency(value: number) {
  if (value >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  return value.toLocaleString("vi-VN");
}

function StatCard({
  icon: Icon,
  title,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider truncate">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-medium">
            {formatCurrency(p.value)} ₫
          </span>
        </div>
      ))}
    </div>
  );
};

export default function HrStatisticsPage() {
  const {
    statistics: stats,
    isLoading,
    filterYear,
    filterMonth,
    setFilterYear,
    setFilterMonth,
    fetchStatistics,
  } = useHrStatisticsStore();

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  const chartData = stats?.monthlyBreakdown?.map((m) => ({
    name: MONTH_LABELS[m.month - 1],
    "Lương thực lĩnh": m.totalNetSalary,
    "Thưởng": m.totalBonus,
    "Số NV": m.employeeCount,
  })) ?? [];

  if (isLoading && !stats) {
    return <PageLoading text="Đang tải thống kê..." className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Thống kê nhân sự
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tổng quan tình hình lương, thưởng và nhân sự theo năm
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterMonth ?? ""}
              onChange={(e) =>
                setFilterMonth(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Cả năm</option>
              {MONTH_LABELS.map((label, i) => (
                <option key={i + 1} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                icon={Users}
                title="Đang làm việc"
                value={stats.totalEmployees}
                sub={`${stats.totalResigned} đã nghỉ`}
                color="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={UserCheck}
                title="Mới trong tháng"
                value={stats.newThisMonth}
                color="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                icon={TrendingDown}
                title="Nghỉ việc tháng này"
                value={stats.resignedThisMonth}
                color="bg-red-50 text-red-600"
              />
              <StatCard
                icon={Wallet}
                title="Tổng lương chi"
                value={formatCurrency(stats.totalSalaryPaid) + " ₫"}
                sub={`Tháng ${stats.salaryMonth}/${stats.salaryYear}`}
                color="bg-purple-50 text-purple-600"
              />
              <StatCard
                icon={TrendingUp}
                title="Tổng thưởng"
                value={formatCurrency(stats.totalBonus) + " ₫"}
                color="bg-amber-50 text-amber-600"
              />
              <StatCard
                icon={Clock}
                title="Đơn xin nghỉ chờ"
                value={stats.pendingLeaveRequests}
                color="bg-orange-50 text-orange-600"
              />
            </div>

            {/* Monthly payroll chart */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">
                Biểu đồ lương & thưởng theo tháng — {filterYear}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar
                    dataKey="Lương thực lĩnh"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Thưởng"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom row: avg salary + leave stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Average salary */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">
                  Bảng lương tháng {stats.salaryMonth}/{stats.salaryYear}
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Số nhân viên có lương</span>
                    <span className="font-semibold text-gray-900">
                      {stats.headcount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Tổng lương chi trả</span>
                    <span className="font-semibold text-blue-600">
                      {stats.totalSalaryPaid.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Tổng khấu trừ</span>
                    <span className="font-semibold text-red-500">
                      {stats.totalDeduction.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Lương trung bình</span>
                    <span className="font-bold text-gray-900 text-base">
                      {stats.avgSalary.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Leave stats by type */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">
                  Đơn xin nghỉ theo loại — {filterYear}
                </h2>
                {stats.leaveStatsByType.length === 0 ? (
                  <div className="flex items-center justify-center h-28 text-gray-400 text-sm">
                    Chưa có đơn nào trong năm {filterYear}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.leaveStatsByType.map((s) => (
                      <div
                        key={s.type}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${LEAVE_TYPE_COLORS[s.type] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {LEAVE_TYPE_LABELS[s.type] ?? s.type}
                        </span>
                        <span className="font-bold text-gray-700">
                          {s._count.id} đơn
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {!stats && !isLoading && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center text-gray-400">
            <p>Không có dữ liệu thống kê</p>
          </div>
        )}
      </div>
    </div>
  );
}
