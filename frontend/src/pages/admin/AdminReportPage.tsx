import { useEffect, useState } from "react";
import { LayoutDashboard, ShoppingCart, Users, Warehouse, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HrReportSection,
  ReportFilter,
  SalesReportSection,
  WarehouseReportSection,
} from "@/components/charts";
import { useReportStore } from "@/stores/report.store";
import { formatCurrencyVnd, formatReportPeriod } from "@/utils/format";

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
  const sales = useReportStore((s) => s.sales);
  const warehouse = useReportStore((s) => s.warehouse);
  const hr = useReportStore((s) => s.hr);

  const loadingSales = useReportStore((s) => s.loadingSales);
  const loadingWarehouse = useReportStore((s) => s.loadingWarehouse);
  const loadingHr = useReportStore((s) => s.loadingHr);
  const loading = loadingSales || loadingWarehouse || loadingHr;

  useEffect(() => {
    if (tab === "sales") fetchSales();
    if (tab === "warehouse") fetchWarehouse();
    if (tab === "hr") fetchHr();
  }, [tab, fetchSales, fetchWarehouse, fetchHr, filters.type, filters.year, filters.month, filters.quarter]);

  const handlePrint = () => {
    document.body.classList.add(`print-admin-${tab}`);
    window.print();
    document.body.classList.remove(`print-admin-${tab}`);
  };

  const periodLabel = formatReportPeriod(filters);
  const currentData = tab === "sales" ? sales : tab === "warehouse" ? warehouse : hr;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <style>{`
        #print-admin-sales, #print-admin-warehouse, #print-admin-hr { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          body.print-admin-sales #print-admin-sales,
          body.print-admin-sales #print-admin-sales * { visibility: visible !important; }
          body.print-admin-sales #print-admin-sales {
            display: block !important; position: absolute; left: 0; top: 0; width: 100%; background: white;
          }
          body.print-admin-warehouse #print-admin-warehouse,
          body.print-admin-warehouse #print-admin-warehouse * { visibility: visible !important; }
          body.print-admin-warehouse #print-admin-warehouse {
            display: block !important; position: absolute; left: 0; top: 0; width: 100%; background: white;
          }
          body.print-admin-hr #print-admin-hr,
          body.print-admin-hr #print-admin-hr * { visibility: visible !important; }
          body.print-admin-hr #print-admin-hr {
            display: block !important; position: absolute; left: 0; top: 0; width: 100%; background: white;
          }
        }
      `}</style>

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

          <button
            onClick={handlePrint}
            disabled={!currentData || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Printer size={16} /> In báo cáo
          </button>
        </div>

        <ReportFilter filters={filters} onChange={setFilters} loading={loading} />

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
                  active ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50",
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

      {/* Print: Bán hàng */}
      <div id="print-admin-sales" className="p-8 text-black text-sm">
        <div className="text-center mb-6">
          <h1 className="text-base font-bold uppercase">Báo cáo bán hàng — {periodLabel}</h1>
          <p className="text-gray-500 mt-0.5 text-xs">Ngày in: {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
        {sales && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Doanh thu", value: formatCurrencyVnd(sales.summary.revenue) },
                { label: "Lợi nhuận", value: formatCurrencyVnd(sales.summary.profit) },
                { label: "Sản lượng bán", value: `${sales.summary.totalSoldQuantity} sp` },
              ].map(({ label, value }) => (
                <div key={label} className="border border-black p-3 text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-bold mt-1">{value}</p>
                </div>
              ))}
            </div>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left">Thời gian</th>
                  <th className="border border-black p-2 text-right">Doanh thu</th>
                  <th className="border border-black p-2 text-right">Lợi nhuận</th>
                  <th className="border border-black p-2 text-right">Sản lượng</th>
                </tr>
              </thead>
              <tbody>
                {sales.breakdown.map((row) => (
                  <tr key={row.time}>
                    <td className="border border-black p-2">{filters.type === "month" ? `Ngày ${row.time}` : `Tháng ${row.time}`}</td>
                    <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(row.revenue)}</td>
                    <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(row.profit)}</td>
                    <td className="border border-black p-2 text-right tabular-nums">{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Print: Kho hàng */}
      <div id="print-admin-warehouse" className="p-8 text-black text-sm">
        <div className="text-center mb-6">
          <h1 className="text-base font-bold uppercase">Báo cáo kho hàng — {periodLabel}</h1>
          <p className="text-gray-500 mt-0.5 text-xs">Ngày in: {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
        {warehouse && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Tổng nhập kho", value: formatCurrencyVnd(warehouse.summary.totalImportAmount) },
                { label: "Tổng xuất kho", value: formatCurrencyVnd(warehouse.summary.totalExportAmount) },
                { label: "Tồn kho", value: `${warehouse.summary.totalInventory} sp` },
                { label: "SL nhập", value: `${warehouse.summary.totalImportQuantity} sp` },
                { label: "SL xuất", value: `${warehouse.summary.totalExportQuantity} sp` },
              ].map(({ label, value }) => (
                <div key={label} className="border border-black p-3 text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-bold mt-1">{value}</p>
                </div>
              ))}
            </div>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left">Thời gian</th>
                  <th className="border border-black p-2 text-right">Nhập kho (₫)</th>
                  <th className="border border-black p-2 text-right">Xuất kho (₫)</th>
                </tr>
              </thead>
              <tbody>
                {warehouse.breakdown.map((row) => (
                  <tr key={row.time}>
                    <td className="border border-black p-2">{filters.type === "month" ? `Ngày ${row.time}` : `Tháng ${row.time}`}</td>
                    <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(row.import)}</td>
                    <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(row.export)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Print: Nhân sự */}
      <div id="print-admin-hr" className="p-8 text-black text-sm">
        <div className="text-center mb-6">
          <h1 className="text-base font-bold uppercase">Báo cáo nhân sự — {periodLabel}</h1>
          <p className="text-gray-500 mt-0.5 text-xs">Ngày in: {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
        {hr && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Tổng quỹ lương", value: formatCurrencyVnd(hr.summary.totalSalary) },
                { label: "Tổng thưởng", value: formatCurrencyVnd(hr.summary.totalBonus) },
                { label: "Tổng khấu trừ", value: formatCurrencyVnd(hr.summary.totalDeduction) },
                { label: "NV hiện tại", value: `${hr.summary.activeEmployees} người` },
                { label: "Đã nghỉ", value: `${hr.summary.resignedEmployees} người` },
              ].map(({ label, value }) => (
                <div key={label} className="border border-black p-3 text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-bold mt-1">{value}</p>
                </div>
              ))}
            </div>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left">Thời gian</th>
                  <th className="border border-black p-2 text-right">Tổng lương</th>
                  <th className="border border-black p-2 text-right">Thưởng</th>
                  <th className="border border-black p-2 text-right">Khấu trừ</th>
                </tr>
              </thead>
              <tbody>
                {hr.breakdown.map((row) => (
                  <tr key={row.time}>
                    <td className="border border-black p-2">{filters.type === "month" ? `Ngày ${row.time}` : `Tháng ${row.time}`}</td>
                    <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(row.salary)}</td>
                    <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(row.bonus)}</td>
                    <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(row.deduction)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
