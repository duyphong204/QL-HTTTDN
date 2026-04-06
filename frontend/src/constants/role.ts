import type { Role } from "@/types/auth.type";

export const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  ADMIN: { label: "Quản trị viên", color: "bg-red-100 text-red-600" },
  HR_MANAGER: { label: "Quản lý Nhân sự", color: "bg-blue-100 text-blue-600" },
  WAREHOUSE_MANAGER: { label: "Quản lý Kho", color: "bg-emerald-100 text-emerald-600" },
  SALES_MANAGER: { label: "Quản lý Kinh doanh", color: "bg-purple-100 text-purple-600" },
  EMPLOYEE: { label: "Nhân viên", color: "bg-gray-100 text-gray-700" },
  CUSTOMER: { label: "Khách hàng", color: "bg-gray-100 text-gray-500" },
};

export const ROLE_OPTIONS: Array<{ value: Role; label: string }> = (
  Object.entries(ROLE_BADGE) as Array<[Role, { label: string; color: string }]>
).map(([value, config]) => ({
  value,
  label: config.label,
}));

const EMPLOYEE_ROLE_VALUES: Role[] = [
  "HR_MANAGER",
  "WAREHOUSE_MANAGER",
  "SALES_MANAGER",
  "EMPLOYEE",
]

export const EMPLOYEE_ROLE_OPTIONS: Array<{ value: Role; label: string }> = EMPLOYEE_ROLE_VALUES.map((value) => ({
  value,
  label: ROLE_BADGE[value].label,
}));
