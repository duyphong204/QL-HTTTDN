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
import type { LeaveDetail } from "@/types/hr.type";

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
  ANNUAL: "bg-blue-50 text-blue-700 border-blue-100",
  SICK: "bg-red-50 text-red-700 border-red-100",
  MATERNITY: "bg-pink-50 text-pink-700 border-pink-100",
  RESIGNATION: "bg-gray-50 text-gray-700 border-gray-100",
  UNPAID: "bg-amber-50 text-amber-700 border-amber-100",
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
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs font-medium text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-inner border ${color}`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
    </div>
  );
}

interface TooltipPayload {
  dataKey: string;
  name: string;
  color: string;
  value: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-4 text-sm space-y-2 backdrop-blur-xl">
      <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">{label}</p>
      {payload.map((p: TooltipPayload) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ background: p.color }}
          />
          <span className="text-gray-600 font-medium">{p.name}:</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(p.value)} {p.name !== "Số NV" ? "₫" : "người"}
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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <TrendingUp size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Thống kê nhân sự
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Tổng quan tình hình lương, thưởng và nhân sự theo năm
              </p>
            </div>
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
              className="h-10 min-w-[120px] px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer transition-all"
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
              className="h-10 min-w-[100px] px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer transition-all"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                icon={Users}
                title="Đang làm việc"
                value={stats.totalEmployees}
                sub={`${stats.totalResigned} đã nghỉ`}
                color="bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-200"
              />
              <StatCard
                icon={UserCheck}
                title="Mới trong tháng"
                value={stats.newThisMonth}
                color="bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200"
              />
              <StatCard
                icon={TrendingDown}
                title="Nghỉ việc tháng này"
                value={stats.resignedThisMonth}
                color="bg-red-50 text-red-600 border-red-100 hover:border-red-200"
              />
              <StatCard
                icon={Wallet}
                title="Tổng lương chi"
                value={formatCurrency(stats.totalSalaryPaid) + " ₫"}
                sub={`Tháng ${stats.salaryMonth}/${stats.salaryYear}`}
                color="bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-200"
              />
              <StatCard
                icon={TrendingUp}
                title="Tổng thưởng"
                value={formatCurrency(stats.totalBonus) + " ₫"}
                color="bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-200"
              />
              <StatCard
                icon={Clock}
                title="Đơn xin nghỉ chờ"
                value={stats.pendingLeaveRequests}
                color="bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-200"
              />
            </div>

            {/* Monthly payroll chart */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider">
                Biểu đồ lương & thưởng theo tháng — {filterYear}
              </h2>
              <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8f9fa" }} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, fontWeight: 500, paddingTop: "20px" }}
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

            {/* Per-employee leave detail table */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Chi tiết nghỉ phép nhân viên —{" "}
                  {filterMonth ? `Tháng ${filterMonth}/` : ""}{filterYear}
                </h2>
              </div>
              {stats.leaveDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50/30">
                  <span className="text-4xl mb-2">🌴</span>
                  <p className="font-medium text-gray-600">Không có đơn nào trong kỳ này.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Nhân viên</th>
                        <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Loại nghỉ</th>
                        <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-center">Từ ngày</th>
                        <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-center">Đến ngày</th>
                        <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-center">Số ngày</th>
                        <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/50 bg-white">
                      {stats.leaveDetails.map((d: LeaveDetail, i: number) => (
                        <tr key={i} className="group border-b border-gray-50 last:border-0 hover:bg-blue-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{d.employeeName}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-sm ${LEAVE_TYPE_COLORS[d.type] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                              {LEAVE_TYPE_LABELS[d.type] ?? d.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-gray-600">
                            {new Date(d.startDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-gray-600">
                            {new Date(d.endDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-100">
                              {d.totalDays}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border ${
                              d.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : d.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>
                              {d.status === "APPROVED" ? "Đã duyệt"
                                : d.status === "REJECTED" ? "Từ chối"
                                : "Chờ duyệt"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom row: avg salary + leave stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Average salary */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Bảng lương tháng {stats.salaryMonth}/{stats.salaryYear}
                  </h2>
                </div>
                <div className="p-6 text-sm divide-y divide-gray-50">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500 font-medium">Số nhân viên có lương</span>
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                      {stats.headcount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500 font-medium">Tổng lương chi trả</span>
                    <span className="font-bold text-blue-700">
                      {stats.totalSalaryPaid.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500 font-medium">Tổng khấu trừ</span>
                    <span className="font-bold text-red-600">
                      {stats.totalDeduction.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-blue-50/30 rounded-xl mt-2 px-4 border border-blue-50">
                    <span className="text-blue-900 font-bold uppercase tracking-wider text-xs">Lương trung bình</span>
                    <span className="font-black text-blue-700 text-lg">
                      {stats.avgSalary.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Leave stats by type */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Đơn xin nghỉ theo loại — {filterYear}
                  </h2>
                </div>
                <div className="p-6">
                  {stats.leaveStatsByType.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-sm bg-gray-50/50 rounded-xl">
                      <span className="text-2xl mb-2">📊</span>
                      Chưa có thống kê đơn nào trong năm {filterYear}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.leaveStatsByType.map((s) => (
                        <div
                          key={s.type}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                        >
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-sm ${LEAVE_TYPE_COLORS[s.type] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}
                          >
                            {LEAVE_TYPE_LABELS[s.type] ?? s.type}
                          </span>
                          <span className="font-bold text-gray-900 text-base">
                            {s._count.id} <span className="text-xs text-gray-400 font-medium ml-1 uppercase">đơn</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {!stats && !isLoading && (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm p-16 text-center text-gray-500">
            <span className="text-5xl block mb-4">📉</span>
            <p className="font-semibold text-lg">Không có dữ liệu thống kê</p>
            <p className="text-sm mt-1">Hãy thử chọn khoảng thời gian khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
