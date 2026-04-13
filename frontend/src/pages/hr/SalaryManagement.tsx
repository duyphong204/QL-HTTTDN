import { DollarSign, Users, CheckCircle2, Calculator, Printer } from "lucide-react"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { PaginationControls } from "@/components/common/PaginationControls"
import { SALARY_STATUS_BADGE, useSalaryPage } from "@/hooks/useSalaryPage"

export default function SalaryManagement() {
  const {
    salaries,
    loadingSalaries,
    month,
    year,
    calculating,
    searchTerm,
    page,
    pagedData,
    meta,
    summary,
    years,
    months,
    setMonth,
    setYear,
    setSearchTerm,
    setPage,
    handleCalculateAll,
    handlePrint,
    formatCurrency,
  } = useSalaryPage()

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <style>{`
        #print-salary-management { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          body.print-salary-management #print-salary-management,
          body.print-salary-management #print-salary-management * {
            visibility: visible !important;
          }
          body.print-salary-management #print-salary-management {
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
              Quản lý lương
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Theo dõi bảng lương nhân viên
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {months.map((m) => (
                <option key={m} value={String(m)}>Tháng {m}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>

            <button
              onClick={handleCalculateAll}
              disabled={calculating}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <Calculator size={16} />
              {calculating ? "Đang tính..." : "Tính lương tháng"}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-700 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Printer size={16} />
              In bảng lương
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Tổng lương" value={summary.total} icon={<DollarSign size={18} />} />
          <StatCard title="Nhân sự" value={summary.count} icon={<Users size={18} />} />
          <StatCard title="Đã thanh toán" value={`${summary.paid}/${summary.count}`} icon={<CheckCircle2 size={18} />} />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo tên nhân viên..."
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nhân viên</th>
                  <th className="px-6 py-4 text-center">Lương cơ bản</th>
                  <th className="px-6 py-4 text-center">Thưởng</th>
                  <th className="px-6 py-4 text-center">Khấu trừ</th>
                  <th className="px-6 py-4 text-center">Thực lĩnh</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loadingSalaries ? (
                  <EmptyRow text="Đang tải dữ liệu..." />
                ) : pagedData.length === 0 ? (
                  <EmptyRow text="Không có dữ liệu bảng lương." />
                ) : (
                  pagedData.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {s.employee?.user?.profile?.fullName || "—"}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {formatCurrency(s.employee?.baseSalary || 0)}
                      </td>
                      <td className="px-6 py-4 text-center text-green-600 font-medium">
                        +{formatCurrency(s.bonus || 0)}
                      </td>
                      <td className="px-6 py-4 text-center text-red-600 font-medium">
                        -{formatCurrency(s.deduction || 0)}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900">
                        {formatCurrency(s.amount || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.color
                          }`}
                        >
                          {SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.label}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            meta={meta}
            currentPage={page}
            isLoading={loadingSalaries}
            totalLabel="Tổng nhân viên"
            onPageChange={setPage}
          />
        </div>
      </div>

      <div id="print-salary-management" className="p-8 text-black text-sm">
        <h2 className="text-xl font-bold text-center mb-2">BẢNG LƯƠNG THÁNG {month}/{year}</h2>
        <p className="text-center mb-6">Công ty QL_HTTTDN</p>
        <table className="w-full border border-black border-collapse">
          <thead>
            <tr>
              <th className="border border-black p-2">Nhân viên</th>
              <th className="border border-black p-2">Lương cơ bản</th>
              <th className="border border-black p-2">Thưởng</th>
              <th className="border border-black p-2">Khấu trừ</th>
              <th className="border border-black p-2">Thực lĩnh</th>
              <th className="border border-black p-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((s) => (
              <tr key={s.id}>
                <td className="border border-black p-2">{s.employee?.user?.profile?.fullName || "-"}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(s.employee?.baseSalary || 0)}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(s.bonus || 0)}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(s.deduction || 0)}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(s.amount || 0)}</td>
                <td className="border border-black p-2 text-center">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-xl font-bold text-gray-900">{value}</span>
      </div>
      <div className="text-blue-600">{icon}</div>
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
        {text}
      </td>
    </tr>
  )
}
