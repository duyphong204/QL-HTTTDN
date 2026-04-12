import { useLeaveRequestManagement } from "@/hooks/useLeaveRequestManagement"
import { Plus, Trash2, Loader2 } from "lucide-react"
import dayjs from "dayjs"

import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { PaginationControls } from "@/components/common/PaginationControls"
import { AppModal } from "@/components/common/AppModal"

import type { LeaveRequest } from "@/types/hr.type"

const TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Nghỉ phép",
  SICK: "Nghỉ bệnh",
  MATERNITY: "Nghỉ thai sản",
  RESIGNATION: "Đơn nghỉ việc",
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
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
  } = useLeaveRequestManagement()

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
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
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

          <div className="relative">
            {isLoadingLeave && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-600 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Loại đơn</th>
                    <th className="px-6 py-4">Từ ngày</th>
                    <th className="px-6 py-4">Đến ngày</th>
                    <th className="px-6 py-4">Lý do</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {pagedData.length === 0 && !isLoadingLeave ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-medium">
                        Chưa có đơn xin nghỉ nào.
                      </td>
                    </tr>
                  ) : (
                    pagedData.map((request: LeaveRequest) => (
                      <tr key={request.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 text-gray-600">
                          {TYPE_LABEL[request.type] || request.type}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{dayjs(request.startDate).format("DD/MM/YYYY")}</td>
                        <td className="px-6 py-4 text-gray-600">{dayjs(request.endDate).format("DD/MM/YYYY")}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={request.reason}>{request.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[request.status] || STATUS_STYLES.REJECTED}`}>
                            {STATUS_LABELS[request.status] || request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            {request.status === "PENDING" && (
                              <button
                                onClick={() => handleDelete(request.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
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
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ANNUAL">Nghỉ phép</option>
              <option value="SICK">Nghỉ bệnh</option>
              <option value="MATERNITY">Nghỉ thai sản</option>
              <option value="RESIGNATION">Đơn nghỉ việc</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Từ ngày</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Đến ngày</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
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
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm shadow-blue-200 transition-all active:scale-95"
            >
              Gửi đơn
            </button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}
