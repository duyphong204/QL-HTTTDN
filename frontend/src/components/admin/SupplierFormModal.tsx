import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CreateSupplierSchema,
  type CreateSupplierValues,
} from "@/schemas/supplier.schema";

import type { Supplier } from "@/types/warehouse.type";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingSupplier: Supplier | null;
  onSubmit: (data: CreateSupplierValues) => Promise<void>;
}

export function SupplierFormModal({
  isOpen,
  onClose,
  editingSupplier,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSupplierValues>({
    resolver: zodResolver(CreateSupplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (editingSupplier) {
      reset({
        name: editingSupplier.name ?? "",
        email: editingSupplier.email ?? "",
        phone: editingSupplier.phone ?? "",
        address: editingSupplier.address ?? "",
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [editingSupplier, reset]);

  const submitHandler = async (data: CreateSupplierValues) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-6">

        {/* HEADER */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {editingSupplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}
          </h2>
          <p className="text-sm text-gray-500">
            Nhập thông tin nhà cung cấp hàng hóa
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(submitHandler)}
          className="space-y-4"
        >

          {/* NAME */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tên nhà cung cấp
            </label>
            <input
              {...register("name")}
              className="mt-1 w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Nhập tên nhà cung cấp"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Điện thoại
            </label>
            <input
              {...register("phone")}
              className="mt-1 w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Số điện thoại"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register("email")}
              className="mt-1 w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Địa chỉ
            </label>
            <input
              {...register("address")}
              className="mt-1 w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Địa chỉ nhà cung cấp"
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">
                {errors.address.message}
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
      </div>
    </div>
  );
}