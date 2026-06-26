import { useEffect, useMemo } from "react";
import { Printer, Banknote } from "lucide-react";
import { TableLoadingRow } from "@/components/common/Loading";
import { SALARY_STATUS_BADGE, DETAIL_TYPE_BADGE } from "@/utils/salary";
import { formatCurrencyVnd } from "@/utils/format";
import type { SalaryDetail } from "@/types/salary.types";
import { useMySalaryStore } from "@/stores/Salary.store";
import type { Salary } from "@/types/salary.types";

export default function MySalaryPage() {
  const {
    mySalaries,
    isLoading,
    filterYear,
    setFilterYear,
    filterMonth,
    setFilterMonth,
    fetchMySalaries,
  } = useMySalaryStore();

  // Chỉ refetch khi năm thay đổi — month chỉ dùng cho UI
  useEffect(() => {
    void fetchMySalaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear]);

  const salary = useMemo(() => {
    if (filterMonth === "ALL") return null;
    const m = Number(filterMonth);
    return (
      mySalaries.find((s) => s.month === m && s.year === Number(filterYear)) ??
      null
    );
  }, [mySalaries, filterMonth, filterYear]);

  const breakdown = useMemo(() => {
    if (!salary) return null;
    const dailyRate = salary.baseSalary / salary.workingDays;
    return {
      baseSalary: salary.baseSalary,
      workingDays: salary.workingDays,
      actualWorkDays: salary.actualWorkDays,
      unpaidDays: salary.unpaidDays ?? 0,
      dailyRate,
      grossSalary: salary.grossSalary,
      totalBonus: salary.totalBonus,
      totalDeduction: salary.totalDeduction,
      netSalary: salary.netSalary,
      details: salary.details ?? [],
    };
  }, [salary]);

  const printMonthly = () => {
    if (filterMonth === "ALL") return;
    document.body.classList.add("print-monthly");
    window.print();
    document.body.classList.remove("print-monthly");
  };

  const printYearly = () => {
    document.body.classList.add("print-yearly");
    window.print();
    document.body.classList.remove("print-yearly");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 animate-in fade-in duration-500">
      <style>{`
        #print-monthly, #print-yearly { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          body.print-monthly #print-monthly,
          body.print-monthly #print-monthly * { visibility: visible !important; }
          body.print-yearly #print-yearly,
          body.print-yearly #print-yearly * { visibility: visible !important; }
          #print-monthly, #print-yearly {
            display: block !important;
            position: absolute; left: 0; top: 0;
            width: 100%; background: white;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-600/20">
              <Banknote size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Bảng lương của tôi
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Xem thông tin lương và thu nhập cá nhân chi tiết
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-11 min-w-[100px] px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 cursor-pointer transition-all"
            >
              {Array.from(
                { length: 4 },
                (_, i) => new Date().getFullYear() - 1 + i,
              ).map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-11 min-w-[130px] px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 cursor-pointer transition-all"
            >
              <option value="ALL">Tất cả các tháng</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>

            <button
              onClick={printMonthly}
              disabled={filterMonth === "ALL" || !salary}
              title={
                filterMonth === "ALL" ? "Chọn một tháng để in phiếu lương" : ""
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              <Printer size={18} strokeWidth={2.5} />
              In tháng
            </button>

            <button
              onClick={printYearly}
              disabled={mySalaries.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-slate-700 text-white shadow-lg shadow-slate-700/20 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              <Printer size={18} strokeWidth={2.5} />
              In cả năm
            </button>
          </div>
        </div>

        {/* Month detail card */}
        {filterMonth !== "ALL" &&
          (salary && breakdown ? (
            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">
                  Phiếu lương tháng {salary.month}/{salary.year}
                </h2>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                    SALARY_STATUS_BADGE[
                      salary.status as keyof typeof SALARY_STATUS_BADGE
                    ]?.color
                  }`}
                >
                  {
                    SALARY_STATUS_BADGE[
                      salary.status as keyof typeof SALARY_STATUS_BADGE
                    ]?.label
                  }
                </span>
              </div>

              {/* Summary cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  label="Lương cơ bản"
                  value={formatCurrencyVnd(breakdown.baseSalary)}
                  color="blue"
                />
                <SummaryCard
                  label="Ngày công"
                  value={`${breakdown.actualWorkDays}/${breakdown.workingDays} ngày`}
                  color="emerald"
                />
                <SummaryCard
                  label="Lương Gross"
                  value={formatCurrencyVnd(breakdown.grossSalary)}
                  color="amber"
                />
                <SummaryCard
                  label="Thực lĩnh"
                  value={formatCurrencyVnd(breakdown.netSalary)}
                  color="purple"
                />
              </div>

              {/* Calculation explanation */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 text-sm text-gray-700 space-y-2.5">
                <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-3">Diễn giải cách tính</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <p className="flex justify-between items-center bg-white px-3 py-2 rounded border border-gray-100 shadow-sm">
                      <span className="font-medium text-gray-600">Lương ngày:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrencyVnd(breakdown.baseSalary)} ÷ {breakdown.workingDays} = {formatCurrencyVnd(breakdown.dailyRate)}
                      </span>
                    </p>
                    <p className="flex justify-between items-center bg-white px-3 py-2 rounded border border-gray-100 shadow-sm">
                      <span className="font-medium text-gray-600">Lương Gross:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrencyVnd(breakdown.dailyRate)} × {breakdown.actualWorkDays} = {formatCurrencyVnd(breakdown.grossSalary)}
                      </span>
                    </p>
                    {breakdown.unpaidDays > 0 && (
                      <p className="flex justify-between items-center bg-orange-50 px-3 py-2 rounded border border-orange-100 shadow-sm">
                        <span className="font-medium text-orange-700">Nghỉ không lương:</span>
                        <span className="font-bold text-orange-800">
                          {breakdown.unpaidDays} ngày
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {breakdown.totalBonus > 0 && (
                      <p className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded border border-emerald-100 shadow-sm">
                        <span className="font-medium text-emerald-700">+ Tổng thưởng:</span>
                        <span className="font-bold text-emerald-800 tabular-nums">
                          {formatCurrencyVnd(breakdown.totalBonus)}
                        </span>
                      </p>
                    )}
                    {breakdown.totalDeduction > 0 && (
                      <p className="flex justify-between items-center bg-red-50 px-3 py-2 rounded border border-red-100 shadow-sm">
                        <span className="font-medium text-red-700">− Khấu trừ:</span>
                        <span className="font-bold text-red-800 tabular-nums">
                          {formatCurrencyVnd(breakdown.totalDeduction)}
                        </span>
                      </p>
                    )}
                    <div className="flex justify-between items-center bg-purple-100 px-4 py-3 rounded-xl border border-purple-200 shadow-sm">
                      <span className="font-bold text-purple-900 uppercase tracking-wider text-xs">Thực lĩnh:</span>
                      <span className="font-black text-purple-800 text-lg tabular-nums">
                        {formatCurrencyVnd(breakdown.netSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized details */}
              {breakdown.details.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Chi tiết các khoản thưởng & phạt
                  </h3>
                  <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-sm whitespace-nowrap text-left">
                      <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Loại khoản</th>
                          <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-right">Số tiền</th>
                          <th className="px-6 py-4 uppercase tracking-wider text-[11px] w-1/2">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {breakdown.details.map((d: SalaryDetail) => {
                          const badge =
                            DETAIL_TYPE_BADGE[
                              d.type as keyof typeof DETAIL_TYPE_BADGE
                            ];
                          return (
                            <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-sm ${badge?.color ?? "bg-slate-50 text-slate-700 border-slate-200"}`}
                                >
                                  {badge?.label ?? d.type}
                                </span>
                              </td>
                              <td
                                className={`px-6 py-4 text-right font-bold tabular-nums text-base ${badge?.isPositive ? "text-emerald-600" : "text-red-600"}`}
                              >
                                {badge?.isPositive ? "+" : "−"}
                                {formatCurrencyVnd(d.amount)}
                              </td>
                              <td className="px-6 py-4 text-gray-500 font-medium whitespace-normal break-words">
                                {d.description || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            !isLoading && (
              <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm p-16 text-center text-gray-500">
                <span className="text-5xl block mb-4">📄</span>
                <p className="font-semibold text-lg">Chưa có phiếu lương tháng {filterMonth}/{filterYear}</p>
                <p className="text-sm mt-1">Hệ thống chưa tạo dữ liệu lương cho tháng này.</p>
              </div>
            )
          ))}

        {/* Yearly table — luôn hiển thị đủ các tháng */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Lịch sử lương năm {filterYear}
            </h2>
            {mySalaries.length > 0 && (
              <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded uppercase tracking-wider">
                {mySalaries.length} tháng
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Tháng</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-right">Lương cơ bản</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-right">Gross</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-right">Thưởng</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-right">Khấu trừ</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-right">Thực lĩnh</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 bg-white">
                {isLoading ? (
                  <TableLoadingRow colSpan={7} text="Đang tải..." />
                ) : mySalaries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-gray-400 font-medium"
                    >
                      Bạn chưa có dữ liệu lương năm {filterYear}.
                    </td>
                  </tr>
                ) : (
                  mySalaries.map((s: Salary) => (
                    <tr
                      key={s.id}
                      onClick={() => setFilterMonth(String(s.month))}
                      className={`cursor-pointer transition-all group border-b border-gray-50 last:border-0 ${
                        String(s.month) === filterMonth
                          ? "bg-purple-50/60"
                          : "hover:bg-blue-50/40"
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">
                        Tháng {s.month}
                        <span className="block text-[10px] text-gray-400 font-medium mt-0.5">Năm {s.year}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600 font-medium tabular-nums">
                        {formatCurrencyVnd(s.baseSalary)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600 font-medium tabular-nums">
                        {formatCurrencyVnd(s.grossSalary)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600 tabular-nums">
                        {s.totalBonus > 0
                          ? `+${formatCurrencyVnd(s.totalBonus)}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-red-600 tabular-nums">
                        {s.totalDeduction > 0
                          ? `−${formatCurrencyVnd(s.totalDeduction)}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 tabular-nums text-base">
                        {formatCurrencyVnd(s.netSalary)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm ${
                            SALARY_STATUS_BADGE[
                              s.status as keyof typeof SALARY_STATUS_BADGE
                            ]?.color
                          }`}
                        >
                          {
                            SALARY_STATUS_BADGE[
                              s.status as keyof typeof SALARY_STATUS_BADGE
                            ]?.label
                          }
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {mySalaries.length > 1 && (
                <tfoot>
                  <tr className="bg-purple-50/50 font-bold border-t border-purple-100">
                    <td className="px-6 py-4 text-purple-900 uppercase tracking-wider text-[11px]">Tổng năm</td>
                    <td className="px-6 py-4 text-right tabular-nums text-purple-900">
                      {formatCurrencyVnd(
                        mySalaries.reduce((s, r) => s + r.baseSalary, 0),
                      )}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-purple-900">
                      {formatCurrencyVnd(
                        mySalaries.reduce((s, r) => s + r.grossSalary, 0),
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-700 tabular-nums">
                      +
                      {formatCurrencyVnd(
                        mySalaries.reduce((s, r) => s + r.totalBonus, 0),
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-red-700 tabular-nums">
                      −
                      {formatCurrencyVnd(
                        mySalaries.reduce((s, r) => s + r.totalDeduction, 0),
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-purple-900 tabular-nums text-lg">
                      {formatCurrencyVnd(
                        mySalaries.reduce((s, r) => s + r.netSalary, 0),
                      )}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* ===== PRINT: PHIẾU LƯƠNG THÁNG ===== */}
      <div id="print-monthly" className="p-10 text-black text-sm">
        {salary && breakdown && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold uppercase">
                Phiếu lương tháng {salary.month}/{salary.year}
              </h1>
              <p className="text-gray-600 mt-1">
                Nhân viên:{" "}
                <strong>
                  {salary.employee?.user?.profile?.fullName ?? "—"}
                </strong>
              </p>
            </div>

            {/* Thông tin cơ bản */}
            <table className="w-full border border-black border-collapse mb-4">
              <tbody>
                <tr>
                  <td className="border border-black p-2 w-1/2 font-medium bg-gray-50">
                    Lương cơ bản
                  </td>
                  <td className="border border-black p-2 text-right tabular-nums">
                    {formatCurrencyVnd(breakdown.baseSalary)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-medium bg-gray-50">
                    Số ngày làm việc / Ngày chuẩn
                  </td>
                  <td className="border border-black p-2 text-right">
                    {breakdown.actualWorkDays} / {breakdown.workingDays} ngày
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-medium bg-gray-50">
                    Lương ngày
                  </td>
                  <td className="border border-black p-2 text-right tabular-nums">
                    {formatCurrencyVnd(breakdown.dailyRate)}
                  </td>
                </tr>
                {breakdown.unpaidDays > 0 && (
                  <tr>
                    <td className="border border-black p-2 font-medium bg-gray-50">
                      Ngày nghỉ không lương
                    </td>
                    <td className="border border-black p-2 text-right">
                      {breakdown.unpaidDays} ngày
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="border border-black p-2 font-medium bg-gray-50">
                    Lương Gross (theo ngày công)
                  </td>
                  <td className="border border-black p-2 text-right tabular-nums">
                    {formatCurrencyVnd(breakdown.grossSalary)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Chi tiết các khoản */}
            {breakdown.details.length > 0 && (
              <>
                <p className="font-semibold mb-1">Chi tiết các khoản:</p>
                <table className="w-full border border-black border-collapse mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-2 text-left">
                        Loại
                      </th>
                      <th className="border border-black p-2 text-right">
                        Số tiền
                      </th>
                      <th className="border border-black p-2 text-left">
                        Ghi chú
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.details.map((d: SalaryDetail) => {
                      const badge =
                        DETAIL_TYPE_BADGE[
                          d.type as keyof typeof DETAIL_TYPE_BADGE
                        ];
                      return (
                        <tr key={d.id}>
                          <td className="border border-black p-2">
                            {badge?.label ?? d.type}
                          </td>
                          <td className="border border-black p-2 text-right tabular-nums">
                            {badge?.isPositive ? "+" : "−"}
                            {formatCurrencyVnd(d.amount)}
                          </td>
                          <td className="border border-black p-2 text-gray-500">
                            {d.description || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            {/* Tổng kết */}
            <table className="w-full border border-black border-collapse">
              <tbody>
                {breakdown.totalBonus > 0 && (
                  <tr>
                    <td className="border border-black p-2 font-medium bg-gray-50">
                      Tổng thưởng/phụ cấp
                    </td>
                    <td className="border border-black p-2 text-right text-green-700 tabular-nums">
                      +{formatCurrencyVnd(breakdown.totalBonus)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="border border-black p-2 font-medium bg-gray-50">
                    Tổng khấu trừ
                  </td>
                  <td className="border border-black p-2 text-right text-red-700 tabular-nums">
                    −{formatCurrencyVnd(breakdown.totalDeduction)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold text-base bg-gray-100">
                    THỰC LĨNH
                  </td>
                  <td className="border border-black p-2 text-right font-bold text-base tabular-nums">
                    {formatCurrencyVnd(breakdown.netSalary)}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="mt-3 text-xs text-gray-500">
              Trạng thái:{" "}
              <strong>
                {
                  SALARY_STATUS_BADGE[
                    salary.status as keyof typeof SALARY_STATUS_BADGE
                  ]?.label
                }
              </strong>
              {salary.paidAt &&
                ` — Ngày thanh toán: ${new Date(salary.paidAt).toLocaleDateString("vi-VN")}`}
            </p>
          </>
        )}
      </div>

      {/* ===== PRINT: LỊCH SỬ LƯƠNG NĂM ===== */}
      <div id="print-yearly" className="p-10 text-black text-sm">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold uppercase">
            Lịch sử lương năm {filterYear}
          </h1>
          <p className="text-gray-600 mt-1">
            Nhân viên:{" "}
            <strong>
              {mySalaries[0]?.employee?.user?.profile?.fullName ?? "—"}
            </strong>
          </p>
        </div>

        <table className="w-full border border-black border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left">Tháng</th>
              <th className="border border-black p-2 text-right">
                Lương cơ bản
              </th>
              <th className="border border-black p-2 text-center">Ngày công</th>
              <th className="border border-black p-2 text-right">Gross</th>
              <th className="border border-black p-2 text-right">Thưởng</th>
              <th className="border border-black p-2 text-right">Khấu trừ</th>
              <th className="border border-black p-2 text-right">Thực lĩnh</th>
              <th className="border border-black p-2 text-center">TT</th>
            </tr>
          </thead>
          <tbody>
            {mySalaries.map((s: Salary) => (
              <tr key={s.id}>
                <td className="border border-black p-2">Tháng {s.month}</td>
                <td className="border border-black p-2 text-right tabular-nums">
                  {formatCurrencyVnd(s.baseSalary)}
                </td>
                <td className="border border-black p-2 text-center">
                  {s.actualWorkDays}/{s.workingDays}
                </td>
                <td className="border border-black p-2 text-right tabular-nums">
                  {formatCurrencyVnd(s.grossSalary)}
                </td>
                <td className="border border-black p-2 text-right tabular-nums">
                  {s.totalBonus > 0
                    ? `+${formatCurrencyVnd(s.totalBonus)}`
                    : "—"}
                </td>
                <td className="border border-black p-2 text-right tabular-nums">
                  {s.totalDeduction > 0
                    ? `−${formatCurrencyVnd(s.totalDeduction)}`
                    : "—"}
                </td>
                <td className="border border-black p-2 text-right font-semibold tabular-nums">
                  {formatCurrencyVnd(s.netSalary)}
                </td>
                <td className="border border-black p-2 text-center text-xs">
                  {
                    SALARY_STATUS_BADGE[
                      s.status as keyof typeof SALARY_STATUS_BADGE
                    ]?.label
                  }
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-100">
              <td className="border border-black p-2">Tổng cả năm</td>
              <td className="border border-black p-2 text-right tabular-nums">
                {formatCurrencyVnd(
                  mySalaries.reduce((s, r) => s + r.baseSalary, 0),
                )}
              </td>
              <td className="border border-black p-2 text-center">—</td>
              <td className="border border-black p-2 text-right tabular-nums">
                {formatCurrencyVnd(
                  mySalaries.reduce((s, r) => s + r.grossSalary, 0),
                )}
              </td>
              <td className="border border-black p-2 text-right tabular-nums">
                +
                {formatCurrencyVnd(
                  mySalaries.reduce((s, r) => s + r.totalBonus, 0),
                )}
              </td>
              <td className="border border-black p-2 text-right tabular-nums">
                −
                {formatCurrencyVnd(
                  mySalaries.reduce((s, r) => s + r.totalDeduction, 0),
                )}
              </td>
              <td className="border border-black p-2 text-right tabular-nums">
                {formatCurrencyVnd(
                  mySalaries.reduce((s, r) => s + r.netSalary, 0),
                )}
              </td>
              <td className="border border-black p-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "blue" | "emerald" | "amber" | "purple";
}) {
  const styles = {
    blue: "bg-blue-50/50 border-blue-100 text-blue-700",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50/50 border-amber-100 text-amber-700",
    purple: "bg-purple-50/50 border-purple-100 text-purple-700",
  };
  return (
    <div className={`rounded-xl p-5 border shadow-sm ${styles[color]}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">{label}</p>
      <p className="text-xl font-black tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
