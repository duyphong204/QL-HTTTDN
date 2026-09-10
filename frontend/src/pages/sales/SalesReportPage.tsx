import { useEffect } from "react";
import { BarChart3, Printer } from "lucide-react";
import { ReportFilter, SalesReportSection } from "@/components/charts";
import { useReportStore } from "@/stores/report.store";
import { formatCurrencyVnd, formatReportPeriod } from "@/utils/format";

export default function SalesReportPage() {
  const filters = useReportStore((s) => s.filters);
  const setFilters = useReportStore((s) => s.setFilters);
  const fetchSales = useReportStore((s) => s.fetchSales);
  const loading = useReportStore((s) => s.loadingSales);
  const sales = useReportStore((s) => s.sales);

  useEffect(() => {
    fetchSales();
  }, [fetchSales, filters.type, filters.year, filters.month, filters.quarter]);

  const handlePrint = () => {
    document.body.classList.add("print-sales-report");
    window.print();
    document.body.classList.remove("print-sales-report");
  };

  const periodLabel = formatReportPeriod(filters);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <style>{`
        #print-sales-report { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          body.print-sales-report #print-sales-report,
          body.print-sales-report #print-sales-report * { visibility: visible !important; }
          body.print-sales-report #print-sales-report {
            display: block !important; position: absolute;
            left: 0; top: 0; width: 100%; background: white;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <BarChart3 size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Báo cáo bán hàng
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi doanh thu, lợi nhuận và sản lượng tiêu thụ
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            disabled={!sales || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-700/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-slate-700/30 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
          >
            <Printer size={18} strokeWidth={2.5} /> In báo cáo
          </button>
        </div>

        <ReportFilter
          filters={filters}
          onChange={setFilters}
          loading={loading}
          typeOptions={["month", "quarter", "year"]}
        />

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SalesReportSection />
        </div>
      </div>

      {/* Print section */}
      <div id="print-sales-report" className="p-8 text-black text-sm">
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
                    <td className="border border-black p-2">
                      {filters.type === "month" ? `Ngày ${row.time}` : `Tháng ${row.time}`}
                    </td>
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
    </div>
  );
}
