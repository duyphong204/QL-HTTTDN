import { useMemo, useState } from 'react'
import { DollarSign, Users, CheckCircle2, Calculator, Printer } from "lucide-react"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { TableLoadingRow } from "@/components/common/Loading"
import { PaginationControls } from "@/components/common/PaginationControls"
import { SALARY_STATUS_BADGE } from "@/utils/salary"
import { useSalary } from "@/hooks/useSalary"
import { formatCurrencyVnd } from "@/utils/format"

export default function SalaryManagement() {
  const {
    salaries,
    isLoadingSalaries,
    salariesFilters,
    calculateAllSalaries,
    approveSalary,
    markAsPaid,
    cancelSalary,
    updateFilters,
    goToPage,
    stats,
  } = useSalary()

  const [searchTerm, setSearchTerm] = useState('')

  // Get current stats
  const currentStats = stats()

  const filteredSalaries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return salaries

    return salaries.filter((salary) => {
      const fullName = salary.employee?.user?.profile?.fullName?.toLowerCase() || ''
      const employeeCode = salary.employee?.code?.toLowerCase() || ''
      return fullName.includes(q) || employeeCode.includes(q)
    })
  }, [salaries, searchTerm])

  const paginatedSalaries = useMemo(() => {
    const start = (salariesFilters.page - 1) * salariesFilters.limit
    return filteredSalaries.slice(start, start + salariesFilters.limit)
  }, [filteredSalaries, salariesFilters.page, salariesFilters.limit])

  const paginationMeta = useMemo(() => ({
    page: salariesFilters.page,
    limit: salariesFilters.limit,
    total: filteredSalaries.length,
    totalPages: Math.max(1, Math.ceil(filteredSalaries.length / salariesFilters.limit)),
  }), [filteredSalaries.length, salariesFilters.page, salariesFilters.limit])

  // Handle filter changes
  const handleMonthChange = (value: string) => {
    updateFilters({ month: parseInt(value) || undefined })
  }

  const handleYearChange = (value: string) => {
    updateFilters({ year: parseInt(value) || undefined })
  }

  // Handle calculate all
  const handleCalculateAll = async () => {
    if (salariesFilters.month && salariesFilters.year) {
      await calculateAllSalaries(salariesFilters.month, salariesFilters.year)
    }
  }

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      {/* Print styles */}
      <style>{`
        #print-salary-management { display: none; }
        @media print {
          body * { visibility: hidden !important }
          #print-salary-management, #print-salary-management * { visibility: visible !important }
          #print-salary-management { display: block !important; position: absolute; left: 0; top: 0; width: 100%; background: white; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý lương</h1>
            <p className="text-sm text-gray-500 mt-1">Theo dõi bảng lương nhân viên</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={salariesFilters.month || ''}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Chọn tháng</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>

            <select
              value={salariesFilters.year || new Date().getFullYear()}
              onChange={(e) => handleYearChange(e.target.value)}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {[2023,2024,2025,2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={handleCalculateAll}
              disabled={isLoadingSalaries}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <Calculator size={16} />
              {isLoadingSalaries ? "Đang tính..." : "Tính lương tháng"}
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

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Tổng lương" value={formatCurrencyVnd(currentStats.total)} icon={<DollarSign size={18} />} />
          <StatCard title="Nhân sự" value={currentStats.count} icon={<Users size={18} />} />
          <StatCard title="Đã thanh toán" value={`${currentStats.paid}/${currentStats.count}`} icon={<CheckCircle2 size={18} />} />
        </div>

        {/* Data Table */}
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
                  <th className="px-6 py-4 text-center">Ngày làm</th>
                  <th className="px-6 py-4 text-center">Thưởng</th>
                  <th className="px-6 py-4 text-center">Khấu trừ</th>
                  <th className="px-6 py-4 text-center">Thực lĩnh</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {isLoadingSalaries ? (
                  <TableLoadingRow colSpan={8} text="Đang tải dữ liệu..." />
                ) : filteredSalaries.length === 0 ? (
                  <EmptyRow text="Không có dữ liệu bảng lương." />
                ) : (
                  paginatedSalaries.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {s.employee?.user?.profile?.fullName || "—"}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {formatCurrencyVnd(s.baseSalary || 0)}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {s.actualWorkDays || 0}/{s.workingDays || 26}
                      </td>
                      <td className="px-6 py-4 text-center text-green-600 font-medium">
                        +{formatCurrencyVnd(s.totalBonus || 0)}
                      </td>
                      <td className="px-6 py-4 text-center text-red-600 font-medium">
                        -{formatCurrencyVnd(s.totalDeduction || 0)}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900">
                        {formatCurrencyVnd(s.netSalary || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.color
                        }`}>
                          {SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.label || s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {s.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => void approveSalary(s.id)}
                                className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => void cancelSalary(s.id)}
                                className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                              >
                                Hủy
                              </button>
                            </>
                          )}
                          {s.status === 'APPROVED' && (
                            <>
                              <button
                                onClick={() => void markAsPaid(s.id)}
                                className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                              >
                                Thanh toán
                              </button>
                              <button
                                onClick={() => void cancelSalary(s.id)}
                                className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                              >
                                Hủy
                              </button>
                            </>
                          )}
                          {(s.status === 'PAID' || s.status === 'CANCELLED') && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            meta={paginationMeta}
            currentPage={salariesFilters.page}
            isLoading={isLoadingSalaries}
            totalLabel="Tổng nhân viên"
            onPageChange={goToPage}
          />
        </div>
      </div>

      {/* Print Section */}
      <div id="print-salary-management" className="p-8 text-black text-sm">
        <h2 className="text-xl font-bold text-center mb-2">
          BẢNG LƯƠNG THÁNG {salariesFilters.month}/{salariesFilters.year}
        </h2>
        <p className="text-center mb-6">Công ty QL_HTTTDN</p>
        <table className="w-full border border-black border-collapse">
          <thead>
            <tr>
              <th className="border border-black p-2">Nhân viên</th>
              <th className="border border-black p-2">Lương cơ bản</th>
              <th className="border border-black p-2">Ngày làm</th>
              <th className="border border-black p-2">Thưởng</th>
              <th className="border border-black p-2">Khấu trừ</th>
              <th className="border border-black p-2">Thực lĩnh</th>
              <th className="border border-black p-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalaries.map((s) => (
              <tr key={s.id}>
                <td className="border border-black p-2">{s.employee?.user?.profile?.fullName || "-"}</td>
                <td className="border border-black p-2 text-right">{formatCurrencyVnd(s.baseSalary || 0)}</td>
                <td className="border border-black p-2 text-center">{s.actualWorkDays || 0}/{s.workingDays || 26}</td>
                <td className="border border-black p-2 text-right">+{formatCurrencyVnd(s.totalBonus || 0)}</td>
                <td className="border border-black p-2 text-right">-{formatCurrencyVnd(s.totalDeduction || 0)}</td>
                <td className="border border-black p-2 text-right">{formatCurrencyVnd(s.netSalary || 0)}</td>
                <td className="border border-black p-2 text-center">{SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.label || s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
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
      <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
        {text}
      </td>
    </tr>
  )
}