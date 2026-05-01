import { useEffect, useState } from "react";
import { LayoutDashboard, ShoppingCart, Users, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HrReportSection,
  ReportFilter,
  SalesReportSection,
  WarehouseReportSection,
} from "@/components/charts";
import { useReportStore } from "@/stores/report.store";

type AdminTab = "sales" | "warehouse" | "hr";

const TABS: { value: AdminTab; label: string; icon: typeof Users }[] = [
  { value: "sales", label: "Bán hàng", icon: ShoppingCart },
  { value: "warehouse", label: "Kho hàng", icon: Warehouse },
  { value: "hr", label: "Nhân sự", icon: Users },
];

export default function AdminReportPage() {
  const [tab, setTab] = useState<AdminTab>("sales");

  const filters = useReportStore((s) => s.filters);
  const setFilters = useReportStore((s) => s.setFilters);
  const fetchSales = useReportStore((s) => s.fetchSales);
  const fetchWarehouse = useReportStore((s) => s.fetchWarehouse);
  const fetchHr = useReportStore((s) => s.fetchHr);

  const loadingSales = useReportStore((s) => s.loadingSales);
  const loadingWarehouse = useReportStore((s) => s.loadingWarehouse);
  const loadingHr = useReportStore((s) => s.loadingHr);
  const loading = loadingSales || loadingWarehouse || loadingHr;
  const typeOptions =
    tab === "sales" ? (["month", "quarter", "year"] as const) : (["month", "year"] as const);

  useEffect(() => {
    if (tab === "sales") fetchSales();
    if (tab === "warehouse") fetchWarehouse();
    if (tab === "hr") fetchHr();
  }, [
    tab,
    fetchSales,
    fetchWarehouse,
    fetchHr,
    filters.type,
    filters.year,
    filters.month,
    filters.quarter,
  ]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Báo cáo tổng hợp
              </h1>
              <p className="text-sm text-gray-500">
                Tổng quan dữ liệu vận hành toàn doanh nghiệp
              </p>
            </div>
          </div>
        </div>

        <ReportFilter
          filters={filters}
          onChange={setFilters}
          loading={loading}
          typeOptions={typeOptions}
        />

        <div className="flex flex-wrap gap-1 rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "sales" && <SalesReportSection />}
        {tab === "warehouse" && <WarehouseReportSection />}
        {tab === "hr" && <HrReportSection />}
      </div>
    </div>
  );
}
