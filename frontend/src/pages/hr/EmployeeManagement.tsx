import { useState } from "react"
import { useHrStore } from "@/store/hr.store"

import { UserPlus, Pencil, Trash2, Eye } from "lucide-react"

import { EmployeeFormModal } from "./components/EmployeeFormModal"
import { EmployeeDetailModal } from "./components/EmployeeDetailModal"

import type { Employee } from "@/types/hr.type"
import type { CreateEmployeeDto, UpdateEmployeeDto } from "@/types/hr.type"
import { ROLE_BADGE } from "@/constants/role"
import { usePaginatedList } from "@/hooks/usePaginatedList"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { PaginationControls } from "@/components/common/PaginationControls"

export default function EmployeeManagement() {
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

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const employeeList = Array.isArray(employees) ? employees : []

  const getPositionBadge = (position?: string) => {
    if (!position) {
      return {
        label: "—",
        color: "bg-gray-100 text-gray-600",
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
      color: "bg-indigo-100 text-indigo-700",
    }
  }

  const { searchTerm, setSearchTerm, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchEmployees,
    debounceMs: 400,
  })

  const openCreateModal = () => {
    setEditingEmployee(null)
    setModalOpen(true)
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setModalOpen(true)
  }

  const handleViewDetail = async (id: string) => {
    await fetchEmployeeById(id)
  }

  const handleDelete = async (id: string, name?: string) => {
    if (confirm(`Bạn có chắc muốn xoá nhân viên ${name}?`)) {
      await deleteEmployee(id)
    }
  }

  const handleSubmit = async (data: CreateEmployeeDto | UpdateEmployeeDto) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, data as UpdateEmployeeDto)
    } else {
      await createEmployee(data as CreateEmployeeDto)
    }

    setModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý nhân viên
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Quản lý hồ sơ và thông tin nhân sự
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            Thêm nhân viên
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2 overflow-hidden">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm kiếm nhân viên..."
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Họ tên</th>
                  <th className="px-6 py-4">Phòng ban</th>
                  <th className="px-6 py-4">Chức vụ</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Điện thoại</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loadingEmployees ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : employeeList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      Không tìm thấy nhân viên.
                    </td>
                  </tr>
                ) : (
                  employeeList.map((emp) => {
                    const badge = getPositionBadge(emp.position)

                    return (
                    <tr key={emp.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-6 py-4 font-mono text-gray-900">
                        {emp.code}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {emp.user?.profile?.fullName || "—"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {emp.department || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {emp.user?.email || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {emp.user?.profile?.phone || "—"}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewDetail(emp.id)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Sửa nhân viên"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(emp.id, emp.user?.profile?.fullName)
                            }
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Xóa nhân viên"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls 
            meta={meta} 
            currentPage={filters.page} 
            isLoading={loadingEmployees}
            onPageChange={goToPage} 
          />
        </div>
      </div>

      <EmployeeFormModal
        key={editingEmployee?.id || "create-employee"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingEmployee={editingEmployee}
        onSubmit={handleSubmit}
      />

      <EmployeeDetailModal
        employee={selectedEmployee}
        isLoading={loadingEmployeeDetail}
        onClose={clearSelectedEmployee}
      />
    </div>
  )
}