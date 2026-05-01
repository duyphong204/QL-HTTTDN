import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { ChartCard } from "./ChartCard";
import { ProfitLineChart, RevenueBarChart } from "./SalesCharts";
import { SummaryCard } from "./SummaryCard";
import { useReportStore } from "@/stores/report.store";
import { formatCurrencyVnd, formatNumberVi } from "@/utils/format";

export const SalesReportSection = () => {
  const sales = useReportStore((s) => s.sales);
  const loading = useReportStore((s) => s.loadingSales);

  const seriesEmpty =
    !sales?.breakdown.length ||
    sales.breakdown.every((p) => !p.revenue && !p.profit && !p.quantity);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Doanh thu"
          value={formatCurrencyVnd(sales?.summary.revenue ?? 0)}
          icon={DollarSign}
          tone="blue"
          loading={loading}
        />
        <SummaryCard
          title="Lợi nhuận"
          value={formatCurrencyVnd(sales?.summary.profit ?? 0)}
          icon={TrendingUp}
          tone="emerald"
          loading={loading}
        />
        <SummaryCard
          title="Sản phẩm đã bán"
          value={`${formatNumberVi(sales?.summary.totalSoldQuantity ?? 0)} sp`}
          icon={ShoppingBag}
          tone="violet"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Doanh thu theo thời gian"
          description="Tổng doanh thu theo từng kỳ"
          loading={loading}
          empty={seriesEmpty}
        >
          <RevenueBarChart data={sales?.breakdown ?? []} />
        </ChartCard>

        <ChartCard
          title="Lợi nhuận theo thời gian"
          description="Xu hướng lợi nhuận"
          loading={loading}
          empty={seriesEmpty}
        >
          <ProfitLineChart data={sales?.breakdown ?? []} />
        </ChartCard>
      </div>
    </div>
  );
};
