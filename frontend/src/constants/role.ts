// constants/role.ts
import type { Role } from "@/types/auth.type"

export const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  ADMIN: { label: "Quản trị viên", color: "bg-red-100 text-red-600" },
  HR_MANAGER: { label: "Quản lý Nhân sự", color: "bg-blue-100 text-blue-600" },
  WAREHOUSE_MANAGER: { label: "Quản lý Kho", color: "bg-emerald-100 text-emerald-600" },
  SALES_MANAGER: { label: "Quản lý Kinh doanh", color: "bg-purple-100 text-purple-600" },
  EMPLOYEE: { label: "Nhân viên", color: "bg-gray-100 text-gray-700" },
  CUSTOMER: { label: "Khách hàng", color: "bg-gray-100 text-gray-500" },
}

export const ROLE_DEPARTMENT_MAP: Partial<Record<Role, string>> = {
  HR_MANAGER: "Nhân sự",
  WAREHOUSE_MANAGER: "Kho vận",
  SALES_MANAGER: "Kinh doanh",
  EMPLOYEE: "Nhân viên",
}

export const EMPLOYEE_ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "HR_MANAGER", label: "Quản lý Nhân sự" },
  { value: "WAREHOUSE_MANAGER", label: "Quản lý Kho" },
  { value: "SALES_MANAGER", label: "Quản lý Kinh doanh" },
  { value: "EMPLOYEE", label: "Nhân viên" },
]
export const ALL_ROLE_OPTIONS = Object.entries(ROLE_BADGE).map(([value, info]) => ({
  value: value as Role,
  label: info.label,
}));
