import { useEffect, useState } from "react";
import { useSupplierStore } from "@/store/supplier.store";
import type { Supplier } from "@/types/warehouse.type";

import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { SupplierFormModal } from "./components/SupplierFormModal";
import type { CreateSupplierValues } from "@/schemas/supplier.schema";

export default function SupplierManagement() {
  const {
    suppliers,
    meta,
    isLoading,
    filters,
    actions: {
      fetchSuppliers,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      setFilters,
    },
  } = useSupplierStore();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Fetch lần đầu
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters({ search, page: 1 });
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, setFilters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const openCreateModal = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa nhà cung cấp: ${name}?`)) {
      await deleteSupplier(id);
    }
  };

  const handleFormSubmit = async (data: CreateSupplierValues) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
      } else {
        await addSupplier(data);
      }

      setModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý Nhà cung cấp
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin nhà cung cấp hàng hóa
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Thêm Nhà cung cấp
          </button>
        </div>

        {/* DATA */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          {/* SEARCH */}
          <div className="p-4 border-b border-gray-50">
            <div className="grid gap-3 md:grid-cols-12">
              <div className="relative md:col-span-8">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Tìm kiếm nhà cung cấp..."
                className="w-full h-11 pl-11 pr-4 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-gray-700"
              />
              </div>

              <div className="md:col-span-4">
                <select
                  value={`${filters.sortBy}:${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split(":") as [string, "asc" | "desc"];
                    setFilters({ sortBy, sortOrder, page: 1 });
                  }}
                  className="h-11 w-full rounded-xl border border-gray-100 bg-gray-50/50 px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="name:asc">Tên A-Z</option>
                  <option value="name:desc">Tên Z-A</option>
                  <option value="email:asc">Email A-Z</option>
                  <option value="email:desc">Email Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Tên NCC</th>
                  <th className="px-6 py-4">Điện thoại</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Địa chỉ</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">

                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}

                {!isLoading && suppliers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Không tìm thấy nhà cung cấp nào.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  suppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {supplier.name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {supplier.phone || "—"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {supplier.email || "—"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {supplier.address || "—"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100">

                          <button
                            onClick={() => openEditModal(supplier)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(supplier.id, supplier.name)
                            }
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}

              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3 text-sm">
            <span className="text-gray-500">Tổng: {meta?.total ?? 0} nhà cung cấp</span>
            <div className="flex items-center gap-2">
              <button
                disabled={(meta?.page ?? 1) <= 1}
                onClick={() => setFilters({ page: (meta?.page ?? 1) - 1 })}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-700 disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-gray-600">Trang {meta?.page ?? 1}/{meta?.totalPages ?? 1}</span>
              <button
                disabled={(meta?.page ?? 1) >= (meta?.totalPages ?? 1)}
                onClick={() => setFilters({ page: (meta?.page ?? 1) + 1 })}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-700 disabled:opacity-40"
              >
                Tiếp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <SupplierFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingSupplier={editingSupplier}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}