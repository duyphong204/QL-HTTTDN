import { useCallback, useEffect, useState } from "react"
import dayjs from "dayjs"
import { FilePlus2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useEmployeeStore } from "@/store/employee.store"

import type { CreateLeaveRequestValues } from "@/schemas/employee.schema"
import type { LeaveRequest } from "@/types/hr.type"

export default function EmployeeLeaveRequestPage() {

  const [dialogOpen, setDialogOpen] = useState(false)

  const [form, setForm] = useState<CreateLeaveRequestValues>({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const {
    myLeaveRequests,
    isLoadingLeave,
    fetchMyLeaveRequests,
    createLeaveRequest,
    deleteLeaveRequest,
  } = useEmployeeStore()

  useEffect(() => {
    fetchMyLeaveRequests()
  }, [fetchMyLeaveRequests])

  const handleChange = (key: keyof CreateLeaveRequestValues, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async () => {
    await createLeaveRequest(form)

    setForm({
      type: "ANNUAL",
      startDate: "",
      endDate: "",
      reason: "",
    })

    setDialogOpen(false)
  }

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn này?")) {
      await deleteLeaveRequest(id)
    }
  }, [deleteLeaveRequest])

  const renderStatus = (status: string) => {

    if (status === "PENDING") {
      return (
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
          Chờ duyệt
        </span>
      )
    }

    if (status === "APPROVED") {
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          Đã duyệt
        </span>
      )
    }

    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
        Từ chối
      </span>
    )
  }

  return (

    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <h1 className="text-2xl font-bold text-gray-900">
              Đơn xin nghỉ
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Nộp và theo dõi đơn xin nghỉ của bạn
            </p>

          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FilePlus2 size={16} />
            Nộp đơn
          </Button>

        </div>

        {/* TABLE */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm text-left whitespace-nowrap">

              <thead className="border-b bg-white text-gray-700 font-semibold">

                <tr>

                  <th className="px-6 py-4">Nhân viên</th>
                  <th className="px-6 py-4">Loại đơn</th>
                  <th className="px-6 py-4">Từ ngày</th>
                  <th className="px-6 py-4">Đến ngày</th>
                  <th className="px-6 py-4">Lý do</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center"></th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-50">

                {isLoadingLeave && (

                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>

                )}

                {!isLoadingLeave && myLeaveRequests.length === 0 && (

                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      Chưa có đơn xin nghỉ
                    </td>
                  </tr>

                )}

                {myLeaveRequests.map((request: LeaveRequest) => (

                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {request.employeeName || "Bạn"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">

                      {request.type === "ANNUAL" && "Nghỉ phép"}
                      {request.type === "SICK" && "Nghỉ bệnh"}
                      {request.type === "MATERNITY" && "Nghỉ thai sản"}
                      {request.type === "RESIGNATION" && "Đơn nghỉ việc"}

                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {dayjs(request.startDate).format("DD/MM/YYYY")}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {dayjs(request.endDate).format("DD/MM/YYYY")}
                    </td>

                    <td
                      className="px-6 py-4 max-w-xs truncate text-gray-600"
                      title={request.reason}
                    >
                      {request.reason}
                    </td>

                    <td className="px-6 py-4">
                      {renderStatus(request.status)}
                    </td>

                    <td className="px-6 py-4 text-center">

                      {request.status === "PENDING" && (

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(request.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Xóa
                        </Button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* DIALOG */}

      {dialogOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-lg font-semibold">
                Nộp đơn xin nghỉ
              </h2>

              <button
                onClick={() => setDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <div>

                <label className="text-sm font-medium">
                  Loại đơn
                </label>

                <select
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >

                  <option value="ANNUAL">Nghỉ phép</option>
                  <option value="SICK">Nghỉ bệnh</option>
                  <option value="UNPAID">Nghỉ không lương</option>

                </select>

              </div>

              <div>

                <label className="text-sm font-medium">
                  Từ ngày
                </label>

                <input
                  type="date"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Đến ngày
                </label>

                <input
                  type="date"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Lý do
                </label>

                <textarea
                  rows={3}
                  placeholder="Nhập lý do xin nghỉ..."
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={form.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                />

              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-black text-white hover:bg-gray-900"
              >
                Gửi đơn
              </Button>

            </div>

          </div>

        </div>

      )}

    </div>

  )
}