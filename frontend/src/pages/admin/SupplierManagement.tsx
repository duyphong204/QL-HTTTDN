import { useEffect, useState } from "react";
import { useSupplierStore } from "@/store/supplier.store";
import type { Supplier } from "@/types/warehouse.type";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CreateSupplierSchema,
  type CreateSupplierValues,
} from "@/schemas/supplier.schema";

const SupplierManagement = () => {
  const suppliers = useSupplierStore((s) => s.suppliers);
  const isLoading = useSupplierStore((s) => s.isLoading);
  const actions = useSupplierStore((s) => s.actions);

  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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
    actions.fetchSuppliers();
  }, []);

  const openCreate = () => {
    setEditing(null);

    reset({
      name: "",
      email: "",
      phone: "",
      address: "",
    });

    setOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);

    reset({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });

    setOpen(true);
  };

  const onSubmit = async (data: CreateSupplierValues) => {
    if (editing) {
      await actions.updateSupplier(editing.id, data);
    } else {
      await actions.addSupplier(data);
    }

    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa nhà cung cấp này?")) {
      await actions.deleteSupplier(id);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Nhà cung cấp</h1>

        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Thêm NCC
        </button>
      </div>

      {/* SEARCH */}
      <input
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          actions.setFilters({ search: e.target.value });
        }}
        placeholder="Tìm kiếm nhà cung cấp..."
        className="border rounded-lg px-4 py-2 w-full max-w-sm"
      />

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">STT</th>
              <th className="p-3 text-left">Tên NCC</th>
              <th className="p-3 text-left">Điện thoại</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Địa chỉ</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  Đang tải...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              suppliers.map((s, index) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">

                  <td className="p-3">{index + 1}</td>

                  <td className="p-3 font-medium">
                    {s.name}
                  </td>

                  <td className="p-3">{s.phone}</td>

                  <td className="p-3">{s.email}</td>

                  <td className="p-3">{s.address}</td>

                  <td className="p-3 text-right space-x-2">

                    <button
                      onClick={() => openEdit(s)}
                      className="text-blue-600"
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-500"
                    >
                      Xóa
                    </button>

                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white rounded-lg p-6 w-full max-w-md">

            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div>
                <label className="text-sm">Tên NCC</label>
                <input
                  {...register("name")}
                  className="border w-full px-3 py-2 rounded"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label>Email</label>
                <input
                  {...register("email")}
                  className="border w-full px-3 py-2 rounded"
                />
              </div>

              <div>
                <label>Điện thoại</label>
                <input
                  {...register("phone")}
                  className="border w-full px-3 py-2 rounded"
                />
              </div>

              <div>
                <label>Địa chỉ</label>
                <input
                  {...register("address")}
                  className="border w-full px-3 py-2 rounded"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {editing ? "Cập nhật" : "Thêm"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default SupplierManagement;