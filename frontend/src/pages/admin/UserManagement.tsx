import { useEffect } from "react";
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
  const { modalOpen, editingEntity, openCreateModal, openEditModal, closeModal } = useEntityModal<User>();
  const { confirmAndRun } = useConfirmAction();

  // 3. Search & Pagination Logic
  const { searchTerm, setSearchTerm, updateFilters, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchUsers,
    debounceMs: 300,
  });

  // Khởi tạo dữ liệu
  useEffect(() => {
    fetchUsers();
  }, []);

  // 4. Handlers
  const handleFormSubmit = async (data: UserFormValues) => {
    if (editingEntity) {
      await updateUser(editingEntity.id, data);
    } else {
      await addUser(data);
    }
    closeModal();
  };

  const handleDelete = async (id: string, email?: string) => {
    await confirmAndRun({
      message: `Bạn có chắc muốn xóa user ${email ?? ""}?`,
      action: () => deleteUser(id),
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý User</h1>
            <p className="mt-1 text-sm text-gray-500">Quản lý tài khoản và phân quyền người dùng</p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <UserPlus size={18} />
            Thêm User
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo email hoặc họ tên..."
          >
            <select
              value={typeof filters.isActive === "boolean" ? String(filters.isActive) : ""}
              onChange={(e) => {
                const value = e.target.value;
                updateFilters({
                  isActive: value === "" ? undefined : value === "true",
                });
              }}
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Ngưng hoạt động</option>
            </select>
          </DataTableToolbar>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="border-b border-gray-100 bg-white font-semibold text-gray-700">
                <tr>
                  <th className="px-6 py-4">Họ tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <TableLoadingRow colSpan={5} text="Đang tải dữ liệu..." />
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Không tìm thấy user nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="group transition-colors hover:bg-gray-50/70">
                      <td className="px-6 py-4 text-gray-600">{user.profile?.fullName || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email || "—"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
                            ROLE_BADGE[user.role].color
                          }
                        >
                          {ROLE_BADGE[user.role].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            title="Sửa thông tin"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.email)}
                            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Xóa User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            meta={meta}
            currentPage={filters.page}
            totalLabel="Tổng"
            isLoading={isLoading}
            onPageChange={goToPage}
          />
        </div>
      </div>

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