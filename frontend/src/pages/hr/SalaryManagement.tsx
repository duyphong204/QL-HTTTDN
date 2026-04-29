// src/pages/hr/SalaryManagement.tsx
import { useEffect, useMemo, useState } from 'react'
import { DollarSign, Users, CheckCircle2, Calculator, Printer, Plus } from "lucide-react"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { TableLoadingRow } from "@/components/common/Loading"
import { PaginationControls } from "@/components/common/PaginationControls"
import { AppModal } from "@/components/common/AppModal"
import { DETAIL_TYPE_BADGE, SALARY_STATUS_BADGE } from "@/utils/salary"
import { formatCurrencyVnd } from "@/utils/format"
import { useHrSalaryStore } from '@/stores/hrSalary.store'
import { DetailType, type AddSalaryDetailDto, type Salary } from '@/types/salary.types'

export default function SalaryManagement() {
  const {
    salaries,
    fetch,
    calculateAll,
    approve,
    pay,
    month,
    year,
    setFilter,
  } = useHrSalaryStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailSalaryId, setDetailSalaryId] = useState<string | null>(null)
  const [detailForm, setDetailForm] = useState<AddSalaryDetailDto>({
    type: DetailType.BONUS,
    amount: 0,
    description: '',
  })

  // Auto fetch
  useEffect(() => {
    void fetchSalaries()
  }, [fetchSalaries, filters])

  // Stats
  const currentStats = useMemo(() => {
    const total = salaries.reduce((sum: number, s: Salary) => sum + (s.netSalary || 0), 0)
    const paid = salaries.filter((s: Salary) => s.status === 'PAID').length
    const pending = salaries.filter((s: Salary) => s.status === 'PENDING').length
    const approved = salaries.filter((s: Salary) => s.status === 'APPROVED').length

    return {
      total,
      count: salaries.length,
      paid,
      pending,
      approved,
      avgSalary: salaries.length > 0 ? total / salaries.length : 0,
    }
  }, [salaries])

  const filteredSalaries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return salaries

    return salaries.filter((salary: Salary) => {
      const fullName = salary.employee?.user?.profile?.fullName?.toLowerCase() || ''
      const employeeCode = salary.employee?.code?.toLowerCase() || ''
      return fullName.includes(q) || employeeCode.includes(q)
    })
  }, [salaries, searchTerm])

  const paginatedSalaries = useMemo(() => {
    const start = (filters.page - 1) * filters.limit
    return filteredSalaries.slice(start, start + filters.limit)
  }, [filteredSalaries, filters.page, filters.limit])

  const paginationMeta = useMemo(() => ({
    page: filters.page,
    limit: filters.limit,
    total: filteredSalaries.length,
    totalPages: Math.max(1, Math.ceil(filteredSalaries.length / filters.limit)),
  }), [filteredSalaries.length, filters.page, filters.limit])

  const handleMonthChange = (value: string) => {
    setFilters({ month: value ? parseInt(value) : undefined, page: 1 })
  }

  const handleYearChange = (value: string) => {
    setFilters({ year: parseInt(value) || undefined, page: 1 })
  }

  const handleCalculateAll = async () => {
    if (filters.month && filters.year) {
      await calculateAllSalaries(filters.month, filters.year)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  const openDetailModal = (salaryId: string) => {
    setDetailSalaryId(salaryId)
    setDetailForm({ type: DetailType.BONUS, amount: 0, description: '' })
    setDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setDetailModalOpen(false)
    setDetailSalaryId(null)
  }

  const submitDetail = async () => {
    if (!detailSalaryId || detailForm.amount <= 0) return
    await addSalaryDetail(detailSalaryId, detailForm)
    closeDetailModal()
  }

  return (
    <>
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
              value={filters.month || ''}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Chọn tháng</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>

            <select
              value={filters.year || new Date().getFullYear()}
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
                  <th className="px-6 py-4">Chi tiết</th>
                  <th className="px-6 py-4 text-center">Thực lĩnh</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {isLoadingSalaries ? (
                  <TableLoadingRow colSpan={9} text="Đang tải dữ liệu..." />
                ) : filteredSalaries.length === 0 ? (
                  <EmptyRow text="Không có dữ liệu bảng lương." />
                ) : (
                  paginatedSalaries.map((s: Salary) => (
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
                      <td className="px-6 py-4">
                        {s.details && s.details.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {s.details.map((detail) => {
                              const badge = DETAIL_TYPE_BADGE[detail.type as keyof typeof DETAIL_TYPE_BADGE]
                              const sign = badge?.isPositive ? '+' : '-'
                              return (
                                <span
                                  key={detail.id}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge?.color ?? 'bg-slate-100 text-slate-700'}`}
                                  title={detail.description || ''}
                                >
                                  {badge?.label ?? detail.type}
                                  <span className="text-[11px] font-semibold">{sign}{formatCurrencyVnd(detail.amount)}</span>
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
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
                          {s.status !== 'CANCELLED' && (
                            <button
                              onClick={() => openDetailModal(s.id)}
                              className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <span className="inline-flex items-center gap-1">
                                <Plus size={12} /> Chi tiết
                              </span>
                            </button>
                          )}
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
            currentPage={filters.page}
            isLoading={isLoadingSalaries}
            totalLabel="Tổng nhân viên"
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Print Section */}
      <div id="print-salary-management" className="p-8 text-black text-sm">
        <h2 className="text-xl font-bold text-center mb-2">
          BẢNG LƯƠNG THÁNG {filters.month}/{filters.year}
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
            {filteredSalaries.map((s: Salary) => (
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

    <AppModal
      isOpen={detailModalOpen}
      onClose={closeDetailModal}
      title="Thêm chi tiết lương"
      maxWidthClassName="max-w-md"
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
          <select
            value={detailForm.type}
            onChange={(e) => setDetailForm({ ...detailForm, type: e.target.value as DetailType })}
            className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white"
          >
            {Object.values(DetailType).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền</label>
          <input
            type="number"
            min={1}
            value={detailForm.amount}
            onChange={(e) => setDetailForm({ ...detailForm, amount: Number(e.target.value) })}
            className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
          <input
            type="text"
            value={detailForm.description ?? ''}
            onChange={(e) => setDetailForm({ ...detailForm, description: e.target.value })}
            className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={closeDetailModal}
            className="px-4 py-2 text-sm text-gray-600"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={submitDetail}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg"
          >
            Lưu
          </button>
        </div>
      </div>
    </AppModal>
    </>
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
      <td colSpan={9} className="px-6 py-10 text-center text-gray-400">
        {text}
      </td>
    </tr>
  )
}