import { useEffect } from "react";
import { Users } from "lucide-react";
import { HrReportSection, ReportFilter } from "@/components/charts";
import { useReportStore } from "@/stores/report.store";

export default function HrReportPage() {
  const filters = useReportStore((s) => s.filters);
  const setFilters = useReportStore((s) => s.setFilters);
  const fetchHr = useReportStore((s) => s.fetchHr);
  const loading = useReportStore((s) => s.loadingHr);

  useEffect(() => {
    fetchHr();
  }, [fetchHr, filters.type, filters.year, filters.month, filters.quarter]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Báo cáo nhân sự
              </h1>
              <p className="text-sm text-gray-500">
                Tổng hợp chi phí nhân sự và biến động nhân lực
              </p>
            </div>
          </div>
        </div>

        <ReportFilter
          filters={filters}
          onChange={setFilters}
          loading={loading}
          typeOptions={["month", "year"]}
        />

        <HrReportSection />
      </div>
    </div>
  );
}
