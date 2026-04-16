import { useLeaveRequest } from "@/hooks/useLeaveRequest"
import { Plus, Trash2, CalendarX } from "lucide-react" 
import dayjs from "dayjs"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { PaginationControls } from "@/components/common/PaginationControls"
import { AppModal } from "@/components/common/AppModal"
import { OverlayLoading } from "@/components/common/Loading"
import type { LeaveRequest } from "@/types/leave.types"

const TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Nghỉ phép",
  SICK: "Nghỉ bệnh",
  RESIGNATION: "Đơn nghỉ việc",
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  APPROVED: "bg-green-100 text-green-700 border border-green-200",
  REJECTED: "bg-red-100 text-red-700 border border-red-200",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
}

export default function EmployeeLeaveRequestPage() {
  const {
    isLoadingLeave,
    pagedData,
    meta,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    dialogOpen,
    setDialogOpen,
    form,
    handleChange,
    handleSubmit,
    handleDelete,
  } = useLeaveRequest()

  const isSearching = searchTerm.length > 0;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đơn xin nghỉ</h1>
            <p className="text-sm text-gray-500 mt-1">Nộp và theo dõi đơn xin nghỉ của bạn</p>
          </div>

          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            <Plus size={18} />
            Nộp đơn xin nghỉ
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm kiếm theo lý do, loại đơn..."
          />

          <div className="relative min-h-75">
            {isLoadingLeave && (
              <OverlayLoading text="Đang tải dữ liệu..." />
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-600 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Loại đơn</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Lý do</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {pagedData.length === 0 && !isLoadingLeave ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                           <CalendarX size={48} className="mb-2 opacity-20" />
                           <p className="font-medium">
                             {isSearching ? "Không tìm thấy kết quả phù hợp" : "Chưa có đơn xin nghỉ nào"}
                           </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedData.map((request: LeaveRequest) => (
                      <tr key={request.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-700">
                            {TYPE_LABEL[request.type] || request.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex flex-col">
                            <span>{dayjs(request.startDate).format("DD/MM/YYYY")}</span>
                            <span className="text-[10px] text-gray-400 italic">đến {dayjs(request.endDate).format("DD/MM/YYYY")}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs">
                          <p className="truncate" title={request.reason}>{request.reason}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[request.status] || STATUS_STYLES.REJECTED}`}>
                            {STATUS_LABELS[request.status] || request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            {request.status === "PENDING" ? (
                              <button
                                onClick={() => handleDelete(request.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Xóa đơn"
                              >
                                <Trash2 size={18} />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300 italic">Không thể xóa</span>
                            )}
                          </div>
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
            totalLabel="Tổng số đơn"
            isLoading={isLoadingLeave}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* FORM MODAL */}
      <AppModal
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Nộp đơn xin nghỉ"
        maxWidthClassName="max-w-md"
      >
        <div className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại đơn</label>
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            >
              {Object.entries(TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Từ ngày</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Đến ngày</label>
              <input
                type="date"
                min={form.startDate} 
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lý do</label>
            <textarea
              value={form.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              rows={3}
              placeholder="Nhập lý do xin nghỉ..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDialogOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.reason || !form.startDate || !form.endDate} // Disable nếu thiếu data
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              Gửi đơn
            </button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}