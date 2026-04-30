import { useEffect, useMemo } from "react";
import { Printer } from "lucide-react";
import { TableLoadingRow } from "@/components/common/Loading";
import {
  SALARY_STATUS_BADGE,
  DETAIL_TYPE_BADGE,
  WORKING_DAYS_DEFAULT,
} from "@/utils/salary";
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
    const workingDays = salary.workingDays || WORKING_DAYS_DEFAULT;
    const dailyRate = salary.baseSalary / workingDays;
    const workedAmount = dailyRate * salary.actualWorkDays;
    return {
      baseSalary: salary.baseSalary,
      workingDays,
      actualWorkDays: salary.actualWorkDays,
      dailyRate,
      workedAmount,
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
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
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

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Bảng lương của tôi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Xem thông tin lương và thu nhập cá nhân
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {Array.from(
                { length: 4 },
                (_, i) => new Date().getFullYear() - 1 + i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Tất cả tháng</option>
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
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Printer size={16} />
              In phiếu tháng
            </button>

            <button
              onClick={printYearly}
              disabled={mySalaries.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Printer size={16} />
              In lịch sử năm
            </button>
          </div>
        </div>

        {/* Month detail card */}
        {filterMonth !== "ALL" &&
          (salary && breakdown ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Phiếu lương tháng {salary.month}/{salary.year}
                </h2>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  label="Lương cơ bản"
                  value={formatCurrencyVnd(breakdown.baseSalary)}
                  color="blue"
                />
                <SummaryCard
                  label="Ngày công"
                  value={`${breakdown.actualWorkDays}/${breakdown.workingDays} ngày`}
                  color="green"
                />
                <SummaryCard
                  label="Lương Gross"
                  value={formatCurrencyVnd(breakdown.grossSalary)}
                  color="orange"
                />
                <SummaryCard
                  label="Thực lĩnh"
                  value={formatCurrencyVnd(breakdown.netSalary)}
                  color="purple"
                />
              </div>

              {/* Calculation explanation */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1.5">
                <p className="font-semibold text-slate-900">Cách tính lương</p>
                <p>
                  <span className="font-medium">Lương ngày</span> ={" "}
                  {formatCurrencyVnd(breakdown.baseSalary)} ÷{" "}
                  {breakdown.workingDays} ngày ={" "}
                  <span className="font-medium text-slate-900">
                    {formatCurrencyVnd(breakdown.dailyRate)}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Lương Gross</span> ={" "}
                  {formatCurrencyVnd(breakdown.dailyRate)} ×{" "}
                  {breakdown.actualWorkDays} ngày ={" "}
                  <span className="font-medium text-slate-900">
                    {formatCurrencyVnd(breakdown.grossSalary)}
                  </span>
                </p>
                {breakdown.totalBonus > 0 && (
                  <p>
                    <span className="font-medium text-green-700">
                      + Thưởng/Phụ cấp
                    </span>{" "}
                    = {formatCurrencyVnd(breakdown.totalBonus)}
                  </p>
                )}
                {breakdown.totalDeduction > 0 && (
                  <p>
                    <span className="font-medium text-red-700">− Khấu trừ</span>{" "}
                    = {formatCurrencyVnd(breakdown.totalDeduction)}
                  </p>
                )}
                <div className="mt-2 rounded-lg bg-white px-3 py-2 border border-slate-200 font-medium text-slate-900">
                  Thực lĩnh = {formatCurrencyVnd(breakdown.grossSalary)}
                  {breakdown.totalBonus > 0 &&
                    ` + ${formatCurrencyVnd(breakdown.totalBonus)}`}
                  {breakdown.totalDeduction > 0 &&
                    ` − ${formatCurrencyVnd(breakdown.totalDeduction)}`}{" "}
                  ={" "}
                  <span className="text-purple-700">
                    {formatCurrencyVnd(breakdown.netSalary)}
                  </span>
                </div>
              </div>

              {/* Itemized details */}
              {breakdown.details.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Chi tiết các khoản
                  </h3>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                          <th className="px-4 py-2.5 text-left">Loại khoản</th>
                          <th className="px-4 py-2.5 text-right">Số tiền</th>
                          <th className="px-4 py-2.5 text-left">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {breakdown.details.map((d: SalaryDetail) => {
                          const badge =
                            DETAIL_TYPE_BADGE[
                              d.type as keyof typeof DETAIL_TYPE_BADGE
                            ];
                          return (
                            <tr key={d.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge?.color ?? "bg-slate-100 text-slate-700"}`}
                                >
                                  {badge?.label ?? d.type}
                                </span>
                              </td>
                              <td
                                className={`px-4 py-2.5 text-right font-medium tabular-nums ${badge?.isPositive ? "text-green-600" : "text-red-600"}`}
                              >
                                {badge?.isPositive ? "+" : "−"}
                                {formatCurrencyVnd(d.amount)}
                              </td>
                              <td className="px-4 py-2.5 text-gray-400 text-xs">
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
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400">
                Tháng {filterMonth}/{filterYear} chưa có phiếu lương
              </div>
            )
          ))}

        {/* Yearly table — luôn hiển thị đủ các tháng */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Lịch sử lương năm {filterYear}
            </h2>
            {mySalaries.length > 0 && (
              <span className="text-xs text-gray-400">
                {mySalaries.length} tháng có dữ liệu
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Tháng</th>
                  <th className="px-6 py-3 text-right">Lương cơ bản</th>
                  <th className="px-6 py-3 text-right">Gross</th>
                  <th className="px-6 py-3 text-right">Thưởng</th>
                  <th className="px-6 py-3 text-right">Khấu trừ</th>
                  <th className="px-6 py-3 text-right">Thực lĩnh</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <TableLoadingRow colSpan={7} text="Đang tải..." />
                ) : mySalaries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Chưa có dữ liệu lương năm {filterYear}
                    </td>
                  </tr>
                ) : (
                  mySalaries.map((s: Salary) => (
                    <tr
                      key={s.id}
                      onClick={() => setFilterMonth(String(s.month))}
                      className={`cursor-pointer transition-colors ${
                        String(s.month) === filterMonth
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-3 font-medium text-gray-900">
                        Tháng {s.month}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600 tabular-nums">
                        {formatCurrencyVnd(s.baseSalary)}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600 tabular-nums">
                        {formatCurrencyVnd(s.grossSalary)}
                      </td>
                      <td className="px-6 py-3 text-right text-green-600 tabular-nums">
                        {s.totalBonus > 0
                          ? `+${formatCurrencyVnd(s.totalBonus)}`
                          : "—"}
                      </td>
                      <td className="px-6 py-3 text-right text-red-600 tabular-nums">
                        {s.totalDeduction > 0
                          ? `−${formatCurrencyVnd(s.totalDeduction)}`
                          : "—"}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900 tabular-nums">
                        {formatCurrencyVnd(s.netSalary)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
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
                  <tr className="bg-gray-50 font-semibold text-gray-700">
                    <td className="px-6 py-3">Tổng năm</td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      {formatCurrencyVnd(
                        mySalaries.reduce((s, r) => s + r.baseSalary, 0),
                      )}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      {formatCurrencyVnd(
                        mySalaries.reduce((s, r) => s + r.grossSalary, 0),
                      )}
                    </td>
                    <td className="px-6 py-3 text-right text-green-600 tabular-nums">
                      +
                      {formatCurrencyVnd(
                        mySalaries.reduce((s, r) => s + r.totalBonus, 0),
                      )}
                    </td>
                    <td className="px-6 py-3 text-right text-red-600 tabular-nums">
                      −
                      {formatCurrencyVnd(
                        mySalaries.reduce((s, r) => s + r.totalDeduction, 0),
                      )}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900 tabular-nums">
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
  color: "blue" | "green" | "orange" | "purple";
}) {
  const bg = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
  };
  const text = {
    blue: "text-blue-600",
    green: "text-green-700",
    orange: "text-orange-600",
    purple: "text-purple-700",
  };
  return (
    <div className={`rounded-xl p-4 ${bg[color]}`}>
      <p className={`text-xs font-medium mb-1 ${text[color]}`}>{label}</p>
      <p className={`text-lg font-bold ${text[color]}`}>{value}</p>
    </div>
  );
}
