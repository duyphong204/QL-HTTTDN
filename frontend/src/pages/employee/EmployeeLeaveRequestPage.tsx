import { useCallback, useEffect, useState } from "react"
import { FilePlus2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLeaveRequestStore } from "@/store/leaveRequest.store"
import { LeaveRequestDialog } from "@/components/leave-request/LeaveRequestDialog"
import { LeaveRequestTable } from "@/components/leave-request/LeaveRequestTable"
import { LeaveStatCards } from "@/components/leave-request/LeaveStatCards"
import type { CreateLeaveRequestValues } from "@/schemas/employee.schema"
import type { LeaveRequest } from "@/types/hr.type"

export default function EmployeeLeaveRequestPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    myLeaveRequests,
    loading,
    fetchMyLeaveRequests,
    createLeaveRequest,
    deleteLeaveRequest,
  } = useLeaveRequestStore()

  useEffect(() => {
    void fetchMyLeaveRequests()
  }, [fetchMyLeaveRequests])

  const handleSubmit = useCallback(async (data: CreateLeaveRequestValues) => {
    await createLeaveRequest(data)
  }, [createLeaveRequest])

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn này?")) {
      await deleteLeaveRequest(id)
    }
  }, [deleteLeaveRequest])

  const renderActions = useCallback((request: LeaveRequest) => {
    if (request.status !== "PENDING") return null
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void handleDelete(request.id)}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        Xóa
      </Button>
    )
  }, [handleDelete])

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Đơn xin nghỉ</h1>
          <p className="mt-1 text-sm text-gray-500">Nộp và theo dõi đơn xin nghỉ của bạn</p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="shrink-0 gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <FilePlus2 size={16} />
          Nộp đơn
        </Button>
      </div>

      <LeaveStatCards requests={myLeaveRequests} />

      <LeaveRequestTable
        requests={myLeaveRequests}
        loading={loading}
        renderActions={renderActions}
      />

      <LeaveRequestDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}