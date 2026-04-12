import { useCallback, useEffect, useState } from "react"
import { useEmployeeStore } from "@/stores/employee.store"
import { useClientTable } from "@/hooks/useClientTable"
import type { CreateLeaveRequestDto } from "@/types/hr.type"

const TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Nghỉ phép",
  SICK: "Nghỉ bệnh",
  MATERNITY: "Nghỉ thai sản",
  RESIGNATION: "Đơn nghỉ việc",
}

export const useLeaveRequestManagement = () => {
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
    if (window.confirm("Bạn có chắc muốn xóa đơn này?")) {
      await deleteLeaveRequest(id)
    }
  }, [deleteLeaveRequest])

  return {
    // Data
    myLeaveRequests,
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
    setForm,

    // Handlers
    handleChange,
    handleSubmit,
    handleDelete,
  }
}