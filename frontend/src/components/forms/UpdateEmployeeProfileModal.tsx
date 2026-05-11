import { useEffect, useState } from "react";
import { AppModal } from "@/components/common/AppModal";
import type {
  Employee,
  UpdateEmployeeProfileByHrDto,
} from "@/types/employee.types";
import dayjs from "dayjs";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateEmployeeProfileByHrDto) => Promise<void>;
  employee: Employee | null;
};

export function UpdateEmployeeProfileModal({
  isOpen,
  onClose,
  onSubmit,
  employee,
}: Props) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    avatar: "",
    dateOfBirth: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      const profile = employee.user?.profile;
      setForm({
        fullName: profile?.fullName || "",
        phone: profile?.phone || "",
        address: profile?.address || "",
        avatar: profile?.avatar || "",
        dateOfBirth: profile?.dateOfBirth
          ? dayjs(profile.dateOfBirth).format("YYYY-MM-DD")
          : "",
      });
    }
  }, [isOpen, employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        fullName: form.fullName || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        avatar: form.avatar || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      });
      onClose();
    } catch {
      // error already handled (toast) by the store action
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-10 px-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sửa thông tin cá nhân"
      maxWidthClassName="max-w-lg"
    >
      <div className="p-6 space-y-5">
        {employee && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium text-gray-800">
              {employee.user?.profile?.fullName}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {employee.code} · {employee.user?.email}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Họ và tên đầy đủ
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Số điện thoại
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0xxxxxxxxx"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Ngày sinh
              </label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Địa chỉ
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Địa chỉ cư trú"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Avatar URL
            </label>
            <input
              name="avatar"
              value={form.avatar}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass}
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
              {isSubmitting ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </form>
      </div>
    </AppModal>
  );
}
