import { useEffect, useState } from "react";
import { AppModal } from "@/components/common/AppModal";
import {
  EMPLOYEE_ROLE_OPTIONS,
  ROLE_DEPARTMENT_MAP,
  ROLE_SALARY_MAP,
} from "@/utils/role";
import type { ChangePositionDto, Employee } from "@/types/employee.types";
import type { Role } from "@/types/auth.types";
import dayjs from "dayjs";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChangePositionDto) => Promise<void>;
  employee: Employee | null;
};

const inputClass =
  "w-full h-10 px-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm";

export function ChangePositionModal({
  isOpen,
  onClose,
  onSubmit,
  employee,
}: Props) {
  const [form, setForm] = useState({
    position: "" as Role | "",
    department: "",
    baseSalary: 0,
    effectiveDate: dayjs().format("YYYY-MM-DD"),
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      setForm({
        position: (employee.position as Role) || "",
        department: employee.department || "",
        baseSalary: employee.baseSalary || 0,
        effectiveDate: dayjs().format("YYYY-MM-DD"),
        note: "",
      });
      setErrors({});
    }
  }, [isOpen, employee]);

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as Role | "";
    setForm((prev) => ({
      ...prev,
      position: role,
      department: role ? (ROLE_DEPARTMENT_MAP[role] ?? prev.department) : prev.department,
      baseSalary: role ? (ROLE_SALARY_MAP[role] ?? prev.baseSalary) : prev.baseSalary,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "baseSalary" ? Number(value) || 0 : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.effectiveDate) errs.effectiveDate = "Ngày hiệu lực là bắt buộc";
    if (form.baseSalary < 0) errs.baseSalary = "Lương không được âm";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        role: form.position || undefined,
        position: form.position || undefined,
        department: form.department || undefined,
        baseSalary: form.baseSalary || undefined,
        effectiveDate: form.effectiveDate,
        note: form.note || undefined,
      });
      onClose();
    } catch {
      // error already handled (toast) by the store action
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Thay đổi chức vụ"
      maxWidthClassName="max-w-lg"
    >
      <div className="p-6 space-y-5">
        {employee && (
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 space-y-1">
            <p className="font-medium">{employee.user?.profile?.fullName}</p>
            <p className="text-blue-500 text-xs">
              Hiện tại: {employee.position || "—"} · {employee.department || "—"} ·{" "}
              {employee.baseSalary.toLocaleString("vi-VN")} ₫
            </p>
          </div>
        )}

        <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg">
          Thay đổi chức vụ sẽ tạo lịch sử công tác mới kể từ ngày hiệu lực.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Chức vụ mới
            </label>
            <select
              value={form.position}
              onChange={handlePositionChange}
              className={inputClass}
            >
              <option value="">-- Chọn chức vụ --</option>
              {EMPLOYEE_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Phòng ban
              </label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Phòng ban"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Lương cơ bản (VNĐ)
              </label>
              <input
                name="baseSalary"
                type="number"
                min={0}
                value={form.baseSalary}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.baseSalary && (
                <p className="text-red-500 text-xs mt-1">{errors.baseSalary}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Ngày hiệu lực <span className="text-red-500">*</span>
            </label>
            <input
              name="effectiveDate"
              type="date"
              value={form.effectiveDate}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.effectiveDate && (
              <p className="text-red-500 text-xs mt-1">{errors.effectiveDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Ghi chú
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={2}
              placeholder="Lý do thay đổi, ghi chú thêm..."
              className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </AppModal>
  );
}
