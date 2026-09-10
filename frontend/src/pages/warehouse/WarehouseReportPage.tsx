import { useEffect } from "react";
import { Warehouse, Printer } from "lucide-react";
import { ReportFilter, WarehouseReportSection } from "@/components/charts";
import { useReportStore } from "@/stores/report.store";
import { formatCurrencyVnd, formatReportPeriod } from "@/utils/format";

export default function WarehouseReportPage() {
  const filters = useReportStore((s) => s.filters);
  const setFilters = useReportStore((s) => s.setFilters);
  const fetchWarehouse = useReportStore((s) => s.fetchWarehouse);
  const loading = useReportStore((s) => s.loadingWarehouse);
  const warehouse = useReportStore((s) => s.warehouse);

  useEffect(() => {
    fetchWarehouse();
  }, [fetchWarehouse, filters.type, filters.year, filters.month, filters.quarter]);

  const handlePrint = () => {
    document.body.classList.add("print-warehouse-report");
    window.print();
    document.body.classList.remove("print-warehouse-report");
  };

  const periodLabel = formatReportPeriod(filters);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <style>{`
        #print-warehouse-report { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          body.print-warehouse-report #print-warehouse-report,
          body.print-warehouse-report #print-warehouse-report * { visibility: visible !important; }
          body.print-warehouse-report #print-warehouse-report {
            display: block !important; position: absolute;
            left: 0; top: 0; width: 100%; background: white;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
              <Warehouse size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Báo cáo kho hàng
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi tình hình nhập, xuất và tồn kho
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            disabled={!warehouse || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-700/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-slate-700/30 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
          >
            <Printer size={18} strokeWidth={2.5} /> In báo cáo
          </button>
        </div>

        <ReportFilter
          filters={filters}
          onChange={setFilters}
          loading={loading}
          typeOptions={["month", "year"]}
        />

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <WarehouseReportSection />
        </div>
      </div>

      {/* Print section */}
      <div id="print-warehouse-report" className="p-8 text-black text-sm">
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
                { label: "Tồn kho hiện tại", value: `${warehouse.summary.totalInventory} sp` },
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
                    <td className="border border-black p-2">
                      {filters.type === "month" ? `Ngày ${row.time}` : `Tháng ${row.time}`}
                    </td>
                    <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(row.import)}</td>
                    <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(row.export)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {warehouse.topProducts?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-bold uppercase mb-2">Top 10 sản phẩm bán chạy</h2>
                <table className="w-full border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-2 text-center w-8">#</th>
                      <th className="border border-black p-2 text-left">Sản phẩm</th>
                      <th className="border border-black p-2 text-right">Số lượng (sp)</th>
                      <th className="border border-black p-2 text-right">Doanh thu (₫)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouse.topProducts.map((p, i) => (
                      <tr key={p.productId}>
                        <td className="border border-black p-2 text-center">{i + 1}</td>
                        <td className="border border-black p-2">{p.productName}</td>
                        <td className="border border-black p-2 text-right tabular-nums">{p.totalQuantity}</td>
                        <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(p.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {warehouse.topCategories?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-bold uppercase mb-2">Top danh mục bán chạy</h2>
                <table className="w-full border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-2 text-center w-8">#</th>
                      <th className="border border-black p-2 text-left">Danh mục</th>
                      <th className="border border-black p-2 text-right">Số lượng (sp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouse.topCategories.map((c, i) => (
                      <tr key={c.categoryId}>
                        <td className="border border-black p-2 text-center">{i + 1}</td>
                        <td className="border border-black p-2">{c.categoryName}</td>
                        <td className="border border-black p-2 text-right tabular-nums">{c.totalQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {warehouse.topSuppliers?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-bold uppercase mb-2">Top nhà cung cấp</h2>
                <table className="w-full border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-2 text-center w-8">#</th>
                      <th className="border border-black p-2 text-left">Nhà cung cấp</th>
                      <th className="border border-black p-2 text-right">Số lượng (sp)</th>
                      <th className="border border-black p-2 text-right">Doanh thu (₫)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouse.topSuppliers.map((s, i) => (
                      <tr key={s.supplierId}>
                        <td className="border border-black p-2 text-center">{i + 1}</td>
                        <td className="border border-black p-2">{s.supplierName}</td>
                        <td className="border border-black p-2 text-right tabular-nums">{s.totalQuantity}</td>
                        <td className="border border-black p-2 text-right tabular-nums">{formatCurrencyVnd(s.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
