import { ArrowDownToLine, ArrowUpFromLine, Boxes } from "lucide-react";
import { ChartCard } from "./ChartCard";
import { SummaryCard } from "./SummaryCard";
import {
  ImportExportChart,
  InventoryPieChart,
} from "./WarehouseCharts";
import { useReportStore } from "@/stores/report.store";
import { formatCurrencyVnd, formatNumberVi } from "@/utils/format";

export const WarehouseReportSection = () => {
  const warehouse = useReportStore((s) => s.warehouse);
  const loading = useReportStore((s) => s.loadingWarehouse);

  const seriesEmpty =
    !warehouse?.breakdown.length ||
    warehouse.breakdown.every((p) => !p.import && !p.export);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Tổng nhập kho"
          value={formatCurrencyVnd(warehouse?.summary.totalImportAmount ?? 0)}
          icon={ArrowDownToLine}
          tone="violet"
          loading={loading}
        />
        <SummaryCard
          title="Tổng xuất kho"
          value={formatCurrencyVnd(warehouse?.summary.totalExportAmount ?? 0)}
          icon={ArrowUpFromLine}
          tone="amber"
          loading={loading}
        />
        <SummaryCard
          title="Tồn kho hiện tại"
          value={`${formatNumberVi(warehouse?.summary.totalInventory ?? 0)} sp`}
          icon={Boxes}
          tone="emerald"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Nhập / Xuất theo kỳ"
          description="So sánh giá trị nhập và xuất kho"
          loading={loading}
          empty={seriesEmpty}
          className="lg:col-span-2"
        >
          <ImportExportChart data={warehouse?.breakdown ?? []} />
        </ChartCard>

        <ChartCard
          title="Cơ cấu kho"
          description="Tỷ trọng nhập / xuất / tồn"
          loading={loading}
          empty={!warehouse}
        >
          {warehouse && <InventoryPieChart data={warehouse.summary} />}
        </ChartCard>
      </div>
    </div>
  );
};
