import { useEffect } from "react";
import { Users, Printer } from "lucide-react";
import { HrReportSection, ReportFilter } from "@/components/charts";
import { useReportStore } from "@/stores/report.store";
import { formatCurrencyVnd, formatReportPeriod } from "@/utils/format";

export default function HrReportPage() {
  const filters = useReportStore((s) => s.filters);
  const setFilters = useReportStore((s) => s.setFilters);
  const fetchHr = useReportStore((s) => s.fetchHr);
  const loading = useReportStore((s) => s.loadingHr);
  const hr = useReportStore((s) => s.hr);

  useEffect(() => {
    fetchHr();
  }, [fetchHr, filters.type, filters.year, filters.month, filters.quarter]);

  const handlePrint = () => {
    document.body.classList.add("print-hr-report");
    window.print();
    document.body.classList.remove("print-hr-report");
  };

  const periodLabel = formatReportPeriod(filters);

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <style>{`
        #print-hr-report { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          body.print-hr-report #print-hr-report,
          body.print-hr-report #print-hr-report * { visibility: visible !important; }
          body.print-hr-report #print-hr-report {
            display: block !important; position: absolute;
            left: 0; top: 0; width: 100%; background: white;
          }
        }
      `}</style>

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

          <button
            onClick={handlePrint}
            disabled={!hr || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Printer size={16} /> In báo cáo
          </button>
        </div>

        <ReportFilter
          filters={filters}
          onChange={setFilters}
          loading={loading}
          typeOptions={["month", "year"]}
        />

        <HrReportSection />
      </div>

      {/* Print section */}
      <div id="print-hr-report" className="p-8 text-black text-sm">
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
                { label: "Nhân viên hiện tại", value: `${hr.summary.activeEmployees} người` },
                { label: "Đã nghỉ việc", value: `${hr.summary.resignedEmployees} người` },
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
                    <td className="border border-black p-2">
                      {filters.type === "month" ? `Ngày ${row.time}` : `Tháng ${row.time}`}
                    </td>
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
