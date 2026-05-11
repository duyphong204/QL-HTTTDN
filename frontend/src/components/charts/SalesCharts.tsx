import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyVnd, formatNumberVi } from "@/utils/format";
import type { SalesSeriesPoint } from "@/types/report.type";

const CURRENCY_FORMATTER = (value: number) => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return formatNumberVi(value);
};

interface RevenueBarChartProps {
  data: SalesSeriesPoint[];
}

export const RevenueBarChart = ({ data }: RevenueBarChartProps) => (
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
        dataKey="revenue"
        name="Doanh thu"
        fill="#3b82f6"
        radius={[6, 6, 0, 0]}
        barSize={28}
      />
    </BarChart>
  </ResponsiveContainer>
);

interface ProfitLineChartProps {
  data: SalesSeriesPoint[];
}

export const ProfitLineChart = ({ data }: ProfitLineChartProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
      <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#64748b" }} />
      <YAxis
        tick={{ fontSize: 12, fill: "#64748b" }}
        tickFormatter={CURRENCY_FORMATTER}
      />
      <Tooltip
        formatter={(v: number) => formatCurrencyVnd(v)}
        contentStyle={{
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          fontSize: 12,
        }}
      />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Line
        type="monotone"
        dataKey="profit"
        name="Lợi nhuận"
        stroke="#10b981"
        strokeWidth={2.5}
        dot={{ r: 4, fill: "#10b981" }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
);
