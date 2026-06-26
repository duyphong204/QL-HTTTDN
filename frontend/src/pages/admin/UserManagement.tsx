import { useEffect, useCallback } from "react";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { UserFormModal } from "@/components/forms/UserFormModal";
import { ROLE_BADGE } from "@/utils/role";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableLoadingRow } from "@/components/common/Loading";

import { useUserStore, type UserFormValues } from "@/stores/user.store";
import { useEntityModal } from "@/hooks/useEntityModal";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import type { User } from "@/types/user.types";

export default function UserManagement() {
  // 1. Store State & Actions
  const {
    users,
    meta,
    isLoading,
    filters,
    setFilters,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
  } = useUserStore();

  // 2. UI Hooks
  const {
    modalOpen,
    editingEntity,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<User>();
  const { confirmAndRun } = useConfirmAction();

  // 3. Search & Pagination Logic
  const { searchTerm, setSearchTerm, updateFilters, goToPage } =
    usePaginatedList({
      filters,
      setFilters,
      fetchData: fetchUsers,
      debounceMs: 300,
    });

  // Tối ưu hóa useEffect (Thêm dependency)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 4. Handlers (Sử dụng useCallback để tránh re-render child components)
  const handleFormSubmit = useCallback(async (data: UserFormValues) => {
    if (editingEntity) {
      await updateUser(editingEntity.id, data);
    } else {
      await addUser(data);
    }
    closeModal();
  }, [editingEntity, updateUser, addUser, closeModal]);

  const handleDelete = useCallback((id: string, email?: string) => {
    void confirmAndRun({
      message: `Bạn có chắc muốn xóa người dùng: ${email || "Không rõ email"}? Hành động này không thể hoàn tác.`,
      action: () => deleteUser(id),
    });
  }, [confirmAndRun, deleteUser]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    updateFilters({
      isActive: value === "" ? undefined : value === "true",
    });
  }, [updateFilters]);

  // 5. Render Helper (Nên tách ra file riêng nếu lớn hơn)
  const renderTableBody = () => {
    if (isLoading) return <TableLoadingRow colSpan={4} text="Đang tải dữ liệu..." />;
    if (users.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">📭</span>
              <p className="font-medium text-gray-600">Không tìm thấy người dùng nào</p>
              <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          </td>
        </tr>
      );
    }

    return users.map((user) => (
      <tr
        key={user.id}
        className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40"
      >
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{user.profile?.fullName || "—"}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-600 font-medium">
          {user.email || "—"}
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm border border-white/20 ${ROLE_BADGE[user.role].color}`}
          >
            {ROLE_BADGE[user.role].label}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-2 opacity-50 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => openEditModal(user)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95"
              title="Chỉnh sửa"
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleDelete(user.id, user.email)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
              title="Xóa người dùng"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý tài khoản
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Thiết lập và phân quyền cho người dùng hệ thống
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 active:translate-y-0 active:scale-95"
          >
            <UserPlus size={18} strokeWidth={2.5} />
            Thêm tài khoản
          </button>
        </div>

        {/* Main Content Area */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm theo email hoặc họ tên..."
            >
              <select
                value={typeof filters.isActive === "boolean" ? String(filters.isActive) : ""}
                onChange={handleFilterChange}
                className="h-10 min-w-[160px] px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow font-medium text-gray-700 cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Ngưng hoạt động</option>
              </select>
            </DataTableToolbar>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-gray-50/80 font-semibold text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Họ tên</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Email</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Vai trò</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 bg-white">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100 bg-white p-4">
            <PaginationControls
              meta={meta}
              currentPage={filters.page}
              totalLabel="Người dùng"
              isLoading={isLoading}
              onPageChange={goToPage}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      <UserFormModal
        key={editingEntity?.id || "create-user"}
        isOpen={modalOpen}
        onClose={closeModal}
        editingUser={editingEntity}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
