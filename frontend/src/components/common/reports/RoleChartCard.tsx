import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RechartsChartData } from "@/types/report.types";

type ChartType = "line" | "bar" | "pie" | "composed";

interface RoleChartCardProps {
  title?: string;
  chart?: RechartsChartData;
  type: ChartType;
  className?: string;
}

// Palette mới: Tương phản cao, dễ phân biệt cho Pie Chart
const PIE_COLORS = [
  "#2563eb", // Xanh dương đậm
  "#ea580c", // Cam đậm
  "#16a34a", // Xanh lá
  "#dc2626", // Đỏ
  "#7c3aed", // Tím
  "#ca8a04", // Vàng đậm
  "#0ea5e9", // Xanh dương sáng
  "#db2777", // Hồng đậm
  "#14b8a6", // Xanh ngọc
  "#f97316", // Cam sáng
];

const formatNumber = (value: number) => value.toLocaleString("vi-VN");
const formatTooltipValue = (value: unknown) => formatNumber(Number(value ?? 0));

const toSeries = (chart: RechartsChartData) =>
  chart.datasets.map((dataset, index) => ({
    key: `s${index}`,
    name: dataset.name,
    color: dataset.color || PIE_COLORS[index % PIE_COLORS.length],
    data: dataset.data,
  }));

export function RoleChartCard({
  title,
  chart,
  type,
  className = "",
}: RoleChartCardProps) {
  if (!chart || !chart.labels.length || !chart.datasets.length) {
    return (
      <div
        className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}
      >
        {title && (
          <h3 className="mb-4 text-base font-semibold text-slate-800">
            {title}
          </h3>
        )}
        <div className="flex h-72 items-center justify-center text-sm text-slate-400">
          Không có dữ liệu biểu đồ
        </div>
      </div>
    );
  }

  const series = toSeries(chart);
  const chartData = chart.labels.map((label, index) => {
    const row: Record<string, string | number> = { label };
    for (const item of series) {
      row[item.key] = item.data[index] ?? 0;
    }
    return row;
  });

  const pieData = chart.labels.map((label, index) => ({
    name: label,
    value: series[0]?.data[index] ?? 0,
  }));

  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}
    >
      {title && (
        <h3 className="mb-4 text-base font-semibold text-slate-800">{title}</h3>
      )}

      <div className="h-[420px] w-full">
        {" "}
        {/* Tăng chiều cao để dễ nhìn hơn */}
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              {series.map((item) => (
                <Line
                  key={item.key}
                  dataKey={item.key}
                  name={item.name}
                  stroke={item.color}
                  strokeWidth={2.5}
                  dot={false}
                />
              ))}
            </LineChart>
          ) : null}

          {type === "bar" ? (
            <BarChart
              data={chartData}
              margin={{ bottom: 70, left: 10, right: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, angle: -45, textAnchor: "end" }}
                height={80}
              />
              <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              {series.map((item) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.name}
                  fill={item.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : null}

          {type === "pie" ? (
            <PieChart>
              <Tooltip formatter={formatTooltipValue} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={4}
                cx="50%"
                cy="48%"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
