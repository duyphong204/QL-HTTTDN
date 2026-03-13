import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user.store";
import { Search, UserPlus, Pencil, Trash2 } from "lucide-react";
import { UserFormModal } from "@/components/admin/UserFormModal";
import type { Role } from "@/types/auth.type";
import type { User } from "@/types/user.type";

const ROLE_BADGE = {
  ADMIN: { label: "Quản trị viên", color: "bg-red-100 text-red-600" },
  HR_MANAGER: { label: "Quản lý Nhân sự", color: "bg-blue-100 text-blue-600" },
  WAREHOUSE_MANAGER: { label: "Quản lý Kho", color: "bg-emerald-100 text-emerald-600" },
  SALES_MANAGER: { label: "Quản lý Kinh doanh", color: "bg-purple-100 text-purple-600" },
  EMPLOYEE: { label: "Nhân viên", color: "bg-gray-100 text-gray-700" },
  CUSTOMER: { label: "Khách hàng", color: "bg-gray-100 text-gray-500" },
} as const;

type UserFormValues = {
  email: string;
  password?: string;
  role: Role;
  profile: {
    fullName: string;
  };
};

export default function UserManagement() {
  const {
    users,
    isLoading,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    setFilters,
    filters,
  } = useUserStore();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters({ search });
    }, 350);

    return () => clearTimeout(timeout);
  }, [search, setFilters]);

  const openCreateModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, email: string) => {
    if (confirm("Bạn có chắc muốn xóa user: " + email + "?")) {
      await deleteUser(id);
    }
  };

  const handleFormSubmit = async (data: UserFormValues) => {
    if (editingUser) {
      await updateUser(editingUser.id, {
        email: data.email,
        role: data.role,
        profile: {
          fullName: data.profile.fullName,
        },
      });
    } else {
      await addUser({
        email: data.email,
        password: data.password || "",
        role: data.role,
        profile: {
          fullName: data.profile.fullName,
        },
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý User
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý tài khoản và phân quyền người dùng
            </p>
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
          <div className="grid gap-3 border-b border-gray-50 p-4 md:grid-cols-12">
            <div className="relative md:col-span-8">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo email hoặc họ tên..."
                className="h-11 w-full rounded-xl border border-gray-100 bg-gray-50/50 pl-11 pr-4 text-sm text-gray-700 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={filters.role || ""}
                onChange={(e) =>
                  setFilters({
                    role: (e.target.value || undefined) as Role | undefined,
                  })
                }
                className="h-11 w-full rounded-xl border border-gray-100 bg-gray-50/50 px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Tất cả vai trò</option>
                {Object.entries(ROLE_BADGE).map(([role, config]) => (
                  <option key={role} value={role}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                    <tr
                      key={user.id}
                      className="group transition-colors hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {user.email ? user.email.split("@")[0] : "—"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.profile?.fullName || "—"}
                      </td>

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