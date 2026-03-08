export const LEAVE_TYPES = [
  { value: "ANNUAL",    label: "Nghỉ phép năm" },
  { value: "SICK",      label: "Nghỉ bệnh" },
  { value: "MATERNITY", label: "Nghỉ thai sản" },
    { value: "RESIGNATION", label: "Đơn xin nghỉ việc" },
] as const

export type LeaveTypeValue = (typeof LEAVE_TYPES)[number]["value"]

export const LEAVE_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  LEAVE_TYPES.map((t) => [t.value, t.label])
)

export const STATUS_CONFIG = {
  PENDING:  {
    label:     "Chờ duyệt",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  APPROVED: {
    label:     "Đã duyệt",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  REJECTED: {
    label:     "Từ chối",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
} as const

export type StatusKey = keyof typeof STATUS_CONFIG

/** Format Date → "dd/MM/yyyy" để hiển thị */
export function formatDate(date: Date | string): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("vi-VN", {
    day:   "2-digit",
    month: "2-digit",
    year:  "numeric",
  })
}

export function toInputDate(date: Date | string): string {
  if (!date) return ""
  return new Date(date).toISOString().split("T")[0]
}

/** Tính số ngày nghỉ */
export function countDays(start: Date | string, end: Date | string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.round(diff / 86_400_000) + 1)
}






