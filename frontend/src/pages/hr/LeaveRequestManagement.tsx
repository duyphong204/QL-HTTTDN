import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Check, X, RefreshCw, FileText, ChevronDown } from "lucide-react";
import { useLeaveRequestStore } from "@/stores/leaveRequest.store";
import type { LeaveRequest } from "@/types/hr.type";
import { useClientTable } from "@/hooks/useClientTable";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { Loading, TableLoadingRow } from "@/components/common/Loading";
import { PaginationControls } from "@/components/common/PaginationControls";
import { AppModal } from "@/components/common/AppModal";

import { LEAVE_TYPE_LABEL, LEAVE_STATUS_CONFIG } from "@/utils/leave";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Tháng ${i + 1}`,
}));

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map((y) => ({
  value: String(y),
  label: String(y),
}));

interface RejectModalState {
  open: boolean;
  id: string;
  reason: string;
}

export default function LeaveRequestManagement() {
  const { allLeaveRequests, isLoading, fetchAllRequests, approveRequest } =
    useLeaveRequestStore();
  const { confirmAndRun } = useConfirmAction();

  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1));
  const [filterYear, setFilterYear] = useState(String(CURRENT_YEAR));
  const [rejectModal, setRejectModal] = useState<RejectModalState>({
    open: false,
    id: "",
    reason: "",
  });

  const loadData = useCallback(() => {
    fetchAllRequests({ month: filterMonth, year: filterYear });
  }, [fetchAllRequests, filterMonth, filterYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } = useClientTable({
    data: allLeaveRequests,
    pageSize: 10,
    searchFn: useCallback((req: LeaveRequest, keyword: string) => {
      const name = req.employeeName?.toLowerCase() ?? "";
      const reason = req.reason?.toLowerCase() ?? "";
      const type = (LEAVE_TYPE_LABEL[req.type] ?? req.type).toLowerCase();
      return name.includes(keyword) || reason.includes(keyword) || type.includes(keyword);
    }, []),
  });

  const handleApprove = useCallback((id: string) => {
    void confirmAndRun({
      message: "Bạn có chắc muốn DUYỆT đơn xin nghỉ này?",
      action: () => approveRequest(id, "APPROVED"),
    });
  }, [confirmAndRun, approveRequest]);

  const handleRejectConfirm = useCallback(async () => {
    await approveRequest(rejectModal.id, "REJECTED", rejectModal.reason.trim() || undefined);
    setRejectModal({ open: false, id: "", reason: "" });
  }, [approveRequest, rejectModal]);

  const getInitial = (name?: string) => name?.charAt(0).toUpperCase() || "U";
  const formatRange = (start: string, end: string) =>
    `${dayjs(start).format("DD/MM")} - ${dayjs(end).format("DD/MM/YYYY")}`;

  const renderTableBody = () => {
    if (isLoading && allLeaveRequests.length === 0) {
      return <TableLoadingRow colSpan={6} text="Đang tải dữ liệu..." />;
    }

    if (pagedData.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">📄</span>
              <p className="font-medium text-gray-600">Hiện tại chưa có đơn cần xử lý</p>
              <p className="text-sm">Hãy thử thay đổi thời gian hoặc từ khóa tìm kiếm.</p>
            </div>
          </td>
        </tr>
      );
    }

    return pagedData.map((req) => (
      <tr key={req.id} className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-100 shadow-sm">
              {getInitial(req.employeeName)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{req.employeeName}</div>
              <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
                Gửi: {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
              </div>
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 px-2.5 py-1 text-xs font-semibold shadow-sm">
            {LEAVE_TYPE_LABEL[req.type] || req.type}
          </span>
        </td>

        <td className="px-6 py-4 font-medium text-gray-700">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{formatRange(req.startDate, req.endDate)}</span>
            {req.totalDays != null && (
              <span className="text-xs text-blue-600 font-bold mt-0.5">
                {req.totalDays} ngày công
              </span>
            )}
          </div>
        </td>

        <td className="px-6 py-4 max-w-[200px]">
          <p className="text-gray-500 text-sm truncate italic" title={req.reason}>
            "{req.reason}"
          </p>
        </td>

        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-tight shadow-sm ${LEAVE_STATUS_CONFIG[req.status as keyof typeof LEAVE_STATUS_CONFIG]?.className}`}
          >
            {LEAVE_STATUS_CONFIG[req.status as keyof typeof LEAVE_STATUS_CONFIG]?.label || req.status}
          </span>
        </td>

        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {req.status === "PENDING" ? (
              <div className="flex gap-2 opacity-60 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  onClick={() => handleApprove(req.id)}
                  className="rounded-lg p-2 text-emerald-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 active:scale-95"
                  title="Duyệt đơn"
                >
                  <Check size={18} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setRejectModal({ open: true, id: req.id, reason: "" })}
                  className="rounded-lg p-2 text-rose-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95"
                  title="Từ chối"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-bold text-gray-400 uppercase italic">
                Đã xử lý
              </span>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <FileText size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý đơn từ</h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi và xử lý các yêu cầu nghỉ phép của nhân sự
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {isLoading ? <Loading size="sm" /> : <RefreshCw className="h-4 w-4" strokeWidth={2.5} />}
            {isLoading ? "Đang tải..." : "Làm mới dữ liệu"}
          </button>
        </div>

        {/* Table container */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={(val) => { setSearchTerm(val); setPage(1); }}
              searchPlaceholder="Tìm theo tên nhân viên, lý do, loại đơn..."
            >
              {/* Month filter */}
              <div className="relative">
                <select
                  value={filterMonth}
                  onChange={(e) => { setFilterMonth(e.target.value); setPage(1); }}
                  className="h-10 min-w-[120px] appearance-none pl-3 pr-8 text-sm font-medium rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Year filter */}
              <div className="relative">
                <select
                  value={filterYear}
                  onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
                  className="h-10 min-w-[100px] appearance-none pl-3 pr-8 text-sm font-medium rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </DataTableToolbar>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-gray-50/80 font-semibold text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Nhân viên</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Loại đơn</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Thời gian nghỉ</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Lý do</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Trạng thái</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 bg-white">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 bg-white p-4">
            <PaginationControls
              meta={meta}
              currentPage={page}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Modal từ chối */}
      <AppModal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: "", reason: "" })}
        title="Từ chối đơn nghỉ"
        maxWidthClassName="max-w-md"
      >
        <div className="p-6 space-y-4 bg-white">
          <p className="text-sm text-gray-600">
            Vui lòng nhập lý do từ chối để nhân viên được biết.
          </p>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              Lý do từ chối
            </label>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((s) => ({ ...s, reason: e.target.value }))}
              rows={3}
              placeholder="VD: Thiếu nhân lực trong thời gian này, vui lòng đổi ngày khác..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-400/10 transition-all resize-none placeholder:text-gray-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button
              onClick={() => setRejectModal({ open: false, id: "", reason: "" })}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-rose-600/20 active:scale-95"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
