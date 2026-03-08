
import { Inbox } from "lucide-react"
import { Badge }from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LEAVE_TYPE_LABEL,
  STATUS_CONFIG,
  formatDate,
  countDays,
} from "./leave-request.constants"
import type { StatusKey } from "./leave-request.constants"
import type { LeaveRequest } from "@/types/hr.type"

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG.PENDING
  return <Badge className={cfg.className}>{cfg.label}</Badge>
}

function EmptyRows({ colSpan }: { colSpan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
            <Inbox size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">Chưa có đơn nghỉ nào</p>
          <p className="text-xs text-gray-400">Nhấn "Nộp đơn" để tạo đơn mới</p>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingRows({ colSpan }: { colSpan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-12 text-center">
        <div className="inline-flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-xs text-gray-400">Đang tải...</p>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface LeaveRequestTableProps {
  requests:       LeaveRequest[]
  loading?:       boolean
  /** Optional slot: render cột Thao tác — dùng cho HR page */
  renderActions?: (request: LeaveRequest) => React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LeaveRequestTable({
  requests,
  loading       = false,
  renderActions,
}: LeaveRequestTableProps) {
  const hasActions = !!renderActions
  const colSpan    = hasActions ? 7 : 6

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại đơn</TableHead>
                <TableHead>Từ ngày</TableHead>
                <TableHead>Đến ngày</TableHead>
                <TableHead>Số ngày</TableHead>
                <TableHead className="max-w-[200px]">Lý do</TableHead>
                <TableHead>Trạng thái</TableHead>
                {hasActions && (
                  <TableHead className="text-right">Thao tác</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <LoadingRows colSpan={colSpan} />
              ) : requests.length === 0 ? (
                <EmptyRows colSpan={colSpan} />
              ) : (
                requests.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/60">
                    {/* Loại đơn */}
                    <TableCell className="whitespace-nowrap font-medium">
                      {LEAVE_TYPE_LABEL[item.type] ?? item.type}
                    </TableCell>

                    {/* Từ ngày */}
                    <TableCell className="whitespace-nowrap text-gray-600">
                      {formatDate(item.startDate)}
                    </TableCell>

                    {/* Đến ngày */}
                    <TableCell className="whitespace-nowrap text-gray-600">
                      {formatDate(item.endDate)}
                    </TableCell>

                    {/* Số ngày */}
                    <TableCell className="whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {countDays(item.startDate, item.endDate)}
                      </span>
                      <span className="ml-1 text-xs text-gray-400">ngày</span>
                    </TableCell>

                    {/* Lý do */}
                    <TableCell className="max-w-[200px] truncate text-gray-600">
                      {item.reason || "—"}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>

                    {/* Thao tác — chỉ render nếu có prop */}
                    {hasActions && (
                      <TableCell className="text-right">
                        {renderActions(item)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}