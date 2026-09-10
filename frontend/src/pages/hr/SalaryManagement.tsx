import { useEffect, useState, useCallback, useMemo } from "react";
import {
  DollarSign,
  Users,
  CheckCircle2,
  Calculator,
  Printer,
  Plus,
  Banknote
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
    currentPage: filters.page,
    itemsPerPage: filters.limit,
    totalItems: total,
    itemCount: Math.min(filters.limit, total - (filters.page - 1) * filters.limit),
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  }), [filters.page, filters.limit, total]);

  const handleCalculateAll = useCallback(async () => {
    const month = filters.month ?? new Date().getMonth() + 1;
    const year = filters.year ?? new Date().getFullYear();
    await calculateAll(month, year);
  }, [calculateAll, filters.month, filters.year]);

  const handleSearch = useCallback((val: string) => {
    setSearchTerm(val);
    setFilters({ search: val || undefined, page: 1 });
  }, [setFilters]);

  const openDetailModal = useCallback((salaryId: string) => {
    setDetailSalaryId(salaryId);
    setDetailForm({ type: DetailType.BONUS, amount: 0, description: "" });
    setDetailModalOpen(true);
  }, []);

  const submitDetail = useCallback(async () => {
    if (!detailSalaryId || detailForm.amount <= 0) return;
    await addDetail(detailSalaryId, detailForm);
    setDetailModalOpen(false);
  }, [detailSalaryId, detailForm, addDetail]);

  const handlePrint = useCallback(() => {
    document.body.classList.add("print-salary-mgmt");
    window.print();
    document.body.classList.remove("print-salary-mgmt");
  }, []);

  const renderTableBody = () => {
    if (isLoading) return <TableLoadingRow colSpan={7} text="Đang tải dữ liệu bảng lương..." />;
    
    if (salaries.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">💰</span>
              <p className="font-medium text-gray-600">Không tìm thấy dữ liệu bảng lương nào.</p>
              <p className="text-sm">Hãy thử thay đổi tháng/năm hoặc tính lương mới.</p>
            </div>
          </td>
        </tr>
      );
    }

    return salaries.map((s) => (
      <tr key={s.id} className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40">
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{s.employee?.user?.profile?.fullName || "—"}</span>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">
              {s.employee?.code} <span className="mx-1 text-gray-300">•</span> {s.month}/{s.year}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-center font-medium text-gray-600">
          <span className="bg-gray-50 border border-gray-100 rounded-md px-2 py-1 shadow-sm">
            {formatCurrencyVnd(s.baseSalary || 0)}
          </span>
        </td>
        <td className="px-6 py-4 text-center font-semibold text-gray-700">
          {s.actualWorkDays || 0}<span className="text-gray-400 font-normal">/{s.workingDays || 26}</span>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex flex-col items-center gap-1 text-xs font-semibold">
            {s.totalBonus > 0 && <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shadow-sm">+{formatCurrencyVnd(s.totalBonus)}</span>}
            {s.totalDeduction > 0 && <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded shadow-sm">-{formatCurrencyVnd(s.totalDeduction)}</span>}
            {s.totalBonus === 0 && s.totalDeduction === 0 && <span className="text-gray-400 font-normal">—</span>}
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="font-bold text-gray-900 text-base">
            {formatCurrencyVnd(s.netSalary || 0)}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border ${SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.color}`}>
            {SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.label || s.status}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex justify-center gap-2 opacity-60 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => openDetailModal(s.id)}
              className="rounded-lg bg-white p-1.5 shadow-sm border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 active:scale-95 transition-all"
              title="Thêm khoản (thưởng/phạt)"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
            {s.status === "PENDING" && (
              <button
                onClick={() => approve(s.id)}
                className="rounded-lg bg-white p-1.5 shadow-sm border border-gray-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 active:scale-95 transition-all"
                title="Duyệt lương"
              >
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </button>
            )}
            {s.status === "APPROVED" && (
              <button
                onClick={() => pay(s.id)}
                className="rounded-lg bg-white p-1.5 shadow-sm border border-gray-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 active:scale-95 transition-all"
                title="Thanh toán lương"
              >
                <Banknote size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Calculator size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý lương</h1>
              <p className="mt-1 text-sm text-gray-500">Tính toán và theo dõi bảng lương nhân viên</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filters.month || ""}
              onChange={(e) => setFilters({ month: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
              className="h-10 min-w-[120px] px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer transition-all"
            >
              <option value="">Chọn tháng</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>

            <select
              value={filters.year || new Date().getFullYear()}
              onChange={(e) => setFilters({ year: parseInt(e.target.value) || undefined, page: 1 })}
              className="h-10 min-w-[100px] px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer transition-all"
            >
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              value={filters.status || ""}
              onChange={(e) => setFilters({ status: (e.target.value as "PENDING" | "APPROVED" | "PAID") || undefined, page: 1 })}
              className="h-10 min-w-[150px] px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PAID">Đã trả</option>
            </select>

            <button
              onClick={handleCalculateAll}
              disabled={isCalculating || isLoading}
              className="inline-flex items-center gap-2 h-10 px-4 text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Calculator size={16} strokeWidth={2.5} />
              {isCalculating ? "Đang tính..." : "Chốt lương"}
            </button>

            <button
              onClick={handlePrint}
              disabled={salaries.length === 0}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-700/20 active:scale-95"
              title="In bảng lương"
            >
              <Printer size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Thẻ thống kê */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Tổng quỹ lương" value={isLoadingStats ? "..." : formatCurrencyVnd(statistics?.totalNetSalary ?? 0)} icon={<DollarSign size={20} strokeWidth={2.5} />} color="blue" />
          <StatCard title="Trung bình/người" value={isLoadingStats ? "..." : formatCurrencyVnd(statistics?.avgNetSalary ?? 0)} icon={<Users size={20} strokeWidth={2.5} />} color="purple" />
          <StatCard title="Chờ duyệt" value={isLoadingStats ? "..." : `${statistics?.byStatus.PENDING ?? 0} phiếu`} icon={<Calculator size={20} strokeWidth={2.5} />} color="amber" />
          <StatCard title="Đã thanh toán" value={isLoadingStats ? "..." : `${statistics?.byStatus.PAID ?? 0}/${statistics?.totalEmployees ?? 0}`} icon={<CheckCircle2 size={20} strokeWidth={2.5} />} color="emerald" />
        </div>

        {/* Bảng dữ liệu */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar searchValue={searchTerm} onSearchChange={handleSearch} searchPlaceholder="Tìm theo tên hoặc mã nhân viên..." />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Nhân viên</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Lương cơ bản</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Ngày công</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Thưởng/Khấu trừ</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Thực lĩnh</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Trạng thái</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 bg-white">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 bg-white p-4">
            <PaginationControls
              meta={paginationMeta}
              currentPage={filters.page}
              isLoading={isLoading}
              totalLabel="Bảng lương"
              onPageChange={(page) => setFilters({ page })}
            />
          </div>
        </div>
      </div>

      {/* Modal Thêm chi tiết */}
      <AppModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Thêm khoản điều chỉnh lương" maxWidthClassName="max-w-md">
        <div className="p-6 space-y-5 bg-white">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Loại điều chỉnh</label>
            <select
              value={detailForm.type}
              onChange={(e) => setDetailForm({ ...detailForm, type: e.target.value as DetailType })}
              className="w-full h-11 px-4 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors cursor-pointer"
            >
              {Object.values(DetailType).map((type) => (
                <option key={type} value={type}>
                  {DETAIL_TYPE_BADGE[type as keyof typeof DETAIL_TYPE_BADGE]?.label || type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Số tiền (VNĐ)</label>
            <input
              type="number"
              value={detailForm.amount}
              onChange={(e) => setDetailForm({ ...detailForm, amount: Number(e.target.value) })}
              className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              placeholder="VD: 500000"
              min="0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Lý do (Mô tả chi tiết)</label>
            <textarea
              value={detailForm.description ?? ""}
              onChange={(e) => setDetailForm({ ...detailForm, description: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors resize-none"
              placeholder="VD: Thưởng doanh số quý..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button onClick={() => setDetailModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">Hủy</button>
            <button onClick={submitDetail} disabled={detailForm.amount <= 0} className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95">Lưu điều chỉnh</button>
          </div>
        </div>
      </AppModal>

      {/* Print Section (Hidden by default, shown when printing) */}
      <div id="print-salary-management" className="p-8 text-black text-xs font-serif">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase mb-1">
            Bảng Lương Tháng {filters.month ?? "—"}/{filters.year ?? new Date().getFullYear()}
          </h2>
          <p className="text-gray-600 italic">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr className="bg-gray-100 font-bold">
              <th className="border border-gray-800 p-2 text-center w-10">STT</th>
              <th className="border border-gray-800 p-2 w-20">Mã NV</th>
              <th className="border border-gray-800 p-2">Họ Tên</th>
              <th className="border border-gray-800 p-2">Chức Vụ</th>
              <th className="border border-gray-800 p-2 text-right">Lương CB</th>
              <th className="border border-gray-800 p-2 text-center w-24">Ngày Công</th>
              <th className="border border-gray-800 p-2 text-right">Lương Gross</th>
              <th className="border border-gray-800 p-2 text-right">Thưởng</th>
              <th className="border border-gray-800 p-2 text-right">Khấu Trừ</th>
              <th className="border border-gray-800 p-2 text-right">Thực Lĩnh</th>
              <th className="border border-gray-800 p-2 text-center w-24">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((s, idx) => (
              <tr key={s.id}>
                <td className="border border-gray-800 p-2 text-center">{idx + 1}</td>
                <td className="border border-gray-800 p-2 font-mono text-[10px]">{s.employee?.code ?? "—"}</td>
                <td className="border border-gray-800 p-2 font-medium">{s.employee?.user?.profile?.fullName ?? "—"}</td>
                <td className="border border-gray-800 p-2">{s.employee?.position ?? "—"}</td>
                <td className="border border-gray-800 p-2 text-right">{formatCurrencyVnd(s.baseSalary)}</td>
                <td className="border border-gray-800 p-2 text-center">{s.actualWorkDays}/{s.workingDays}</td>
                <td className="border border-gray-800 p-2 text-right">{formatCurrencyVnd(s.grossSalary)}</td>
                <td className="border border-gray-800 p-2 text-right">{formatCurrencyVnd(s.totalBonus)}</td>
                <td className="border border-gray-800 p-2 text-right">{formatCurrencyVnd(s.totalDeduction)}</td>
                <td className="border border-gray-800 p-2 text-right font-bold">{formatCurrencyVnd(s.netSalary)}</td>
                <td className="border border-gray-800 p-2 text-center">
                  {SALARY_STATUS_BADGE[s.status as keyof typeof SALARY_STATUS_BADGE]?.label ?? s.status}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-100 uppercase">
              <td colSpan={7} className="border border-gray-800 p-2 text-right">Tổng Cộng</td>
              <td className="border border-gray-800 p-2 text-right text-[11px]">
                {formatCurrencyVnd(salaries.reduce((sum, s) => sum + s.totalBonus, 0))}
              </td>
              <td className="border border-gray-800 p-2 text-right text-[11px]">
                {formatCurrencyVnd(salaries.reduce((sum, s) => sum + s.totalDeduction, 0))}
              </td>
              <td className="border border-gray-800 p-2 text-right text-sm">
                {formatCurrencyVnd(salaries.reduce((sum, s) => sum + s.netSalary, 0))}
              </td>
              <td className="border border-gray-800 p-2"></td>
            </tr>
          </tfoot>
        </table>
        <div className="flex justify-end mt-12 mr-12">
          <div className="text-center">
            <p className="font-bold mb-16 uppercase text-sm">Giám đốc ký duyệt</p>
            <p className="text-gray-400 italic">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    purple: "text-purple-700 bg-purple-50 border-purple-100",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex justify-between items-center shadow-sm transition-all hover:shadow-md hover:border-blue-100/50">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <div className={`p-3 rounded-xl border shadow-inner ${colorMap[color] || colorMap.blue}`}>{icon}</div>
    </div>
  );
}