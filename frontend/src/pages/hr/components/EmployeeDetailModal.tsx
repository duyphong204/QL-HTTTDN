import { Loader2, X, Clock } from "lucide-react"
import type { Employee } from "@/types/hr.type"
import { AppModal } from "@/components/common/AppModal"

interface Props {
  employee: Employee | null
  isLoading?: boolean
  onClose: () => void
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "—"
  return `${value.toLocaleString("vi-VN")} ₫`
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Đang hiện tại"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("vi-VN")
}

export function EmployeeDetailModal({ employee, isLoading = false, onClose }: Props) {
  if (!employee && !isLoading) return null

  return (
    <AppModal
      isOpen={!!employee || isLoading}
      onClose={onClose}
      title="Chi tiết Nhân sự"
      maxWidthClassName="max-w-3xl"
    >
      <div className="relative p-6 md:p-8">
        <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center">
          <X size={18} />
        </button>

        {isLoading ? (
          <div className="h-52 flex items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} /> Đang tải dữ liệu...
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div><p className="text-xs text-gray-500">Họ tên</p><p className="font-semibold text-gray-900">{employee?.user?.profile?.fullName || "—"}</p></div>
              <div><p className="text-xs text-gray-500">Mã NV</p><p className="font-semibold text-gray-900">{employee?.code || "—"}</p></div>
              <div><p className="text-xs text-gray-500">Phòng ban</p><p className="font-semibold text-gray-900">{employee?.department || "—"}</p></div>
              <div><p className="text-xs text-gray-500">Chức vụ</p><p className="font-semibold text-gray-900">{employee?.position || "—"}</p></div>
            </div>

            {/* BẢNG LỊCH SỬ CHỨC VỤ VÀ LƯƠNG */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" /> Lịch sử Công tác & Lương
              </h3>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Giai đoạn</th>
                      <th className="px-4 py-3 font-semibold">Phòng ban</th>
                      <th className="px-4 py-3 font-semibold">Chức vụ</th>
                      <th className="px-4 py-3 font-semibold text-right">Mức lương</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employee?.jobHistories && employee.jobHistories.length > 0 ? (
                      employee.jobHistories.map((history) => (
                        <tr key={history.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(history.startDate)} - {formatDate(history.endDate)}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{history.department}</td>
                          <td className="px-4 py-3 text-gray-800">{history.position}</td>
                          <td className="px-4 py-3 text-right font-bold text-blue-600">
                            {formatCurrency(history.baseSalary)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Chưa có lịch sử công tác</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </AppModal>
  )
}
