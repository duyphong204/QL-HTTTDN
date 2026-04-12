import { useUserManagement } from "@/hooks/useUserManagement"
import { UserPlus, Pencil, Trash2 } from "lucide-react"
import { UserFormModal } from "@/components/forms/UserFormModal"
import { ROLE_BADGE } from "@/constants/role"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { PaginationControls } from "@/components/common/PaginationControls"
import type { Role } from "@/types/auth.type"

export default function UserManagement() {
  const {
    users,
    meta,
    isLoading,
    modalOpen,
    setModalOpen,
    editingUser,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    goToPage,
    openCreateModal,
    openEditModal,
    handleDelete,
    handleFormSubmit,
  } = useUserManagement()

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
              value={filters.role || ""}
              onChange={(e) =>
                updateFilters({
                  role: (e.target.value || undefined) as Role | undefined,
                })
              }
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Tất cả vai trò</option>
              {Object.entries(ROLE_BADGE).map(([role, config]) => (
                <option key={role} value={role}>
                  {config.label}
                </option>
              ))}
            </select>

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

            <select
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(":") as [
                  "createdAt" | "email" | "role",
                  "asc" | "desc",
                ];
                updateFilters({ sortBy, sortOrder });
              }}
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="createdAt:desc">Mới nhất</option>
              <option value="createdAt:asc">Cũ nhất</option>
              <option value="email:asc">Email A-Z</option>
              <option value="email:desc">Email Z-A</option>
            </select>
          </DataTableToolbar>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="border-b border-gray-100 bg-white font-semibold text-gray-700">
                <tr>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Họ tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Không tìm thấy user nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="group transition-colors hover:bg-gray-50/70">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {user.email ? user.email.split("@")[0] : "—"}
                      </td>

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
        key={editingUser?.id || "create-user"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingUser={editingUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
