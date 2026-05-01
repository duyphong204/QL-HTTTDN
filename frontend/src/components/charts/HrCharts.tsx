import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyVnd, formatNumberVi } from "@/utils/format";
import type { HrReportSummary, HrSeriesPoint } from "@/types/report.type";

const CURRENCY_FORMATTER = (value: number) => {
  if (Math.abs(value) >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000)
    return `${(value / 1_000_000).toFixed(0)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return formatNumberVi(value);
};

interface HrPayrollChartProps {
  data: HrSeriesPoint[];
}

export const HrPayrollChart = ({ data }: HrPayrollChartProps) => {
  const isEmpty = !data.length || data.every((d) => !d.salary && !d.bonus && !d.deduction);
  if (isEmpty) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400 italic">
        Chưa có dữ liệu lương
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickFormatter={CURRENCY_FORMATTER}
        />
        <Tooltip
          formatter={(v: number) => formatCurrencyVnd(v)}
          cursor={{ fill: "rgba(59,130,246,0.06)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="salary"
          name="Lương"
          fill="#3b82f6"
          radius={[6, 6, 0, 0]}
          barSize={18}
        >
          {data.map((_, i) => (
            <Cell key={i} fill="#3b82f6" />
          ))}
        </Bar>
        <Bar dataKey="bonus" name="Thưởng" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
        <Bar dataKey="deduction" name="Khấu trừ" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface EmployeeRatioPieChartProps {
  data: HrReportSummary;
}

const EMPLOYEE_COLORS = ["#3b82f6", "#94a3b8"];

export const EmployeeRatioPieChart = ({ data }: EmployeeRatioPieChartProps) => {
  const chartData = [
    { name: "Đang làm", value: data.activeEmployees },
    { name: "Đã nghỉ việc", value: data.resignedEmployees },
  ];

  const isEmpty = chartData.every((d) => !d.value);
  if (isEmpty) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400 italic">
        Chưa có dữ liệu nhân sự
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={2}
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {chartData.map((_, idx) => (
            <Cell key={idx} fill={EMPLOYEE_COLORS[idx]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => `${formatNumberVi(v)} người`}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
