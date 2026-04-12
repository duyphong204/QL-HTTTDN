import { useEffect } from "react"
import dayjs from "dayjs"
import { Check, X, RefreshCw, FileText } from "lucide-react"

import { useHrStore } from "@/stores/hr.store"
import { useClientTable } from "@/hooks/useClientTable"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { PaginationControls } from "@/components/common/PaginationControls"

const TYPE_LABEL: Record<string, string> = {
  SICK: "Nghỉ Ốm",
  ANNUAL: "Nghỉ Phép",
  MATERNITY: "Thai Sản",
  RESIGNATION: "Xin Nghỉ Việc",
}

const STATUS_CONFIG = {
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  REJECTED: { label: "Từ chối", className: "bg-rose-50 text-rose-700 border-rose-100" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-100" },
}

export default function LeaveRequestManagement() {
  const {
    leaveRequests,
    loadingLeaveRequests,
    fetchLeaveRequests,
    approveLeaveRequest,
  } = useHrStore()

  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } = useClientTable({
    data: leaveRequests,
    pageSize: 10,
    searchFn: (req, keyword) => {
      const name = req.employeeName?.toLowerCase() ?? ""
      const reason = req.reason?.toLowerCase() ?? ""
      const type = (TYPE_LABEL[req.type] ?? req.type).toLowerCase()
      return name.includes(keyword) || reason.includes(keyword) || type.includes(keyword)
    },
  })

  useEffect(() => {
    fetchLeaveRequests()
  }, [fetchLeaveRequests])

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    const isApproved = status === "APPROVED"
    const message = isApproved ? "Duyệt đơn này?" : "Từ chối đơn này?"
    if (!window.confirm(message)) return
    await approveLeaveRequest(id, status)
  }

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
            onClick={fetchLeaveRequests}
            disabled={loadingLeaveRequests}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loadingLeaveRequests ? 'animate-spin' : ''}`} />
            Làm mới dữ liệu
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
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-3/4"></div></td>
                    </tr>
                  ))
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
                            {req.employeeName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{req.employeeName}</div>
                            <div className="text-xs text-gray-400">
                              {dayjs(req.createdAt).format("DD/MM/YYYY")}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-2.5 py-1 text-xs font-medium">
                          {TYPE_LABEL[req.type] || req.type}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-gray-700 text-sm font-medium">
                          {dayjs(req.startDate).format("DD/MM")} — {dayjs(req.endDate).format("DD/MM/YYYY")}
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-gray-500 text-sm truncate italic" title={req.reason}>
                          "{req.reason}"
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG]?.className}`}>
                          {STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG]?.label || req.status}
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
