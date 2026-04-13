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
} from 'recharts';
import type { RechartsChartData } from '@/types/report.type';

type ChartType = 'line' | 'bar' | 'pie' | 'composed';

interface RoleChartCardProps {
  title: string;
  chart?: RechartsChartData;
  type: ChartType;
  className?: string;
}

const fallbackColors = ['#2563eb', '#16a34a', '#f97316', '#0ea5e9', '#e11d48', '#8b5cf6'];

const formatNumber = (value: number) => value.toLocaleString('vi-VN');
const formatTooltipValue = (value: unknown) => formatNumber(Number(value ?? 0));

const toSeries = (chart: RechartsChartData) =>
  chart.datasets.map((dataset, index) => ({
    key: `s${index}`,
    name: dataset.name,
    color: dataset.color || fallbackColors[index % fallbackColors.length],
    data: dataset.data,
  }));

export function RoleChartCard({ title, chart, type, className = '' }: RoleChartCardProps) {
  if (!chart || !chart.labels.length || !chart.datasets.length) {
    return (
      <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}>
        <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
        <div className="flex h-72 items-center justify-center text-sm text-slate-400">Không có dữ liệu biểu đồ</div>
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
    <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}>
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          {type === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatTooltipValue(value)} />
              <Legend />
              {series.map((item) => (
                <Line key={item.key} dataKey={item.key} name={item.name} stroke={item.color} strokeWidth={2.5} dot={false} />
              ))}
            </LineChart>
          ) : null}

          {type === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatTooltipValue(value)} />
              <Legend />
              {series.map((item) => (
                <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          ) : null}

          {type === 'composed' ? (
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatTooltipValue(value)} />
              <Legend />
              {series.map((item, index) =>
                index === 0 ? (
                  <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[6, 6, 0, 0]} />
                ) : (
                  <Line key={item.key} dataKey={item.key} name={item.name} stroke={item.color} strokeWidth={2.5} dot={false} />
                ),
              )}
            </ComposedChart>
          ) : null}

          {type === 'pie' ? (
            <PieChart>
              <Tooltip formatter={(value) => formatTooltipValue(value)} />
              <Legend />
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={45} paddingAngle={2}>
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={series[0]?.color || fallbackColors[index % fallbackColors.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
