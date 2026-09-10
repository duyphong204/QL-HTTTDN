import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { Plus, Trash2, CalendarX, CalendarDays } from "lucide-react";
import { useLeaveRequestStore } from "@/stores/leaveRequest.store";
import type { LeaveRequest } from "@/types/hr.type";
import { useClientTable } from "@/hooks/useClientTable";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { PaginationControls } from "@/components/common/PaginationControls";
import { AppModal } from "@/components/common/AppModal";
import { OverlayLoading } from "@/components/common/Loading";
import {
  REQUIRED_FIELDS_MESSAGE,
  hasEmptyRequiredValue,
} from "@/utils/validation";
import { toast } from "sonner";

const TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Nghỉ phép năm",
  SICK: "Nghỉ ốm",
  MATERNITY: "Thai sản",
  UNPAID: "Nghỉ không lương",
  RESIGNATION: "Đơn nghỉ việc",
};

const TYPE_STYLES: Record<string, string> = {
  ANNUAL: "bg-blue-50 text-blue-700 border-blue-200",
  SICK: "bg-red-50 text-red-700 border-red-200",
  MATERNITY: "bg-pink-50 text-pink-700 border-pink-200",
  UNPAID: "bg-orange-50 text-orange-700 border-orange-200",
  RESIGNATION: "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

export default function EmployeeLeaveRequestPage() {
  const {
    myLeaveRequests,
    leaveBalance,
    isLoading,
    fetchMyRequests,
    fetchMyBalance,
    createRequest,
    deleteRequest,
  } = useLeaveRequestStore();

  const { confirmAndRun } = useConfirmAction();

  // Local UI State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Phân trang & Tìm kiếm tại Client
  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } =
    useClientTable({
      data: myLeaveRequests,
      pageSize: 10,
      searchFn: useCallback((item: LeaveRequest, keyword: string) => {
        const reason = item.reason?.toLowerCase() ?? "";
        const type = (TYPE_LABEL[item.type] ?? item.type).toLowerCase();
        return reason.includes(keyword) || type.includes(keyword);
      }, []),
    });

  useEffect(() => {
    fetchMyRequests();
    fetchMyBalance();
  }, [fetchMyRequests, fetchMyBalance]);

  const handleSubmit = async () => {
    if (hasEmptyRequiredValue([form.startDate, form.endDate, form.reason])) {
      toast.error(REQUIRED_FIELDS_MESSAGE);
      return;
    }
    try {
      await createRequest({
        ...form,
        type: form.type as
          | "ANNUAL"
          | "SICK"
          | "MATERNITY"
          | "UNPAID"
          | "RESIGNATION",
      });
      setForm({ type: "ANNUAL", startDate: "", endDate: "", reason: "" });
      setDialogOpen(false);
    } catch {
      /* Error handled in store */
    }
  };

  const handleDelete = (id: string) => {
    confirmAndRun({
      message: "Bạn có chắc muốn xóa đơn này?",
      action: () => deleteRequest(id),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <CalendarDays size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Đơn xin nghỉ
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Nộp và theo dõi trạng thái đơn xin nghỉ của bạn
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {leaveBalance && (
              <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 shadow-sm">
                <CalendarDays size={18} className="text-blue-600 shrink-0" />
                <div className="text-sm font-medium">
                  <span className="text-gray-600">Phép năm còn lại: </span>
                  <span
                    className={`font-bold ml-1 text-base ${leaveBalance.remainingDays <= 2 ? "text-red-600" : "text-blue-700"}`}
                  >
                    {leaveBalance.remainingDays}
                  </span>
                  <span className="text-gray-400 font-normal">
                    /{leaveBalance.totalDays}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 hover:-translate-y-0.5"
            >
              <Plus size={18} strokeWidth={2.5} /> Nộp đơn mới
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm kiếm theo lý do, loại đơn..."
          />

          <div className="relative min-h-[400px]">
            {isLoading && <OverlayLoading text="Đang xử lý..." />}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Loại đơn</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Thời gian</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Lý do</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Trạng thái</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-center w-24">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50/50">
                  {pagedData.length === 0 && !isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <CalendarX size={48} className="mb-2 opacity-20" />
                          <p className="font-medium text-gray-500">Bạn chưa có đơn xin nghỉ nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedData.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        <td className="px-6 py-4 font-bold text-gray-800">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wider border shadow-sm ${TYPE_STYLES[request.type] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                            {TYPE_LABEL[request.type] || request.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-900">
                              {dayjs(request.startDate).format("DD/MM/YYYY")}
                            </span>
                            <span className="text-[11px] text-gray-400 font-normal">
                              đến {dayjs(request.endDate).format("DD/MM/YYYY")}
                            </span>
                            {request.totalDays != null && (
                              <span className="text-[11px] text-blue-600 bg-blue-50 w-fit px-1.5 rounded font-bold mt-1 border border-blue-100">
                                {request.totalDays} ngày công
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate whitespace-normal" title={request.reason}>
                          {request.reason}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border shadow-sm ${STATUS_STYLES[request.status]}`}
                            >
                              {STATUS_LABEL[request.status] ?? request.status}
                            </span>
                            {request.status === "REJECTED" && request.rejectionReason && (
                              <span className="text-[11px] text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 italic mt-1 max-w-[200px] truncate" title={request.rejectionReason}>
                                Lý do: {request.rejectionReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {request.status === "PENDING" && (
                            <button
                              onClick={() => handleDelete(request.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                              title="Xóa đơn"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationControls
            meta={meta}
            currentPage={page}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <AppModal
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Nộp đơn xin nghỉ"
        maxWidthClassName="max-w-md"
      >
        <div className="p-6 space-y-5 bg-white">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Loại đơn nghỉ phép
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
            >
              {Object.entries(TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Thời gian nghỉ
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full h-11 px-3 pt-3 pb-1 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
                <span className="absolute top-1.5 left-3 text-[10px] text-gray-400 font-medium uppercase">Từ ngày</span>
              </div>
              <div className="relative">
                <input
                  type="date"
                  min={form.startDate}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full h-11 px-3 pt-3 pb-1 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
                <span className="absolute top-1.5 left-3 text-[10px] text-gray-400 font-medium uppercase">Đến ngày</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Lý do cụ thể
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={4}
              placeholder="Vui lòng cung cấp lý do để quản lý dễ dàng phê duyệt..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDialogOpen(false)}
              className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? "Đang gửi..." : "Xác nhận gửi"}
            </button>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
