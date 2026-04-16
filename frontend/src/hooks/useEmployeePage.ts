import { useCallback } from 'react'
import { toast } from 'sonner'
import { useHrEmployeeStore } from '@/stores/hrEmployee.store'
import { ROLE_BADGE } from '@/utils/role'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { useEntityModal } from '@/hooks/useEntityModal'
import { useConfirmAction } from '@/hooks/useConfirmAction'
import { employeeService } from '@/services/hr.service'
import { getErrorMessage } from '@/stores/store.helpers'
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types'
import type { SortOrder } from '@/types/common.types'

export const useEmployee = () => {
  const {
    employees,
    meta,
    loadingEmployees,
    selectedEmployee,
    loadingEmployeeDetail,
    filters,
    setFilters,
    setEmployees,
    setMeta,
    setLoadingEmployees,
    setSelectedEmployee,
    setLoadingEmployeeDetail,
    clearSelectedEmployee,
  } = useHrEmployeeStore()

  const {
    modalOpen,
    editingEntity: editingEmployee,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<Employee>()

  const { confirmAndRun } = useConfirmAction()
  const employeeList = Array.isArray(employees) ? employees : []

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true)
    try {
      const response = await employeeService.getEmployees({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        sortBy: filters.sortBy as 'code' | 'department' | 'position' | 'joinDate',
        sortOrder: filters.sortOrder as SortOrder,
        department: filters.department || undefined,
        position: filters.position || undefined,
        isActive: filters.isActive,
      })
      setEmployees(response.data)
      setMeta(response.meta)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể tải danh sách nhân viên'))
    } finally {
      setLoadingEmployees(false)
    }
  }, [filters, setEmployees, setLoadingEmployees, setMeta])

  const fetchEmployeeById = useCallback(
    async (id: string) => {
      setLoadingEmployeeDetail(true)
      try {
        const employee = await employeeService.getEmployeeById(id)
        setSelectedEmployee(employee)
        return employee
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Không thể tải chi tiết nhân viên'))
        return null
      } finally {
        setLoadingEmployeeDetail(false)
      }
    },
    [setLoadingEmployeeDetail, setSelectedEmployee],
  )

  const createEmployee = useCallback(
    async (data: CreateEmployeeDto) => {
      try {
        await employeeService.createEmployee(data)
        await fetchEmployees()
        toast.success('Thêm nhân sự thành công')
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Thêm nhân sự thất bại'))
        throw error
      }
    },
    [fetchEmployees],
  )

  const updateEmployee = useCallback(
    async (id: string, data: UpdateEmployeeDto) => {
      try {
        await employeeService.updateEmployee(id, data)
        await fetchEmployees()
        toast.success('Cập nhật nhân sự thành công')
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Cập nhật nhân sự thất bại'))
        throw error
      }
    },
    [fetchEmployees],
  )

  const deleteEmployee = useCallback(
    async (id: string) => {
      try {
        await employeeService.deleteEmployee(id)
        setEmployees(employeeList.filter((emp) => emp.id !== id))
        await fetchEmployees()
        toast.success('Đã xóa nhân sự')
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Xóa nhân sự thất bại'))
      }
    },
    [employeeList, fetchEmployees, setEmployees],
  )

  const { searchTerm, setSearchTerm, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchEmployees,
    debounceMs: 400,
  })

  const getPositionBadge = (position?: string) => {
    if (!position) {
      return {
        label: '—',
        color: 'bg-gray-100 text-gray-600',
      }
    }

    if (position in ROLE_BADGE) {
      const config = ROLE_BADGE[position as keyof typeof ROLE_BADGE]
      return {
        label: config.label,
        color: config.color,
      }
    }

    return {
      label: position,
      color: 'bg-indigo-100 text-indigo-700',
    }
  }

  const handleViewDetail = async (id: string) => {
    await fetchEmployeeById(id)
  }

  const handleDelete = async (id: string, name?: string) => {
    await confirmAndRun({
      message: `Bạn có chắc muốn xoá nhân viên ${name ?? ''}?`,
      action: () => deleteEmployee(id),
    })
  }

  const handleFormSubmit = async (data: CreateEmployeeDto | UpdateEmployeeDto) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, data as UpdateEmployeeDto)
    } else {
      await createEmployee(data as CreateEmployeeDto)
    }

    closeModal()
  }

  return {
    employeeList,
    meta,
    loadingEmployees,
    selectedEmployee,
    loadingEmployeeDetail,
    filters,
    modalOpen,
    editingEmployee,
    searchTerm,
    setSearchTerm,
    goToPage,
    clearSelectedEmployee,
    openCreateModal,
    openEditModal,
    closeModal,
    getPositionBadge,
    handleViewDetail,
    handleDelete,
    handleFormSubmit,
  }
}

export const useEmployeePage = useEmployee
