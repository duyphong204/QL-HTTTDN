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
import type {
  WarehouseReportSummary,
  WarehouseSeriesPoint,
} from "@/types/report.type";

const CURRENCY_FORMATTER = (value: number) => {
  if (Math.abs(value) >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000)
    return `${(value / 1_000_000).toFixed(0)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return formatNumberVi(value);
};

interface ImportExportChartProps {
  data: WarehouseSeriesPoint[];
}

export const ImportExportChart = ({ data }: ImportExportChartProps) => (
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
        dataKey="import"
        name="Nhập kho"
        fill="#6366f1"
        radius={[6, 6, 0, 0]}
        barSize={20}
      />
      <Bar
        dataKey="export"
        name="Xuất kho"
        fill="#f59e0b"
        radius={[6, 6, 0, 0]}
        barSize={20}
      />
    </BarChart>
  </ResponsiveContainer>
);

interface InventoryPieChartProps {
  data: WarehouseReportSummary;
}

const INVENTORY_COLORS = ["#6366f1", "#f59e0b", "#10b981"];

export const InventoryPieChart = ({ data }: InventoryPieChartProps) => {
  const chartData = [
    { name: "Nhập kho", value: data.totalImportAmount },
    { name: "Xuất kho", value: data.totalExportAmount },
    { name: "Tồn kho (SP)", value: data.totalInventory },
  ];

  const isEmpty = chartData.every((d) => !d.value);
  if (isEmpty) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400 italic">
        Chưa có dữ liệu kho
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
            <Cell key={idx} fill={INVENTORY_COLORS[idx]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number, name: string) =>
            name === "Tồn kho (SP)"
              ? `${formatNumberVi(v)} sp`
              : formatCurrencyVnd(v)
          }
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
