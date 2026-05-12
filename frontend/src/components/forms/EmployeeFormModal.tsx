import { useEffect, useState } from "react";
import { AppModal } from "@/components/common/AppModal";
import type { CreateEmployeeDto } from "@/types/employee.types";
import { EMPLOYEE_ROLE_OPTIONS, ROLE_DEPARTMENT_MAP } from "@/utils/role";
import type { Role } from "@/types/auth.types";
import { ROLE_POSITION_MAP, ROLE_SALARY_MAP } from "@/utils/role";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeDto) => Promise<void>;
};

export function EmployeeFormModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  // ================= INIT FORM =================
  const getInitialForm = () => ({
    email: "",
    password: "",
    fullName: "",
    department: "",
    position: "",
    baseSalary: 0,
    role: "EMPLOYEE" as Role,
  });

  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================= RESET FORM =================
  useEffect(() => {
    if (isOpen) {
      setForm(getInitialForm());
      setErrors({});
    }
  }, [isOpen]);

  // ================= HANDLE CHANGE =================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "baseSalary" ? Number(value) || 0 : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ================= ROLE CHANGE =================
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as Role;

    if (!ROLE_POSITION_MAP[role] || !ROLE_SALARY_MAP[role]) {
      console.error(`Invalid role: ${role}`);
      return;
    }

    setForm((prev) => ({
      ...prev,
      role,
      department: ROLE_DEPARTMENT_MAP[role] || "",
      position: ROLE_POSITION_MAP[role] || "",
      baseSalary: ROLE_SALARY_MAP[role] || 0,
    }));
  };

  // ================= VALIDATE =================
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.email) {
      newErrors.email = "Email là bắt buộc";
    }

    if (!form.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }

    if (!form.fullName) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

    if (form.baseSalary <= 0) {
      newErrors.baseSalary = "Lương phải lớn hơn 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        department: form.department,
        position: form.position,
        baseSalary: form.baseSalary,
        role: form.role,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= UI =================
  const inputClass =
    "w-full h-10 px-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all";

  const disabledClass =
    "w-full h-10 px-3 bg-gray-100 border-none rounded-lg text-gray-500 cursor-not-allowed";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm nhân viên mới"
      maxWidthClassName="max-w-lg"
    >
      <div className="p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Mật khẩu <span className="text-red-500">*</span>
            </label>

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
            />

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Họ và tên <span className="text-red-500">*</span>
            </label>

            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className={inputClass}
            />

            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Quyền hạn
              </label>

              <select
                name="role"
                value={form.role}
                onChange={handleRoleChange}
                className={inputClass}
              >
                {EMPLOYEE_ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Phòng ban
              </label>

              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Chức vụ (Tự động)
            </label>

            <input
              name="position"
              value={form.position}
              disabled
              className={disabledClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Lương cơ bản (Tự động)
            </label>

            <input
              type="number"
              value={form.baseSalary}
              disabled
              className={disabledClass}
            />

            {errors.baseSalary && (
              <p className="text-red-500 text-sm mt-1">
                {errors.baseSalary}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Đang xử lý..."
                : "Tạo nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </AppModal>
  );
}