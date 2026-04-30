import { useEffect, useState } from "react";
import {
  DollarSign,
  Users,
  CheckCircle2,
  Calculator,
  Printer,
  Plus,
  BarChart2,
  ChevronDown,
  ChevronUp,
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
  type AddSalaryDetailDto,
  type Salary,
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
    cancel,
    addDetail,
    statistics,
    isLoadingStats,
    fetchStatistics,
  } = useHrSalaryStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailSalaryId, setDetailSalaryId] = useState<string | null>(null);
  const [detailForm, setDetailForm] = useState<AddSalaryDetailDto>({
    type: DetailType.BONUS,
    amount: 0,
    description: "",
  });

  useEffect(() => {
    void fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.month,
    filters.year,
    filters.status,
    filters.employeeId,
  ]);

  useEffect(() => {
    const year = filters.year ?? new Date().getFullYear();
    void fetchStatistics(year, filters.month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year, filters.month]);

  const paginationMeta = {
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  };

  const handleCalculateAll = async () => {
    const month = filters.month ?? new Date().getMonth() + 1;
    const year = filters.year ?? new Date().getFullYear();
    await calculateAll(month, year);
  };

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setFilters({ search: val || undefined, page: 1 });
  };

  const openDetailModal = (salaryId: string) => {
    setDetailSalaryId(salaryId);
    setDetailForm({ type: DetailType.BONUS, amount: 0, description: "" });
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailSalaryId(null);
  };

  const submitDetail = async () => {
    if (!detailSalaryId || detailForm.amount <= 0) return;
    await addDetail(detailSalaryId, detailForm);
    closeDetailModal();
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
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
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Quản lý lương
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Theo dõi bảng lương nhân viên
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filters.month || ""}
                onChange={(e) =>
                  setFilters({
                    month: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                    page: 1,
                  })
                }
                className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Chọn tháng</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>

              <select
                value={filters.year || new Date().getFullYear()}
                onChange={(e) =>
                  setFilters({
                    year: parseInt(e.target.value) || undefined,
                    page: 1,
                  })
                }
                className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters({
                    status: (e.target.value as any) || undefined,
                    page: 1,
                  })
                }
                className="h-11 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="PAID">Đã trả</option>
                <option value="CANCELLED">Đã hủy</option>
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
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-700 text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Printer size={16} />
                In bảng lương
              </button>
            </div>
          </div>

          {/* Stats Cards from API */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Tổng quỹ lương"
              value={
                isLoadingStats
                  ? "..."
                  : formatCurrencyVnd(statistics?.totalNetSalary ?? 0)
              }
              icon={<DollarSign size={18} />}
              color="blue"
            />
            <StatCard
              title="Trung bình/người"
              value={
                isLoadingStats
                  ? "..."
                  : formatCurrencyVnd(statistics?.avgNetSalary ?? 0)
              }
              icon={<Users size={18} />}
              color="purple"
            />
            <StatCard
              title="Chờ duyệt"
              value={
                isLoadingStats
                  ? "..."
                  : `${statistics?.byStatus.PENDING ?? 0} phiếu`
              }
              icon={<Calculator size={18} />}
              color="orange"
            />
            <StatCard
              title="Đã thanh toán"
              value={
                isLoadingStats
                  ? "..."
                  : `${statistics?.byStatus.PAID ?? 0}/${statistics?.totalEmployees ?? 0}`
              }
              icon={<CheckCircle2 size={18} />}
              color="green"
            />
          </div>

          {/* Monthly Breakdown — hiện khi không có filter tháng */}
          {!filters.month &&
            statistics &&
            statistics.monthlyBreakdown.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowStats((v) => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 size={18} className="text-blue-600" />
                    <span className="font-semibold text-gray-900">
                      Thống kê theo tháng — Năm{" "}
                      {filters.year ?? new Date().getFullYear()}
                    </span>
                  </div>
                  {showStats ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>

                {showStats && (
                  <div className="overflow-x-auto border-t border-gray-100">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 font-semibold">
                        <tr>
                          <th className="px-6 py-3">Tháng</th>
                          <th className="px-6 py-3 text-center">
                            Số nhân viên
                          </th>
                          <th className="px-6 py-3 text-right">
                            Tổng thực lĩnh
                          </th>
                          <th className="px-6 py-3 text-right">Trung bình</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {statistics.monthlyBreakdown.map((row) => (
                          <tr key={row.month} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium">
                              Tháng {row.month}
                            </td>
                            <td className="px-6 py-3 text-center text-gray-600">
                              {row.count}
                            </td>
                            <td className="px-6 py-3 text-right font-semibold text-gray-900">
                              {formatCurrencyVnd(row.total)}
                            </td>
                            <td className="px-6 py-3 text-right text-gray-600">
                              {row.count > 0
                                ? formatCurrencyVnd(
                                    Math.round(row.total / row.count),
                                  )
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-blue-50">
                          <td className="px-6 py-3 font-bold text-gray-900">
                            Tổng năm
                          </td>
                          <td className="px-6 py-3 text-center font-bold text-gray-900">
                            {statistics.totalEmployees}
                          </td>
                          <td className="px-6 py-3 text-right font-bold text-blue-700">
                            {formatCurrencyVnd(statistics.totalNetSalary)}
                          </td>
                          <td className="px-6 py-3 text-right font-bold text-blue-700">
                            {formatCurrencyVnd(statistics.avgNetSalary)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}

          {/* Data Table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={handleSearch}
              searchPlaceholder="Tìm theo tên hoặc mã nhân viên..."
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
                  {isLoading ? (
                    <TableLoadingRow colSpan={9} text="Đang tải dữ liệu..." />
                  ) : salaries.length === 0 ? (
                    <EmptyRow text="Không có dữ liệu bảng lương." />
                  ) : (
                    salaries.map((s: Salary) => (
                      <tr
                        key={s.id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {s.employee?.user?.profile?.fullName || "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {s.employee?.code} · {s.month}/{s.year}
                          </div>
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
                            <div className="flex flex-wrap gap-1">
                              {s.details.map((detail) => {
                                const badge =
                                  DETAIL_TYPE_BADGE[
                                    detail.type as keyof typeof DETAIL_TYPE_BADGE
                                  ];
                                return (
                                  <span
                                    key={detail.id}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge?.color ?? "bg-slate-100 text-slate-700"}`}
                                    title={detail.description || ""}
                                  >
                                    {badge?.label ?? detail.type}
                                  </span>
                                );
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
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              SALARY_STATUS_BADGE[
                                s.status as keyof typeof SALARY_STATUS_BADGE
                              ]?.color
                            }`}
                          >
                            {SALARY_STATUS_BADGE[
                              s.status as keyof typeof SALARY_STATUS_BADGE
                            ]?.label || s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            {s.status !== "CANCELLED" && (
                              <button
                                onClick={() => openDetailModal(s.id)}
                                className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Plus size={11} /> Khoản
                                </span>
                              </button>
                            )}
                            {s.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => void approve(s.id)}
                                  className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => void cancel(s.id)}
                                  className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                            {s.status === "APPROVED" && (
                              <>
                                <button
                                  onClick={() => void pay(s.id)}
                                  className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                >
                                  Thanh toán
                                </button>
                                <button
                                  onClick={() => void cancel(s.id)}
                                  className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                            {(s.status === "PAID" ||
                              s.status === "CANCELLED") && (
                              <span className="text-xs text-gray-400">—</span>
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

        {/* Print Section */}
        <div id="print-salary-management" className="p-8 text-black text-sm">
          <h2 className="text-xl font-bold text-center mb-2">
            BẢNG LƯƠNG THÁNG {filters.month ?? "—"}/
            {filters.year ?? new Date().getFullYear()}
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
              {salaries.map((s: Salary) => (
                <tr key={s.id}>
                  <td className="border border-black p-2">
                    {s.employee?.user?.profile?.fullName || "—"}
                  </td>
                  <td className="border border-black p-2 text-right">
                    {formatCurrencyVnd(s.baseSalary || 0)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {s.actualWorkDays || 0}/{s.workingDays || 26}
                  </td>
                  <td className="border border-black p-2 text-right">
                    +{formatCurrencyVnd(s.totalBonus || 0)}
                  </td>
                  <td className="border border-black p-2 text-right">
                    -{formatCurrencyVnd(s.totalDeduction || 0)}
                  </td>
                  <td className="border border-black p-2 text-right font-bold">
                    {formatCurrencyVnd(s.netSalary || 0)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {SALARY_STATUS_BADGE[
                      s.status as keyof typeof SALARY_STATUS_BADGE
                    ]?.label || s.status}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="border border-black p-2 font-bold" colSpan={5}>
                  Tổng thực lĩnh
                </td>
                <td className="border border-black p-2 text-right font-bold">
                  {formatCurrencyVnd(
                    salaries.reduce(
                      (s: number, r: Salary) => s + (r.netSalary || 0),
                      0,
                    ),
                  )}
                </td>
                <td className="border border-black p-2" />
              </tr>
            </tfoot>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại
            </label>
            <select
              value={detailForm.type}
              onChange={(e) =>
                setDetailForm({
                  ...detailForm,
                  type: e.target.value as DetailType,
                })
              }
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white"
            >
              {Object.values(DetailType).map((type) => (
                <option key={type} value={type}>
                  {DETAIL_TYPE_BADGE[type as keyof typeof DETAIL_TYPE_BADGE]
                    ?.label || type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền (VNĐ)
            </label>
            <input
              type="number"
              min={1}
              value={detailForm.amount}
              onChange={(e) =>
                setDetailForm({ ...detailForm, amount: Number(e.target.value) })
              }
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <input
              type="text"
              value={detailForm.description ?? ""}
              onChange={(e) =>
                setDetailForm({ ...detailForm, description: e.target.value })
              }
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
              disabled={detailForm.amount <= 0}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-60"
            >
              Lưu
            </button>
          </div>
        </div>
      </AppModal>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple";
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-xl font-bold text-gray-900">{value}</span>
      </div>
      <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <tr>
      <td colSpan={9} className="px-6 py-10 text-center text-gray-400">
        {text}
      </td>
    </tr>
  );
}
