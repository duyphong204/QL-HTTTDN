import { useEffect, useState } from "react"
import { useHrStore } from "@/store/hr.store"

import { Search, UserPlus, Pencil, Trash2, Eye } from "lucide-react"

import { EmployeeFormModal } from "@/components/hr/EmployeeFormModal"
import { EmployeeDetailModal } from "@/components/hr/EmployeeDetailModal"

import type { Employee } from "@/types/hr.type"
import type { CreateEmployeeDto } from "@/types/hr.type"

const POSITION_BADGE: Record<string, string> = {
  "HR Manager": "bg-blue-100 text-blue-600",
  "Developer": "bg-purple-100 text-purple-600",
  "Accountant": "bg-emerald-100 text-emerald-600",
  "Sales": "bg-orange-100 text-orange-600",
}

export default function EmployeeManagement() {
  const {
    employees,
    loadingEmployees,
    selectedEmployee,
    loadingEmployeeDetail,
    fetchEmployees,
    fetchEmployeeById,
    clearSelectedEmployee,
    deleteEmployee,
    createEmployee,
    updateEmployee
  } = useHrStore()

  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const filteredEmployees = employees.filter((emp) => {
    const name = emp.user?.profile?.fullName?.toLowerCase() || ""

    return (
      emp.code.toLowerCase().includes(search.toLowerCase()) ||
      name.includes(search.toLowerCase())
    )
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

  const handleSubmit = async (data: CreateEmployeeDto) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, data)
    } else {
      await createEmployee(data)
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
          <div className="p-4 border-b border-gray-50">
            <div className="relative max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm nhân viên..."
                className="w-full h-11 pl-11 pr-4 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
              />
            </div>
          </div>

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
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      Không tìm thấy nhân viên.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
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
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            POSITION_BADGE[emp.position || ""] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {emp.position || "—"}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EmployeeFormModal
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