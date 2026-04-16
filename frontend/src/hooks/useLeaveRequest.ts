import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useEmployeeStore } from "@/stores/employee.store"
import { useClientTable } from "@/hooks/useClientTable"
import { useConfirmAction } from "@/hooks/useConfirmAction"
import { leaveRequestService } from "@/services/hr.service"
import { getErrorMessage } from "@/stores/store.helpers"
import { REQUIRED_FIELDS_MESSAGE, hasEmptyRequiredValue } from "@/utils/validation"
import type { CreateLeaveRequestDto } from "@/types/leave.types"

const TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Nghỉ phép",
  SICK: "Nghỉ bệnh",
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
    setMyLeaveRequests,
    setLoadingLeave,
  } = useEmployeeStore()
  const { confirmAndRun } = useConfirmAction()

  const fetchMyLeaveRequests = useCallback(async () => {
    setLoadingLeave(true)
    try {
      const data = await leaveRequestService.getMyLeaveRequests()
      setMyLeaveRequests(data)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể tải đơn nghỉ phép!"))
    } finally {
      setLoadingLeave(false)
    }
  }, [setLoadingLeave, setMyLeaveRequests])

  const createLeaveRequest = useCallback(
    async (payload: CreateLeaveRequestDto) => {
      try {
        const newLeaveRequest = await leaveRequestService.createLeaveRequest(payload)
        setMyLeaveRequests([newLeaveRequest, ...myLeaveRequests])
        toast.success("Gửi đơn nghỉ phép thành công!")
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Không thể gửi đơn nghỉ phép!"))
        throw error
      }
    },
    [myLeaveRequests, setMyLeaveRequests],
  )

  const deleteLeaveRequest = useCallback(
    async (id: string) => {
      try {
        await leaveRequestService.deleteLeaveRequest(id)
        setMyLeaveRequests(myLeaveRequests.filter((leave) => leave.id !== id))
        toast.success("Đã xóa đơn nghỉ phép")
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Không thể xóa đơn nghỉ phép"))
      }
    },
    [myLeaveRequests, setMyLeaveRequests],
  )

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
    void fetchMyLeaveRequests()
  }, [fetchMyLeaveRequests])

  const handleChange = (key: keyof CreateLeaveRequestDto, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (hasEmptyRequiredValue([form.startDate, form.endDate, form.reason])) {
      toast.error(REQUIRED_FIELDS_MESSAGE)
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