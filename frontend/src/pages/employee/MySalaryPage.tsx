import { Printer } from "lucide-react"
import { TableLoadingRow } from "@/components/common/Loading"
import { useMySalary } from "@/hooks/useSalary"
import { SALARY_STATUS_BADGE, DETAIL_TYPE_BADGE } from "@/utils/salary"
import { formatCurrencyVnd } from "@/utils/format"
import type { SalaryDetail } from "@/types/salary.types"

export default function MySalaryPage() {
  const {
    mySalaries,
    isLoadingSalary,
    filterYear,
    setFilterYear,
    filterMonth,
    setFilterMonth,
    monthlySalary,
    printMonthly,
    printYearly,
    salaryBreakdown,
  } = useMySalary()

  const salary = monthlySalary
  const breakdown = salary ? salaryBreakdown(salary) : null

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      {/* Print styles */}
      <style>{`
        #print-monthly, #print-yearly { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          body.print-monthly #print-monthly, body.print-monthly #print-monthly * { visibility: visible !important; }
          body.print-yearly #print-yearly, body.print-yearly #print-yearly * { visibility: visible !important; }
          #print-monthly, #print-yearly { display: block !important; position: absolute; left: 0; top: 0; width: 100%; background: white; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bảng lương của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">Xem thông tin lương và thu nhập</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {[2023, 2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Chọn tháng</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>

            <button
              onClick={printMonthly}
              disabled={filterMonth === 'ALL'}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <Printer size={16} />
              In tháng
            </button>

            <button
              onClick={printYearly}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-700 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Printer size={16} />
              In năm
            </button>
          </div>
        </div>

        {/* Current Month Summary */}
        {salary && breakdown && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Bảng lương tháng {salary.month}/{salary.year}
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 mb-1">Lương cơ bản</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrencyVnd(breakdown.baseSalary)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600 mb-1">Số ngày làm việc</p>
                <p className="text-xl font-bold text-green-700">{breakdown.actualWorkDays}/{breakdown.workingDays}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600 mb-1">Lương Gross</p>
                <p className="text-xl font-bold text-orange-700">{formatCurrencyVnd(breakdown.grossSalary)}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600 mb-1">Thực lĩnh</p>
                <p className="text-xl font-bold text-purple-700">{formatCurrencyVnd(breakdown.netSalary)}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900 mb-2">Cách tính lương</p>
              <p>
                Lương ngày = Lương cơ bản / Số ngày chuẩn = {formatCurrencyVnd(breakdown.baseSalary)} / {breakdown.workingDays} = {formatCurrencyVnd(breakdown.dailyRate)}
              </p>
              <p>
                Lương theo ngày công = Lương ngày x Ngày làm thực tế = {formatCurrencyVnd(breakdown.dailyRate)} x {breakdown.actualWorkDays} = {formatCurrencyVnd(breakdown.workedAmount)}
              </p>
              <p>
                Thực lĩnh = Gross - Khấu trừ = {formatCurrencyVnd(breakdown.grossSalary)} - {formatCurrencyVnd(breakdown.totalDeduction)} = {formatCurrencyVnd(breakdown.netSalary)}
              </p>
            </div>

            {/* Chi tiết lương */}
            {breakdown.details && breakdown.details.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Chi tiết thu nhập/khấu trừ</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">Loại</th>
                      <th className="px-4 py-2 text-right">Số tiền</th>
                      <th className="px-4 py-2 text-left">Mô tả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {breakdown.details.map((detail: SalaryDetail) => (
                      <tr key={detail.id}>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            DETAIL_TYPE_BADGE[detail.type as keyof typeof DETAIL_TYPE_BADGE]?.color
                          }`}>
                            {DETAIL_TYPE_BADGE[detail.type as keyof typeof DETAIL_TYPE_BADGE]?.label || detail.type}
                          </span>
                        </td>
                        <td className={`px-4 py-2 text-right font-medium ${
                          DETAIL_TYPE_BADGE[detail.type as keyof typeof DETAIL_TYPE_BADGE]?.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {DETAIL_TYPE_BADGE[detail.type as keyof typeof DETAIL_TYPE_BADGE]?.isPositive ? '+' : '-'}{formatCurrencyVnd(detail.amount)}
                        </td>
                        <td className="px-4 py-2 text-gray-500">{detail.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Status */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">Trạng thái:</span>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                SALARY_STATUS_BADGE[salary.status as keyof typeof SALARY_STATUS_BADGE]?.color
              }`}>
                {SALARY_STATUS_BADGE[salary.status as keyof typeof SALARY_STATUS_BADGE]?.label}
              </span>
            </div>
          </div>
        )}

        {/* Yearly Table */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử lương năm {filterYear}</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-3">Tháng</th>
                  <th className="px-6 py-3 text-right">Lương cơ bản</th>
                  <th className="px-6 py-3 text-right">Thưởng</th>
                  <th className="px-6 py-3 text-right">Khấu trừ</th>
                  <th className="px-6 py-3 text-right">Thực lĩnh</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingSalary ? (
                  <TableLoadingRow colSpan={6} text="Đang tải..." />
                ) : mySalaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      Chưa có dữ liệu lương
                    </td>
                  </tr>
                ) : mySalaries.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">Tháng {s.month}</td>
                    <td className="px-6 py-3 text-right">{formatCurrencyVnd(s.baseSalary || 0)}</td>
                    <td className="px-6 py-3 text-right text-green-600">+{formatCurrencyVnd(s.totalBonus || 0)}</td>
                    <td className="px-6 py-3 text-right text-red-600">-{formatCurrencyVnd(s.totalDeduction || 0)}</td>
                    <td className="px-6 py-3 text-right font-semibold">{formatCurrencyVnd(s.netSalary || 0)}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.color
                      }`}>
                        {SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Monthly */}
      <div id="print-monthly" className="p-8 text-black">
        {salary && (
          <>
            <h2 className="text-xl font-bold text-center mb-2">BẢNG LƯƠNG THÁNG {salary.month}/{salary.year}</h2>
            <p className="text-center mb-6">Nhân viên: {salary.employee?.user?.profile?.fullName}</p>
            <table className="w-full border border-black border-collapse">
              <tbody>
                <tr>
                  <td className="border border-black p-2">Lương cơ bản</td>
                  <td className="border border-black p-2 text-right">{formatCurrencyVnd(breakdown?.baseSalary || 0)}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">Ngày làm việc</td>
                  <td className="border border-black p-2 text-right">{breakdown?.actualWorkDays}/{breakdown?.workingDays}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">Thưởng/Phụ cấp</td>
                  <td className="border border-black p-2 text-right">+{formatCurrencyVnd(breakdown?.totalBonus || 0)}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">Khấu trừ</td>
                  <td className="border border-black p-2 text-right">-{formatCurrencyVnd(breakdown?.totalDeduction || 0)}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Thực lĩnh</td>
                  <td className="border border-black p-2 text-right font-bold">{formatCurrencyVnd(breakdown?.netSalary || 0)}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Print Yearly */}
      <div id="print-yearly" className="p-8 text-black">
        <h2 className="text-xl font-bold text-center mb-2">BẢNG LƯƠNG NĂM {filterYear}</h2>
        <p className="text-center mb-6">Nhân viên: {mySalaries[0]?.employee?.user?.profile?.fullName || '---'}</p>
        <table className="w-full border border-black border-collapse">
          <thead>
            <tr>
              <th className="border border-black p-2">Tháng</th>
              <th className="border border-black p-2 text-right">Lương cơ bản</th>
              <th className="border border-black p-2 text-right">Thưởng</th>
              <th className="border border-black p-2 text-right">Khấu trừ</th>
              <th className="border border-black p-2 text-right">Thực lĩnh</th>
            </tr>
          </thead>
          <tbody>
            {mySalaries.map((s) => (
              <tr key={s.id}>
                <td className="border border-black p-2">Tháng {s.month}</td>
                <td className="border border-black p-2 text-right">{formatCurrencyVnd(s.baseSalary || 0)}</td>
                <td className="border border-black p-2 text-right">+{formatCurrencyVnd(s.totalBonus || 0)}</td>
                <td className="border border-black p-2 text-right">-{formatCurrencyVnd(s.totalDeduction || 0)}</td>
                <td className="border border-black p-2 text-right">{formatCurrencyVnd(s.netSalary || 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="border border-black p-2 font-bold">Tổng cả năm</td>
              <td className="border border-black p-2 text-right font-bold">{formatCurrencyVnd(mySalaries.reduce((sum, s) => sum + (s.baseSalary || 0), 0))}</td>
              <td className="border border-black p-2 text-right font-bold">+{formatCurrencyVnd(mySalaries.reduce((sum, s) => sum + (s.totalBonus || 0), 0))}</td>
              <td className="border border-black p-2 text-right font-bold">-{formatCurrencyVnd(mySalaries.reduce((sum, s) => sum + (s.totalDeduction || 0), 0))}</td>
              <td className="border border-black p-2 text-right font-bold">{formatCurrencyVnd(mySalaries.reduce((sum, s) => sum + (s.netSalary || 0), 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}