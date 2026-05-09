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
  TopCategoryItem,
  TopProductItem,
  TopSupplierItem,
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

const BAR_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#4f46e5", "#7c3aed", "#9333ea", "#a855f7", "#c026d3"];

interface TopProductsChartProps { data: TopProductItem[] }
export const TopProductsChart = ({ data }: TopProductsChartProps) => {
  const max = Math.max(...data.map((d) => d.totalQuantity), 1);
  if (!data.length) return <p className="text-sm text-gray-400 italic text-center py-4">Chưa có dữ liệu</p>;
  return (
    <div className="space-y-2.5">
      {data.map((item, i) => (
        <div key={item.productId} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-right text-xs font-medium text-gray-400">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs truncate text-gray-700 font-medium">{item.productName}</span>
              <span className="text-xs text-gray-500 shrink-0 ml-2">{formatNumberVi(item.totalQuantity)} sp</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(item.totalQuantity / max) * 100}%`, backgroundColor: BAR_COLORS[i] }} />
            </div>
          </div>
          <span className="text-xs text-gray-400 shrink-0 w-20 text-right">{formatCurrencyVnd(item.totalRevenue)}</span>
        </div>
      ))}
    </div>
  );
};

interface TopCategoriesChartProps { data: TopCategoryItem[] }
export const TopCategoriesChart = ({ data }: TopCategoriesChartProps) => {
  if (!data.length) return <p className="text-sm text-gray-400 italic text-center py-4">Chưa có dữ liệu</p>;
  const chartData = data.map((d) => ({ name: d.categoryName, value: d.totalQuantity }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${formatNumberVi(v)}`} />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip formatter={(v: number) => [`${formatNumberVi(v)} sp`, "Số lượng"]} contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Bar dataKey="value" name="Số lượng" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface TopSuppliersChartProps { data: TopSupplierItem[] }
export const TopSuppliersChart = ({ data }: TopSuppliersChartProps) => {
  const max = Math.max(...data.map((d) => d.totalQuantity), 1);
  if (!data.length) return <p className="text-sm text-gray-400 italic text-center py-4">Chưa có dữ liệu</p>;
  return (
    <div className="space-y-2.5">
      {data.map((item, i) => (
        <div key={item.supplierId} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-right text-xs font-medium text-gray-400">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs truncate text-gray-700 font-medium">{item.supplierName}</span>
              <span className="text-xs text-gray-500 shrink-0 ml-2">{formatNumberVi(item.totalQuantity)} sp</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(item.totalQuantity / max) * 100}%`, backgroundColor: BAR_COLORS[i] }} />
            </div>
          </div>
          <span className="text-xs text-gray-400 shrink-0 w-20 text-right">{formatCurrencyVnd(item.totalRevenue)}</span>
        </div>
      ))}
    </div>
  );
};
