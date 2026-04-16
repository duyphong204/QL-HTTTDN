import { useState } from "react";
import { AppModal } from "@/components/common/AppModal";
import type { CreateEmployeeDto, UpdateEmployeeDto, Employee } from "@/types/employee.types";
import { EMPLOYEE_ROLE_OPTIONS, ROLE_DEPARTMENT_MAP } from "@/utils/role";
import type { Role } from "@/types/auth.types";

const ROLE_POSITION_MAP: Record<string, string> = {
  HR_MANAGER: "phòng Nhân sự",
  WAREHOUSE_MANAGER: "phòng Kho vận",
  SALES_MANAGER: "phòng Kinh doanh",
  EMPLOYEE: "Nhân viên",
};

const ROLE_SALARY_MAP: Record<string, number> = {
  HR_MANAGER: 15000000,
  WAREHOUSE_MANAGER: 14000000,
  SALES_MANAGER: 16000000,
  EMPLOYEE: 10000000,
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeDto | UpdateEmployeeDto) => Promise<void>;
  editingEmployee?: Employee | null;
};

export function EmployeeFormModal({ isOpen, onClose, onSubmit, editingEmployee }: Props) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: editingEmployee?.user?.profile?.fullName || "",
    department: editingEmployee?.department || "",
    position: editingEmployee?.position || "",
    baseSalary: editingEmployee?.baseSalary || 0,
    role: (editingEmployee?.user?.role as Role) || "EMPLOYEE",
    effectiveDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "baseSalary" ? Number(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value as Role;
    setForm((prev) => ({
      ...prev,
      role: selectedRole,
      department: ROLE_DEPARTMENT_MAP[selectedRole] || prev.department,
      position: ROLE_POSITION_MAP[selectedRole] || "",
      baseSalary: ROLE_SALARY_MAP[selectedRole] || 0,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!editingEmployee) {
      if (!form.email) newErrors.email = "Email là bắt buộc";
      if (!form.password) newErrors.password = "Mật khẩu là bắt buộc";
      if (!form.fullName) newErrors.fullName = "Họ và tên là bắt buộc";
    }
    if (form.baseSalary <= 0) newErrors.baseSalary = "Lương phải lớn hơn 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        await onSubmit({
          department: form.department || undefined,
          position: form.position || undefined,
          baseSalary: form.baseSalary,
          role: form.role,
          effectiveDate: form.effectiveDate || undefined,
        } as UpdateEmployeeDto);
      } else {
        await onSubmit({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          department: form.department || undefined,
          position: form.position || undefined,
          baseSalary: form.baseSalary,
        } as CreateEmployeeDto);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Class chung cho input không viền
  const inputClass = "w-full h-10 px-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const disabledClass = "w-full h-10 px-3 bg-gray-100 border-none rounded-lg text-gray-500 cursor-not-allowed";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEmployee ? "Cập nhật thông tin nhân sự" : "Thêm nhân viên mới"}
      maxWidthClassName="max-w-lg"
    >
      <div className="p-6 space-y-5">
        {editingEmployee && (
          <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg">
            Lưu ý: Thay đổi lương hoặc chức vụ sẽ tạo lịch sử công tác mới.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!editingEmployee && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Email <span className="text-red-500">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="example@company.com" />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
            <input name="fullName" value={form.fullName} onChange={handleChange} disabled={!!editingEmployee} className={editingEmployee ? disabledClass : inputClass} />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Quyền hạn</label>
              <select name="role" value={form.role} onChange={handleRoleChange} className={inputClass}>
                {EMPLOYEE_ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phòng ban</label>
              <input name="department" value={form.department} onChange={handleChange} className={inputClass} placeholder="Tên phòng ban" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Chức vụ (Tự động)</label>
            <input name="position" value={form.position} disabled className={disabledClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Lương cơ bản (Tự động)</label>
            <input name="baseSalary" type="number" value={form.baseSalary} disabled className={disabledClass} />
            {errors.baseSalary && <p className="text-red-500 text-sm mt-1">{errors.baseSalary}</p>}
          </div>

          {editingEmployee && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Ngày hiệu lực</label>
              <input name="effectiveDate" type="date" value={form.effectiveDate} onChange={handleChange} className={inputClass} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50">
              {isSubmitting ? "Đang xử lý..." : (editingEmployee ? "Lưu thay đổi" : "Tạo nhân viên")}
            </button>
          </div>
        </form>
      </div>
    </AppModal>
  );
}
