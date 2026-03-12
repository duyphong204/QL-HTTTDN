import { useState } from "react"
import type { CreateEmployeeDto, Employee } from "@/types/hr.type"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEmployeeDto) => void
  editingEmployee?: Employee | null
}

export function EmployeeFormModal({ isOpen, onClose, onSubmit }: Props) {

  const [form, setForm] = useState<CreateEmployeeDto>({
    email: "",
    password: "",
    fullName: "",
    department: "",
    position: "",
    baseSalary: 0
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target

    setForm({
      ...form,
      [name]: name === "baseSalary" ? Number(value) : value
    })

  }

  const submit = (e: React.FormEvent) => {

    e.preventDefault()
    onSubmit(form)

  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-xl w-100 space-y-4">

        <h2 className="text-lg font-semibold">
          Thêm nhân viên
        </h2>

        <form onSubmit={submit} className="space-y-3">

          <input name="fullName" placeholder="Họ tên" onChange={handleChange} className="input" />
          <input name="email" placeholder="Email" onChange={handleChange} className="input" />
          <input name="password" placeholder="Password" type="password" onChange={handleChange} className="input" />
          <input name="department" placeholder="Phòng ban" onChange={handleChange} className="input" />
          <input name="position" placeholder="Chức vụ" onChange={handleChange} className="input" />
          <input name="baseSalary" placeholder="Lương" type="number" onChange={handleChange} className="input" />

          <div className="flex justify-end gap-2 pt-3">

            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
              Huỷ
            </button>

            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Lưu
            </button>

          </div>

        </form>

      </div>

    </div>

  )

}