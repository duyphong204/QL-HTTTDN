import { useEffect } from "react"
import dayjs from "dayjs"
import { Check, X, RefreshCw, Clock, FileText } from "lucide-react"

import { useHrStore } from "@/store/hr.store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const TYPE_LABEL: Record<string, string> = {
  SICK: "Nghỉ Ốm",
  ANNUAL: "Nghỉ Phép",
  MATERNITY: "Thai Sản",
  RESIGNATION: "Xin Nghỉ Việc"
}

const STATUS_CONFIG = {
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  REJECTED: { label: "Từ chối", className: "bg-rose-50 text-rose-700 border-rose-100" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-100" }
}

export default function LeaveRequestManagement() {
  const {
    leaveRequests,
    loadingLeaveRequests,
    fetchLeaveRequests,
    approveLeaveRequest
  } = useHrStore()

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
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Quản lý đơn từ
            </h1>
            <p className="text-slate-500 text-[15px]">
              Theo dõi và xử lý các yêu cầu nghỉ phép của nhân sự.
            </p>
          </div>

          <Button 
            variant="outline" 
            onClick={fetchLeaveRequests}
            disabled={loadingLeaveRequests}
            className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 h-11 px-5"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingLeaveRequests ? 'animate-spin' : ''}`} />
            Làm mới dữ liệu
          </Button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Nhân viên</th>
                  <th className="px-6 py-5 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Loại đơn</th>
                  <th className="px-6 py-5 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Thời gian nghỉ</th>
                  <th className="px-6 py-5 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Lý do</th>
                  <th className="px-6 py-5 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-5 text-center text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loadingLeaveRequests ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-3/4"></div></td>
                    </tr>
                  ))
                ) : leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <FileText size={40} className="opacity-20" />
                        <p className="font-medium">Hiện tại chưa có đơn cần xử lý</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                            {req.employeeName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{req.employeeName}</div>
                            <div className="text-[12px] text-slate-400 flex items-center gap-1">
                              <Clock size={12} /> {dayjs(req.createdAt).format("DD/MM/YYYY")}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <Badge variant="outline" className="font-medium rounded-lg border-slate-200 bg-slate-50 text-slate-700 px-2.5">
                          {TYPE_LABEL[req.type] || req.type}
                        </Badge>
                      </td>

                      <td className="px-6 py-5">
                        <div className="text-slate-700 text-sm font-medium">
                          {dayjs(req.startDate).format("DD/MM")} — {dayjs(req.endDate).format("DD/MM/YYYY")}
                        </div>
                      </td>

                      <td className="px-6 py-5 max-w-50">
                        <p className="text-slate-500 text-sm truncate italic" title={req.reason}>
                          "{req.reason}"
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <Badge className={`px-3 py-1 rounded-full border shadow-none font-semibold text-[11px] ${STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG]?.className}`}>
                          {STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG]?.label || req.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {req.status === "PENDING" ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                                className="h-9 w-9 p-0 rounded-xl text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-100 transition-all"
                              >
                                <Check size={18} />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                                className="h-9 w-9 p-0 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all"
                              >
                                <X size={18} />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
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
        </div>
      </div>
    </div>
  )
}