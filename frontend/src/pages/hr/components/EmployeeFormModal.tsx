import { useState } from "react"
import { ROLE_OPTIONS } from "@/constants/role"
import type { Role } from "@/types/auth.type"
import type { CreateEmployeeDto, UpdateEmployeeDto, Employee } from "@/types/hr.type"

type EmployeeFormState = {
  email: string
  password: string
  fullName: string
  department: string
  position: Role | ""
  baseSalary: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEmployeeDto | UpdateEmployeeDto) => Promise<void>
  editingEmployee?: Employee | null
}

export function EmployeeFormModal({ isOpen, onClose, onSubmit, editingEmployee }: Props) {
  const initialForm: EmployeeFormState = editingEmployee
    ? {
        email: "",
        password: "",
        fullName: editingEmployee.user?.profile?.fullName || "",
        department: editingEmployee.department || "",
        position: editingEmployee.position || "",
        baseSalary: editingEmployee.baseSalary || 0,
      }
    : {
        email: "",
        password: "",
        fullName: "",
        department: "",
        position: "",
        baseSalary: 0,
      }

  const [form, setForm] = useState<EmployeeFormState>({
    ...initialForm,
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === "baseSalary" ? Number(value) : value })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingEmployee) {
      const payload: UpdateEmployeeDto = {
        department: form.department,
        position: form.position || undefined,
        baseSalary: form.baseSalary,
      }

      await onSubmit(payload)
      return
    }

    const payload: CreateEmployeeDto = {
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      department: form.department,
      position: form.position || undefined,
      baseSalary: form.baseSalary,
    }

    await onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingEmployee ? "Thay đổi phòng ban / chức vụ / lương" : "Thêm nhân viên mới"}
        </h2>
        {editingEmployee && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100">
            Lưu ý: Thay đổi chức vụ hoặc lương lúc này sẽ hệ thống sẽ tự động chốt lịch sử cũ (end date) và tạo mốc lịch sử mới bắt đầu từ hôm nay.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {!editingEmployee && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email đăng nhập *</label>
                <input required name="email" type="email" value={form.email} onChange={handleChange} className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                <input required name="password" type="password" value={form.password} onChange={handleChange} className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
            <input required name="fullName" value={form.fullName} onChange={handleChange} className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" disabled={!!editingEmployee} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
              <input required name="department" value={form.department} onChange={handleChange} className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quyền / Chức vụ</label>
              <select required name="position" value={form.position} onChange={handleChange} className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white">
                <option value="" disabled>Chọn quyền</option>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương cơ bản (VNĐ) *</label>
            <input required name="baseSalary" type="number" min={0} value={form.baseSalary} onChange={handleChange} className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Huỷ
            </button>
            <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              {editingEmployee ? "Lưu thay đổi" : "Tạo nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
