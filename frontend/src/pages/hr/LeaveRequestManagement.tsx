import { useEffect } from "react"
import dayjs from "dayjs"
import { Check, X, RefreshCw } from "lucide-react"

import { useHrStore } from "@/store/hr.store"

const TYPE_LABEL: Record<string, string> = {
  SICK: "Nghỉ Ốm",
  ANNUAL: "Nghỉ Phép",
  MATERNITY: "Thai Sản",
  RESIGNATION: "Xin Nghỉ Việc"
}

const STATUS_BADGE = {
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  PENDING: "bg-yellow-100 text-yellow-700"
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

  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {

    const message =
      status === "APPROVED"
        ? "Xác nhận duyệt đơn này?"
        : "Xác nhận từ chối đơn này?"

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
              Quản lý đơn nghỉ phép
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Duyệt đơn nghỉ phép và nghỉ việc của nhân viên
            </p>
          </div>

          <button
            onClick={fetchLeaveRequests}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>

        </div>


        {/* TABLE CONTAINER */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm whitespace-nowrap">

              {/* TABLE HEADER */}

              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">

                <tr>
                  <th className="px-6 py-4">Nhân viên</th>
                  <th className="px-6 py-4">Thời gian gửi</th>
                  <th className="px-6 py-4">Loại đơn</th>
                  <th className="px-6 py-4">Thời gian nghỉ</th>
                  <th className="px-6 py-4">Lý do</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>

              </thead>


              {/* TABLE BODY */}

              <tbody className="divide-y divide-gray-50">

                {loadingLeaveRequests ? (

                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>

                ) : leaveRequests.length === 0 ? (

                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      Không có đơn xin phép
                    </td>
                  </tr>

                ) : (

                  leaveRequests.map((req) => (

                    <tr
                      key={req.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >

                      {/* Employee */}

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {req.employeeName || "—"}
                      </td>
                      {/* Created At */}
                      <td className="px-6 py-4 text-gray-600">
                        {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
                      </td>

                      {/* Type */}

                      <td className="px-6 py-4 text-gray-600">
                        {TYPE_LABEL[req.type] || req.type}
                      </td>


                      {/* Date */}

                      <td className="px-6 py-4 text-gray-600">
                        {dayjs(req.startDate).format("DD/MM/YYYY")} -{" "}
                        {dayjs(req.endDate).format("DD/MM/YYYY")}
                      </td>


                      {/* Reason */}

                      <td
                        className="px-6 py-4 max-w-xs truncate text-gray-600"
                        title={req.reason}
                      >
                        {req.reason}
                      </td>


                      {/* Status */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[req.status]}`}
                        >
                          {req.status}
                        </span>

                      </td>


                      {/* Actions */}

                      <td className="px-6 py-4 text-center">

                        {req.status === "PENDING" ? (

                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition">

                            <button
                              onClick={() =>
                                handleUpdateStatus(req.id, "APPROVED")
                              }
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition"
                              title="Duyệt đơn"
                            >
                              <Check size={18} />
                            </button>

                            <button
                              onClick={() =>
                                handleUpdateStatus(req.id, "REJECTED")
                              }
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Từ chối đơn"
                            >
                              <X size={18} />
                            </button>

                          </div>

                        ) : (

                          <span className="text-gray-400 italic text-sm">
                            Đã xử lý
                          </span>

                        )}

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