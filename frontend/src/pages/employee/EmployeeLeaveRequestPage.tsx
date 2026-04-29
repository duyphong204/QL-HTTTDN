import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { Plus, Trash2, CalendarX } from "lucide-react" 
import { useLeaveRequestStore } from "@/stores/leaveRequest.store"
import { useClientTable } from "@/hooks/useClientTable"
import { useConfirmAction } from "@/hooks/useConfirmAction"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { PaginationControls } from "@/components/common/PaginationControls"
import { AppModal } from "@/components/common/AppModal"
import { OverlayLoading } from "@/components/common/Loading"
import { REQUIRED_FIELDS_MESSAGE, hasEmptyRequiredValue } from "@/utils/validation"
import { toast } from "sonner"

const TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Nghỉ phép",
  SICK: "Nghỉ bệnh",
  MATERNITY: "Thai sản",
  RESIGNATION: "Đơn nghỉ việc",
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  APPROVED: "bg-green-100 text-green-700 border border-green-200",
  REJECTED: "bg-red-100 text-red-700 border border-red-200",
}

export default function EmployeeLeaveRequestPage() {
  const { 
    myLeaveRequests, 
    isLoading, 
    fetchMyRequests, 
    createRequest, 
    deleteRequest 
  } = useLeaveRequestStore()

  const { confirmAndRun } = useConfirmAction()
  
  // Local UI State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  })

  // Phân trang & Tìm kiếm tại Client
  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } = useClientTable({
    data: myLeaveRequests,
    pageSize: 10,
    searchFn: (item, keyword) => {
      const reason = item.reason?.toLowerCase() ?? ""
      const type = (TYPE_LABEL[item.type] ?? item.type).toLowerCase()
      return reason.includes(keyword) || type.includes(keyword)
    },
  })

  useEffect(() => {
    fetchMyRequests()
  }, [fetchMyRequests])

  const handleSubmit = async () => {
    if (hasEmptyRequiredValue([form.startDate, form.endDate, form.reason])) {
      toast.error(REQUIRED_FIELDS_MESSAGE)
      return
    }
    try {
      await createRequest({
        ...form,
        type: form.type as "SICK" | "ANNUAL" | "MATERNITY" | "RESIGNATION",
      })
      setForm({ type: "ANNUAL", startDate: "", endDate: "", reason: "" })
      setDialogOpen(false)
    } catch { /* Error handled in store */ }
  }

  const handleDelete = (id: string) => {
    confirmAndRun({
      message: "Bạn có chắc muốn xóa đơn này?",
      action: () => deleteRequest(id),
    })
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đơn xin nghỉ</h1>
            <p className="text-sm text-gray-500 mt-1">Nộp và theo dõi đơn xin nghỉ của bạn</p>
          </div>

          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md"
          >
            <Plus size={18} /> Nộp đơn xin nghỉ
          </button>
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
                  {pagedData.length === 0 && !isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                           <CalendarX size={48} className="mb-2 opacity-20" />
                           <p className="font-medium">Chưa có dữ liệu</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedData.map((request) => (
                      <tr key={request.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {TYPE_LABEL[request.type] || request.type}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex flex-col">
                            <span>{dayjs(request.startDate).format("DD/MM/YYYY")}</span>
                            <span className="text-[10px] text-gray-400 italic">đến {dayjs(request.endDate).format("DD/MM/YYYY")}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{request.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[request.status]}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {request.status === "PENDING" && (
                            <button
                              onClick={() => handleDelete(request.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
      >
        <div className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Loại đơn</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full h-10 px-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full h-10 px-3 border rounded-lg"
            />
            <input
              type="date"
              min={form.startDate}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full h-10 px-3 border rounded-lg"
            />
          </div>

          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
            placeholder="Lý do xin nghỉ..."
            className="w-full px-3 py-2 border rounded-lg resize-none"
          />

          <div className="flex gap-3 pt-2">
            <button onClick={() => setDialogOpen(false)} className="flex-1 py-2.5 border rounded-xl">Hủy</button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl disabled:opacity-50"
            >
              Gửi đơn
            </button>
          </div>
        </div>
      </AppModal>
    </div>
  )
}