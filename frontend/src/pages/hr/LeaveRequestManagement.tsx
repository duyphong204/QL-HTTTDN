import { Check, X, RefreshCw, FileText } from "lucide-react"

import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { Loading, TableLoadingRow } from "@/components/common/Loading"
import { PaginationControls } from "@/components/common/PaginationControls"
import {
  LEAVE_STATUS_CONFIG,
  LEAVE_TYPE_LABEL,
  useLeaveRequestPage,
} from "@/hooks/useLeaveRequestPage"

export default function LeaveRequestManagement() {
  const {
    loadingLeaveRequests,
    searchTerm,
    page,
    pagedData,
    meta,
    setSearchTerm,
    setPage,
    handleRefresh,
    handleUpdateStatus,
    getEmployeeInitial,
    formatCreatedDate,
    formatLeaveRange,
  } = useLeaveRequestPage()

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý đơn từ
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Theo dõi và xử lý các yêu cầu nghỉ phép của nhân sự.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loadingLeaveRequests}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {loadingLeaveRequests ? (
              <Loading size="sm" className="text-slate-500" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loadingLeaveRequests ? "Đang tải..." : "Làm mới dữ liệu"}
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo tên nhân viên, lý do, loại đơn..."
          />

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
                {loadingLeaveRequests ? (
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
                          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                            {getEmployeeInitial(req.employeeName)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{req.employeeName}</div>
                            <div className="text-xs text-gray-400">
                              {formatCreatedDate(req.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-2.5 py-1 text-xs font-medium">
                          {LEAVE_TYPE_LABEL[req.type] || req.type}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-gray-700 text-sm font-medium">
                          {formatLeaveRange(req.startDate, req.endDate)}
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-50">
                        <p className="text-gray-500 text-sm truncate italic" title={req.reason}>
                          "{req.reason}"
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${LEAVE_STATUS_CONFIG[req.status as keyof typeof LEAVE_STATUS_CONFIG]?.className}`}>
                          {LEAVE_STATUS_CONFIG[req.status as keyof typeof LEAVE_STATUS_CONFIG]?.label || req.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {req.status === "PENDING" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                                className="h-9 w-9 flex items-center justify-center rounded-xl text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-100 transition-all"
                              >
                                <Check size={18} />
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                                className="h-9 w-9 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                              Hoàn thành
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
            isLoading={loadingLeaveRequests}
            totalLabel="Tổng số đơn"
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
