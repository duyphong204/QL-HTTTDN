import { useEffect, useState, useCallback, useMemo } from "react";
import {
  DollarSign,
  Users,
  CheckCircle2,
  Calculator,
  Printer,
  Plus
} from "lucide-react";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { TableLoadingRow } from "@/components/common/Loading";
import { PaginationControls } from "@/components/common/PaginationControls";
import { AppModal } from "@/components/common/AppModal";
import { DETAIL_TYPE_BADGE, SALARY_STATUS_BADGE } from "@/utils/salary";
import { formatCurrencyVnd } from "@/utils/format";
import { useHrSalaryStore } from "@/stores/hrSalary.store";
import {
  DetailType,
  type AddSalaryDetailDto
} from "@/types/salary.types";

export default function SalaryManagement() {
  const {
    salaries,
    total,
    isLoading,
    isCalculating,
    filters,
    setFilters,
    fetch,
    calculateAll,
    approve,
    pay,
    addDetail,
    statistics,
    isLoadingStats,
    fetchStatistics,
  } = useHrSalaryStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailSalaryId, setDetailSalaryId] = useState<string | null>(null);
  const [detailForm, setDetailForm] = useState<AddSalaryDetailDto>({
    type: DetailType.BONUS,
    amount: 0,
    description: "",
  });

  // Fetch dữ liệu khi filter thay đổi
  useEffect(() => {
    fetch();
  }, [fetch, filters.page, filters.month, filters.year, filters.status, filters.employeeId]);

  // Fetch thống kê
  useEffect(() => {
    const year = filters.year ?? new Date().getFullYear();
    fetchStatistics(year, filters.month);
  }, [fetchStatistics, filters.year, filters.month]);

  const paginationMeta = useMemo(() => ({
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  }), [filters.page, filters.limit, total]);

  const handleCalculateAll = async () => {
    const month = filters.month ?? new Date().getMonth() + 1;
    const year = filters.year ?? new Date().getFullYear();
    await calculateAll(month, year);
  };

  const handleSearch = useCallback((val: string) => {
    setSearchTerm(val);
    setFilters({ search: val || undefined, page: 1 });
  }, [setFilters]);

  const openDetailModal = (salaryId: string) => {
    setDetailSalaryId(salaryId);
    setDetailForm({ type: DetailType.BONUS, amount: 0, description: "" });
    setDetailModalOpen(true);
  };

  const submitDetail = async () => {
    if (!detailSalaryId || detailForm.amount <= 0) return;
    await addDetail(detailSalaryId, detailForm);
    setDetailModalOpen(false);
  };

  const handlePrint = () => {
    document.body.classList.add("print-salary-mgmt");
    window.print();
    document.body.classList.remove("print-salary-mgmt");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <style>{`
        #print-salary-management { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          body.print-salary-mgmt #print-salary-management,
          body.print-salary-mgmt #print-salary-management * { visibility: visible !important; }
          body.print-salary-mgmt #print-salary-management {
            display: block !important; position: absolute;
            left: 0; top: 0; width: 100%; background: white;
          }
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
              value={filters.month || ""}
              onChange={(e) => setFilters({ month: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Chọn tháng</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>

            <select
              value={filters.year || new Date().getFullYear()}
              onChange={(e) => setFilters({ year: parseInt(e.target.value) || undefined, page: 1 })}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              value={filters.status || ""}
              onChange={(e) => setFilters({ status: (e.target.value as any) || undefined, page: 1 })}
              className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PAID">Đã trả</option>
            </select>

            <button
              onClick={handleCalculateAll}
              disabled={isCalculating || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <Calculator size={16} />
              {isCalculating ? "Đang tính..." : "Chốt lương tháng"}
            </button>

            <button
              onClick={handlePrint}
              disabled={salaries.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Printer size={16} /> In bảng lương
            </button>
          </div>
        </div>

        {/* Thẻ thống kê */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Tổng quỹ lương" value={isLoadingStats ? "..." : formatCurrencyVnd(statistics?.totalNetSalary ?? 0)} icon={<DollarSign size={18} />} color="blue" />
          <StatCard title="Trung bình/người" value={isLoadingStats ? "..." : formatCurrencyVnd(statistics?.avgNetSalary ?? 0)} icon={<Users size={18} />} color="purple" />
          <StatCard title="Chờ duyệt" value={isLoadingStats ? "..." : `${statistics?.byStatus.PENDING ?? 0} phiếu`} icon={<Calculator size={18} />} color="orange" />
          <StatCard title="Đã thanh toán" value={isLoadingStats ? "..." : `${statistics?.byStatus.PAID ?? 0}/${statistics?.totalEmployees ?? 0}`} icon={<CheckCircle2 size={18} />} color="green" />
        </div>

        {/* Bảng dữ liệu */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <DataTableToolbar searchValue={searchTerm} onSearchChange={handleSearch} searchPlaceholder="Tìm tên hoặc mã nhân viên..." />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nhân viên</th>
                  <th className="px-6 py-4 text-center">Lương cơ bản</th>
                  <th className="px-6 py-4 text-center">Ngày làm</th>
                  <th className="px-6 py-4 text-center">Thưởng/Khấu trừ</th>
                  <th className="px-6 py-4 text-center">Thực lĩnh</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <TableLoadingRow colSpan={7} text="Đang tải dữ liệu..." />
                ) : salaries.length === 0 ? (
                  <EmptyRow colSpan={7} text="Không có dữ liệu bảng lương." />
                ) : (
                  salaries.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{s.employee?.user?.profile?.fullName || "—"}</div>
                        <div className="text-xs text-gray-400">{s.employee?.code} · {s.month}/{s.year}</div>
                      </td>
                      <td className="px-6 py-4 text-center">{formatCurrencyVnd(s.baseSalary || 0)}</td>
                      <td className="px-6 py-4 text-center">{s.actualWorkDays || 0}/{s.workingDays || 26}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-green-600">+{formatCurrencyVnd(s.totalBonus || 0)}</div>
                        <div className="text-red-600">-{formatCurrencyVnd(s.totalDeduction || 0)}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900">{formatCurrencyVnd(s.netSalary || 0)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.color}`}>
                          {SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.label || s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => openDetailModal(s.id)} className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100">
                            <Plus size={11} className="inline mr-1" /> Khoản
                          </button>
                          {s.status === "PENDING" && (
                            <button onClick={() => approve(s.id)} className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">Duyệt</button>
                          )}
                          {s.status === "APPROVED" && (
                            <button onClick={() => pay(s.id)} className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Thanh toán</button>
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
            isLoading={isLoading}
            totalLabel="Tổng bảng lương"
            onPageChange={(page) => setFilters({ page })}
          />
        </div>
      </div>

      {/* Modal Thêm chi tiết */}
      <AppModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Thêm chi tiết lương" maxWidthClassName="max-w-md">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
            <select
              value={detailForm.type}
              onChange={(e) => setDetailForm({ ...detailForm, type: e.target.value as DetailType })}
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
            >
              {Object.values(DetailType).map((type) => (
                <option key={type} value={type}>
                  {DETAIL_TYPE_BADGE[type as keyof typeof DETAIL_TYPE_BADGE]?.label || type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VNĐ)</label>
            <input
              type="number"
              value={detailForm.amount}
              onChange={(e) => setDetailForm({ ...detailForm, amount: Number(e.target.value) })}
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <input
              type="text"
              value={detailForm.description ?? ""}
              onChange={(e) => setDetailForm({ ...detailForm, description: e.target.value })}
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setDetailModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Hủy</button>
            <button onClick={submitDetail} disabled={detailForm.amount <= 0} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-60">Lưu</button>
          </div>
        </div>
      </AppModal>

      {/* Print Section */}
      <div id="print-salary-management" className="p-8 text-black text-xs">
        <div className="text-center mb-4">
          <h2 className="text-base font-bold uppercase">
            Bảng lương tháng {filters.month ?? "—"}/{filters.year ?? new Date().getFullYear()}
          </h2>
          <p className="text-gray-500 mt-0.5">Ngày in: {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1.5 text-center">STT</th>
              <th className="border border-black p-1.5">Mã NV</th>
              <th className="border border-black p-1.5">Họ tên</th>
              <th className="border border-black p-1.5">Chức vụ</th>
              <th className="border border-black p-1.5 text-right">Lương CB</th>
              <th className="border border-black p-1.5 text-center">Ngày công</th>
              <th className="border border-black p-1.5 text-right">Lương Gross</th>
              <th className="border border-black p-1.5 text-right">Thưởng</th>
              <th className="border border-black p-1.5 text-right">Khấu trừ</th>
              <th className="border border-black p-1.5 text-right">Thực lĩnh</th>
              <th className="border border-black p-1.5 text-center">TT</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((s, idx) => (
              <tr key={s.id}>
                <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                <td className="border border-black p-1.5 font-mono">{s.employee?.code ?? "—"}</td>
                <td className="border border-black p-1.5">{s.employee?.user?.profile?.fullName ?? "—"}</td>
                <td className="border border-black p-1.5">{s.employee?.position ?? "—"}</td>
                <td className="border border-black p-1.5 text-right tabular-nums">{formatCurrencyVnd(s.baseSalary)}</td>
                <td className="border border-black p-1.5 text-center">{s.actualWorkDays}/{s.workingDays}</td>
                <td className="border border-black p-1.5 text-right tabular-nums">{formatCurrencyVnd(s.grossSalary)}</td>
                <td className="border border-black p-1.5 text-right tabular-nums">{formatCurrencyVnd(s.totalBonus)}</td>
                <td className="border border-black p-1.5 text-right tabular-nums">{formatCurrencyVnd(s.totalDeduction)}</td>
                <td className="border border-black p-1.5 text-right font-semibold tabular-nums">{formatCurrencyVnd(s.netSalary)}</td>
                <td className="border border-black p-1.5 text-center">
                  {SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.label ?? s.status}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-100">
              <td colSpan={7} className="border border-black p-1.5 text-right">Tổng cộng</td>
              <td className="border border-black p-1.5 text-right tabular-nums">
                {formatCurrencyVnd(salaries.reduce((sum, s) => sum + s.totalBonus, 0))}
              </td>
              <td className="border border-black p-1.5 text-right tabular-nums">
                {formatCurrencyVnd(salaries.reduce((sum, s) => sum + s.totalDeduction, 0))}
              </td>
              <td className="border border-black p-1.5 text-right tabular-nums">
                {formatCurrencyVnd(salaries.reduce((sum, s) => sum + s.netSalary, 0))}
              </td>
              <td className="border border-black p-1.5" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-xl font-bold text-gray-900">{value}</span>
      </div>
      <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.blue}`}>{icon}</div>
    </div>
  );
}

function EmptyRow({ text, colSpan }: { text: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-gray-400 italic">
        {text}
      </td>
    </tr>
  );
}