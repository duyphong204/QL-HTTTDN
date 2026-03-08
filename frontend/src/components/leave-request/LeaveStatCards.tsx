
import { Inbox, Clock, CheckCircle2, XCircle } from "lucide-react"
import type { LeaveRequest }                   from "@/types/hr.type"

// ─── Single card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon:  React.ElementType
  color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none text-gray-900">{value}</p>
        <p className="mt-0.5 text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface LeaveStatCardsProps {
  requests: LeaveRequest[]
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LeaveStatCards({ requests }: LeaveStatCardsProps) {
  const total    = requests.length
  const pending  = requests.filter((r) => r.status === "PENDING").length
  const approved = requests.filter((r) => r.status === "APPROVED").length
  const rejected = requests.filter((r) => r.status === "REJECTED").length

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Tổng đơn"
        value={total}
        icon={Inbox}
        color="bg-blue-50 text-blue-500"
      />
      <StatCard
        label="Chờ duyệt"
        value={pending}
        icon={Clock}
        color="bg-amber-50 text-amber-500"
      />
      <StatCard
        label="Đã duyệt"
        value={approved}
        icon={CheckCircle2}
        color="bg-emerald-50 text-emerald-500"
      />
      <StatCard
        label="Từ chối"
        value={rejected}
        icon={XCircle}
        color="bg-red-50 text-red-500"
      />
    </div>
  )
}