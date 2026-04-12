import { useSalaryManagement } from "@/hooks/useSalaryManagement"
import { Printer } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MySalaryPage() {
  const {
    mySalaries,
    myProfile,
    isLoadingSalary,
    monthlySalary,
    yearlySummary,
    filterYear,
    setFilterYear,
    filterMonth,
    setFilterMonth,
    printMonthly,
    printYearly,
    YEARS,
    MONTHS,
    formatCurrency,
  } = useSalaryManagement()

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
          body.print-monthly #print-monthly,
          body.print-yearly #print-yearly {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Bảng lương của tôi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Xem bảng lương theo tháng / năm
            </p>
          </div>

          <div className="flex gap-2">
            {filterMonth !== "ALL" && (
              <button
                onClick={printMonthly}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
              >
                <Printer size={18} />
                In tháng
              </button>
            )}
            <button
              onClick={printYearly}
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
            >
              <Printer size={18} />
              In năm
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  Năm {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Cả năm</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  Tháng {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Tên nhân viên</th>
                  <th className="px-6 py-4">Tháng</th>
                  <th className="px-6 py-4">Năm</th>
                  <th className="px-6 py-4">Lương cơ bản</th>
                  <th className="px-6 py-4">Thưởng</th>
                  <th className="px-6 py-4">Khấu trừ</th>
                  <th className="px-6 py-4">Thực lĩnh</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingSalary ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                      Đang tải bảng lương...
                    </td>
                  </tr>
                ) : mySalaries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                      Không có dữ liệu bảng lương.
                    </td>
                  </tr>
                ) : (
                  mySalaries.map((salary) => (
                    <tr key={salary.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {salary.employee?.user?.profile?.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{salary.month}</td>
                      <td className="px-6 py-4 text-gray-600">{salary.year}</td>
                      <td className="px-6 py-4 text-gray-600">{formatCurrency(salary.employee?.baseSalary || 0)}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">+ {formatCurrency(salary.bonus)}</td>
                      <td className="px-6 py-4 text-red-600 font-medium">- {formatCurrency(salary.deduction)}</td>
                      <td className="px-6 py-4 font-bold text-blue-700">{formatCurrency(salary.amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            salary.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {salary.status === "PAID" ? "Đã nhận lương" : "Chưa thanh toán"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="print-monthly" className="p-8 text-black text-sm">
        <h2 className="text-xl font-bold text-center mb-2">PHIẾU LƯƠNG THÁNG</h2>
        <p className="text-center mb-6">Công ty QL_HTTTDN</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <p><strong>Họ tên:</strong> {myProfile?.user?.profile?.fullName || "-"}</p>
          <p><strong>Mã nhân viên:</strong> {myProfile?.code || "-"}</p>
          <p><strong>Tháng/Năm:</strong> {filterMonth}/{filterYear}</p>
          <p><strong>Phòng ban:</strong> {myProfile?.department || "-"}</p>
        </div>

        <table className="w-full border border-black border-collapse mb-4">
          <thead>
            <tr>
              <th className="border border-black p-2">Lương cơ bản</th>
              <th className="border border-black p-2">Thưởng</th>
              <th className="border border-black p-2">Khấu trừ</th>
              <th className="border border-black p-2">Thực lĩnh</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-right">{formatCurrency(monthlySalary?.employee?.baseSalary || 0)}</td>
              <td className="border border-black p-2 text-right">{formatCurrency(monthlySalary?.bonus || 0)}</td>
              <td className="border border-black p-2 text-right">{formatCurrency(monthlySalary?.deduction || 0)}</td>
              <td className="border border-black p-2 text-right font-bold">{formatCurrency(monthlySalary?.amount || 0)}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-2">
          Công thức: Lương CB + Thưởng - Khấu trừ = Thực lĩnh
        </p>
      </div>

      <div id="print-yearly" className="p-8 text-black text-sm">
        <h2 className="text-xl font-bold text-center mb-2">BẢNG TỔNG HỢP LƯƠNG NĂM {filterYear}</h2>
        <p className="text-center mb-6">Công ty QL_HTTTDN</p>

        <table className="w-full border border-black border-collapse mb-4">
          <thead>
            <tr>
              <th className="border border-black p-2">Tháng</th>
              <th className="border border-black p-2">Lương cơ bản</th>
              <th className="border border-black p-2">Thưởng</th>
              <th className="border border-black p-2">Khấu trừ</th>
              <th className="border border-black p-2">Thực lĩnh</th>
            </tr>
          </thead>
          <tbody>
            {yearlySummary.rows.map((r) => (
              <tr key={r.month}>
                <td className="border border-black p-2 text-center">{r.month}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(r.baseSalary)}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(r.bonus)}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(r.deduction)}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(r.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="border border-black p-2 font-bold text-center">Tổng</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2 text-right font-bold">{formatCurrency(yearlySummary.totalBonus)}</td>
              <td className="border border-black p-2 text-right font-bold">{formatCurrency(yearlySummary.totalDeduction)}</td>
              <td className="border border-black p-2 text-right font-bold">{formatCurrency(yearlySummary.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
