import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Check, X, RefreshCw, FileText, ChevronDown } from "lucide-react";
import { useLeaveRequestStore } from "@/stores/leaveRequest.store";
import { useClientTable } from "@/hooks/useClientTable";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { Loading, TableLoadingRow } from "@/components/common/Loading";
import { PaginationControls } from "@/components/common/PaginationControls";
import { AppModal } from "@/components/common/AppModal";

export const LEAVE_TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Nghỉ phép năm",
  SICK: "Nghỉ ốm",
  MATERNITY: "Thai sản",
  UNPAID: "Nghỉ không lương",
  RESIGNATION: "Xin nghỉ việc",
};

export const LEAVE_STATUS_CONFIG = {
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  REJECTED: { label: "Từ chối", className: "bg-rose-50 text-rose-700 border-rose-100" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-100" },
};

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
    searchFn: (req, keyword) => {
      const name = req.employeeName?.toLowerCase() ?? "";
      const reason = req.reason?.toLowerCase() ?? "";
      const type = (LEAVE_TYPE_LABEL[req.type] ?? req.type).toLowerCase();
      return name.includes(keyword) || reason.includes(keyword) || type.includes(keyword);
    },
  });

  const handleApprove = (id: string) => {
    confirmAndRun({
      message: "Bạn có chắc muốn DUYỆT đơn này?",
      action: () => approveRequest(id, "APPROVED"),
    });
  };

  const handleRejectConfirm = async () => {
    await approveRequest(rejectModal.id, "REJECTED", rejectModal.reason.trim() || undefined);
    setRejectModal({ open: false, id: "", reason: "" });
  };

  const getInitial = (name?: string) => name?.charAt(0).toUpperCase() || "U";
  const formatRange = (start: string, end: string) =>
    `${dayjs(start).format("DD/MM")} - ${dayjs(end).format("DD/MM/YYYY")}`;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý đơn từ</h1>
            <p className="text-sm text-gray-500 mt-1">
              Theo dõi và xử lý các yêu cầu nghỉ phép của nhân sự.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {isLoading ? <Loading size="sm" /> : <RefreshCw className="h-4 w-4" />}
            {isLoading ? "Đang tải..." : "Làm mới dữ liệu"}
          </button>
        </div>

        {/* Table container */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
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
                className="h-10 appearance-none pl-3 pr-8 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer"
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
                className="h-10 appearance-none pl-3 pr-8 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </DataTableToolbar>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nhân viên</th>
                  <th className="px-6 py-4">Loại đơn</th>
                  <th className="px-6 py-4">Thời gian nghỉ</th>
                  <th className="px-6 py-4">Lý do</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && allLeaveRequests.length === 0 ? (
                  <TableLoadingRow colSpan={6} text="Đang tải dữ liệu..." />
                ) : pagedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <FileText size={40} className="opacity-20" />
                        <p className="font-medium">Hiện tại chưa có đơn cần xử lý</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedData.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
                            {getInitial(req.employeeName)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{req.employeeName}</div>
                            <div className="text-[10px] text-gray-400">
                              Gửi: {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-2.5 py-1 text-xs font-medium">
                          {LEAVE_TYPE_LABEL[req.type] || req.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-700">
                        <div className="flex flex-col">
                          <span>{formatRange(req.startDate, req.endDate)}</span>
                          {req.totalDays != null && (
                            <span className="text-[10px] text-blue-500 font-medium mt-0.5">
                              {req.totalDays} ngày công
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-gray-500 text-xs truncate italic" title={req.reason}>
                          "{req.reason}"
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-tight ${LEAVE_STATUS_CONFIG[req.status as keyof typeof LEAVE_STATUS_CONFIG]?.className}`}
                        >
                          {LEAVE_STATUS_CONFIG[req.status as keyof typeof LEAVE_STATUS_CONFIG]?.label || req.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {req.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all"
                                title="Duyệt đơn"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => setRejectModal({ open: true, id: req.id, reason: "" })}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                                title="Từ chối"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-300 uppercase italic">
                              Đã xử lý
                            </span>
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
            meta={meta}
            currentPage={page}
            isLoading={isLoading}
            onPageChange={setPage}
          />
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
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setRejectModal({ open: false, id: "", reason: "" })}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
