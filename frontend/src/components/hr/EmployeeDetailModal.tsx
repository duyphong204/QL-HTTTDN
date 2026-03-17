import { Loader2, X } from "lucide-react"
import type { Employee } from "@/types/hr.type"

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
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("vi-VN")
}

function DetailItem({
  label,
  value
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-900 font-semibold text-2xl leading-tight">
        {value || "—"}
      </p>
    </div>
  )
}

export function EmployeeDetailModal({ employee, isLoading = false, onClose }: Props) {
  if (!employee && !isLoading) return null

  const fullName = employee?.user?.profile?.fullName || "—"
  const email = employee?.user?.email || "—"
  const phone = employee?.user?.profile?.phone || "—"
  const address = employee?.user?.profile?.address || "—"
  const department = employee?.department || "—"
  const position = employee?.position || "—"
  const joinDate = formatDate(employee?.joinDate)

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl w-full max-w-3xl p-6 md:p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <X size={18} />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Chi tiết Nhân sự
        </h2>

        {isLoading ? (
          <div className="h-52 flex items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            Đang tải chi tiết nhân viên...
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <DetailItem label="Họ tên" value={fullName} />
              <DetailItem label="Chức vụ" value={position} />
              <DetailItem label="Phòng ban" value={department} />
              <DetailItem label="Ngày vào làm" value={joinDate} />
            </div>

            <div className="space-y-6">
              <DetailItem label="Email" value={email} />
              <DetailItem label="Điện thoại" value={phone} />
              <DetailItem label="Địa chỉ" value={address} />
              <DetailItem label="Lương cơ bản" value={formatCurrency(employee?.baseSalary)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}