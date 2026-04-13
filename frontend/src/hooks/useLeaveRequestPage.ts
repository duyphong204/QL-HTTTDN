import { useEffect } from 'react'
import dayjs from 'dayjs'
import { useHrStore } from '@/stores/hr.store'
import { useClientTable } from '@/hooks/useClientTable'
import { useConfirmAction } from '@/hooks/useConfirmAction'

export const LEAVE_TYPE_LABEL: Record<string, string> = {
  SICK: 'Nghỉ Ốm',
  ANNUAL: 'Nghỉ Phép',
  MATERNITY: 'Thai Sản',
  RESIGNATION: 'Xin Nghỉ Việc',
}

export const LEAVE_STATUS_CONFIG = {
  APPROVED: { label: 'Đã duyệt', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  REJECTED: { label: 'Từ chối', className: 'bg-rose-50 text-rose-700 border-rose-100' },
  PENDING: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 border-amber-100' },
}

export const useLeaveRequestPage = () => {
  const { leaveRequests, loadingLeaveRequests, fetchLeaveRequests, approveLeaveRequest } = useHrStore()
  const { confirmAndRun } = useConfirmAction()

  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } = useClientTable({
    data: leaveRequests,
    pageSize: 10,
    searchFn: (req, keyword) => {
      const name = req.employeeName?.toLowerCase() ?? ''
      const reason = req.reason?.toLowerCase() ?? ''
      const type = (LEAVE_TYPE_LABEL[req.type] ?? req.type).toLowerCase()
      return name.includes(keyword) || reason.includes(keyword) || type.includes(keyword)
    },
  })

  useEffect(() => {
    void fetchLeaveRequests()
  }, [fetchLeaveRequests])

  const handleRefresh = () => {
    void fetchLeaveRequests()
  }

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const isApproved = status === 'APPROVED'

    await confirmAndRun({
      message: isApproved ? 'Duyệt đơn này?' : 'Từ chối đơn này?',
      action: () => approveLeaveRequest(id, status),
    })
  }

  const getEmployeeInitial = (employeeName?: string) => employeeName?.charAt(0) || 'U'

  const formatCreatedDate = (createdAt?: string) => dayjs(createdAt).format('DD/MM/YYYY')

  const formatLeaveRange = (startDate: string, endDate: string) =>
    `${dayjs(startDate).format('DD/MM')} - ${dayjs(endDate).format('DD/MM/YYYY')}`

  return {
    loadingLeaveRequests,
    searchTerm,
    page,
    pagedData,
    meta,
    setSearchTerm,
    setPage,
    handleRefresh,
    handleUpdateStatus,
    getEmployeeInitial,
    formatCreatedDate,
    formatLeaveRange,
  }
}
