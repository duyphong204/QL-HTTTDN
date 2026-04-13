import { useHrStore } from '@/stores/hr.store'
import { ROLE_BADGE } from '@/constants/role'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { useEntityModal } from '@/hooks/useEntityModal'
import { useConfirmAction } from '@/hooks/useConfirmAction'
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types'

export const useEmployeePage = () => {
  const {
    employees,
    meta,
    loadingEmployees,
    selectedEmployee,
    loadingEmployeeDetail,
    fetchEmployees,
    fetchEmployeeById,
    clearSelectedEmployee,
    deleteEmployee,
    createEmployee,
    updateEmployee,
    filters,
    setFilters,
  } = useHrStore()

  const {
    modalOpen,
    editingEntity: editingEmployee,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<Employee>()
  const { confirmAndRun } = useConfirmAction()

  const employeeList = Array.isArray(employees) ? employees : []

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
