import {
  Award,
  CircleDollarSign,
  TrendingDown,
  UserCheck,
  UserX,
} from "lucide-react";
import { ChartCard } from "./ChartCard";
import { SummaryCard } from "./SummaryCard";
import { EmployeeRatioPieChart, HrPayrollChart } from "./HrCharts";
import { useReportStore } from "@/stores/report.store";
import { formatCurrencyVnd, formatNumberVi } from "@/utils/format";

export const HrReportSection = () => {
  const hr = useReportStore((s) => s.hr);
  const loading = useReportStore((s) => s.loadingHr);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Tổng quỹ lương"
          value={formatCurrencyVnd(hr?.summary.totalSalary ?? 0)}
          icon={CircleDollarSign}
          tone="blue"
          loading={loading}
        />
        <SummaryCard
          title="Tổng thưởng"
          value={formatCurrencyVnd(hr?.summary.totalBonus ?? 0)}
          icon={Award}
          tone="emerald"
          loading={loading}
        />
        <SummaryCard
          title="Tổng khấu trừ"
          value={formatCurrencyVnd(hr?.summary.totalDeduction ?? 0)}
          icon={TrendingDown}
          tone="rose"
          loading={loading}
        />
        <SummaryCard
          title="Đang làm việc"
          value={`${formatNumberVi(hr?.summary.activeEmployees ?? 0)} người`}
          icon={UserCheck}
          tone="violet"
          loading={loading}
        />
        <SummaryCard
          title="Đã nghỉ việc"
          value={`${formatNumberVi(hr?.summary.resignedEmployees ?? 0)} người`}
          icon={UserX}
          tone="slate"
          loading={loading}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <ChartCard
          title="Cơ cấu chi phí"
          description="Lương / thưởng / khấu trừ"
          loading={loading}
          empty={!hr?.breakdown.length || hr.breakdown.every((p) => !p.salary && !p.bonus && !p.deduction)}
          className="lg:col-span-2"
        >
          {hr && <HrPayrollChart data={hr.breakdown} />}
        </ChartCard>

        <ChartCard
          title="Tỷ lệ nhân sự"
          description="Đang làm vs nghỉ"
          loading={loading}
          empty={!hr}
        >
          {hr && <EmployeeRatioPieChart data={hr.summary} />}
        </ChartCard>
      </div>
    </div>
  );
};