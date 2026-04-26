import { useEffect } from "react"
import dayjs from "dayjs"
import { Check, X, RefreshCw, FileText } from "lucide-react"
import { useLeaveRequestStore } from "@/stores/leaveRequest.store"
import { useClientTable } from "@/hooks/useClientTable"
import { useConfirmAction } from "@/hooks/useConfirmAction"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { Loading, TableLoadingRow } from "@/components/common/Loading"
import { PaginationControls } from "@/components/common/PaginationControls"

// Config UI tại chỗ để component độc lập
export const LEAVE_TYPE_LABEL: Record<string, string> = {
  SICK: 'Nghỉ Ốm',
  ANNUAL: 'Nghỉ Phép',
  MATERNITY: 'Thai Sản',
  RESIGNATION: 'Xin Nghỉ Việc',
}

export const LEAVE_STATUS_CONFIG = {
  APPROVED: { label: 'Đã duyệt', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  REJECTED: { label: 'Từ chối', className: 'bg-rose-50 text-rose-700 border-rose-100' },
  PENDING: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 border-amber-100' },
}

export default function LeaveRequestManagement() {
  const { 
    allLeaveRequests, 
    isLoading, 
    fetchAllRequests, 
    approveRequest 
  } = useLeaveRequestStore()

  const { confirmAndRun } = useConfirmAction()

  // Logic Search & Phân trang tại Client
  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } = useClientTable({
    data: allLeaveRequests,
    pageSize: 10,
    searchFn: (req, keyword) => {
      const name = req.employeeName?.toLowerCase() ?? ''
      const reason = req.reason?.toLowerCase() ?? ''
      const type = (LEAVE_TYPE_LABEL[req.type] ?? req.type).toLowerCase()
      return name.includes(keyword) || reason.includes(keyword) || type.includes(keyword)
    },
  })

  useEffect(() => {
    fetchAllRequests()
  }, [fetchAllRequests])

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const isApproved = status === 'APPROVED'
    await confirmAndRun({
      message: isApproved ? 'Bạn có chắc muốn DUYỆT đơn này?' : 'Bạn có chắc muốn TỪ CHỐI đơn này?',
      action: () => approveRequest(id, status),
    })
  }

  // Helpers định dạng
  const getEmployeeInitial = (name?: string) => name?.charAt(0).toUpperCase() || 'U'
  const formatLeaveRange = (start: string, end: string) => 
    `${dayjs(start).format('DD/MM')} - ${dayjs(end).format('DD/MM/YYYY')}`

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý đơn từ</h1>
            <p className="text-sm text-gray-500 mt-1">Theo dõi và xử lý các yêu cầu nghỉ phép của nhân sự.</p>
          </div>

          <button
            onClick={fetchAllRequests}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {isLoading ? <Loading size="sm" /> : <RefreshCw className="h-4 w-4" />}
            {isLoading ? "Đang tải..." : "Làm mới dữ liệu"}
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
                            {getEmployeeInitial(req.employeeName)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{req.employeeName}</div>
                            <div className="text-[10px] text-gray-400">
                              Gửi: {dayjs(req.createdAt).format('DD/MM/YYYY HH:mm')}
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
                        {formatLeaveRange(req.startDate, req.endDate)}
                      </td>

                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-gray-500 text-xs truncate italic" title={req.reason}>
                          "{req.reason}"
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-tight ${LEAVE_STATUS_CONFIG[req.status as keyof typeof LEAVE_STATUS_CONFIG]?.className}`}>
                          {LEAVE_STATUS_CONFIG[req.status as keyof typeof LEAVE_STATUS_CONFIG]?.label || req.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {req.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all"
                                title="Duyệt đơn"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req.id, "REJECTED")}
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
    </div>
  )
}