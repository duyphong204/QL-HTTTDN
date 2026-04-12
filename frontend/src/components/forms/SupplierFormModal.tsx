import { useState } from "react";

import { AppModal } from "@/components/common/AppModal";

import type { Supplier, CreateSupplierDto } from "@/types/warehouse.type";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingSupplier: Supplier | null;
  onSubmit: (data: CreateSupplierDto) => Promise<void>;
}

export function SupplierFormModal({
  isOpen,
  onClose,
  editingSupplier,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "Tên nhà cung cấp là bắt buộc";
    if (!form.email) newErrors.email = "Email là bắt buộc";
    if (!form.phone) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!form.address) newErrors.address = "Địa chỉ là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(form);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
    setErrors({});
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSupplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}
      subtitle="Nhập thông tin nhà cung cấp hàng hóa"
      maxWidthClassName="max-w-lg"
    >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >

          {/* NAME */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tên nhà cung cấp
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Nhập tên nhà cung cấp"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Điện thoại
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Số điện thoại"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Địa chỉ
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="mt-1 w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Địa chỉ nhà cung cấp"
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">
                {errors.address}
              </p>
            )}
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {editingSupplier ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
    </AppModal>
  );
}
