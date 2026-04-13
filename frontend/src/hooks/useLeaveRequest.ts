import { useCallback, useEffect, useState } from "react"
import { useEmployeeStore } from "@/stores/employee.store"
import { useClientTable } from "@/hooks/useClientTable"
import { useConfirmAction } from "@/hooks/useConfirmAction"
import type { CreateLeaveRequestDto } from "@/types/leave.types"

const TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Nghỉ phép",
  SICK: "Nghỉ bệnh",
  MATERNITY: "Nghỉ thai sản",
  RESIGNATION: "Đơn nghỉ việc",
}

export const useLeaveRequest = () => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const [form, setForm] = useState<CreateLeaveRequestDto>({
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
  const { confirmAndRun } = useConfirmAction()

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
    fetchMyLeaveRequests()
  }, [fetchMyLeaveRequests])

  const handleChange = (key: keyof CreateLeaveRequestDto, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      alert("Vui lòng điền đầy đủ thông tin")
      return
    }
    await createLeaveRequest(form)
    setForm({ type: "ANNUAL", startDate: "", endDate: "", reason: "" })
    setDialogOpen(false)
  }

  const handleDelete = useCallback(async (id: string) => {
    await confirmAndRun({
      message: "Bạn có chắc muốn xóa đơn này?",
      action: () => deleteLeaveRequest(id),
    })
  }, [confirmAndRun, deleteLeaveRequest])

  return {
    // Data
    isLoadingLeave,
    pagedData,
    meta,
    searchTerm,
    setSearchTerm,
    page,
    setPage,

    // Form state
    dialogOpen,
    setDialogOpen,
    form,

    // Handlers
    handleChange,
    handleSubmit,
    handleDelete,
  }
}