import { useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { ReportFilter, SalesReportSection } from "@/components/charts";
import { useReportStore } from "@/stores/report.store";

export default function SalesReportPage() {
  const filters = useReportStore((s) => s.filters);
  const setFilters = useReportStore((s) => s.setFilters);
  const fetchSales = useReportStore((s) => s.fetchSales);
  const loading = useReportStore((s) => s.loadingSales);

  useEffect(() => {
    fetchSales();
  }, [fetchSales, filters.type, filters.year, filters.month, filters.quarter]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Báo cáo bán hàng
              </h1>
              <p className="text-sm text-gray-500">
                Theo dõi doanh thu, lợi nhuận và sản lượng tiêu thụ
              </p>
            </div>
          </div>
        </div>

        <ReportFilter
          filters={filters}
          onChange={setFilters}
          loading={loading}
          typeOptions={["month", "quarter", "year"]}
        />

        <SalesReportSection />
      </div>
    </div>
  );
}
