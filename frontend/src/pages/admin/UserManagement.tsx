import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CreateUserSchema } from "@/schemas/user.schema";
import type { User } from "@/types/user.type";
import type { CreateUserValues } from "@/schemas/user.schema";

const UserManagement = () => {
  const users = useUserStore((state) => state.users);
  const isLoading = useUserStore((state) => state.isLoading);

  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const addUser = useUserStore((state) => state.addUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const setFilters = useUserStore((state) => state.setFilters);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "CUSTOMER",
      profile: {
        fullName: "",
      },
    },
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFilters({ search: e.target.value });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    reset({
      email: "",
      password: "",
      role: "CUSTOMER",
      profile: {
        fullName: "",
      },
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setValue("profile.fullName", user.profile?.fullName || "");
    setValue("email", user.email);
    setValue("role", user.role);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      await deleteUser(id);
    }
  };

  const onSubmit = async (data: CreateUserValues) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
      } else {
        await addUser(data);
      }

      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "HR_MANAGER":
        return "info";
      case "WAREHOUSE_MANAGER":
        return "default";
      case "SALES_MANAGER":
        return "success";
      case "EMPLOYEE":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "CUSTOMER":
        return "Khách hàng";
      case "HR_MANAGER":
        return "Quản lý Nhân sự";
      case "WAREHOUSE_MANAGER":
        return "Quản lý Kho";
      case "SALES_MANAGER":
        return "Quản lý Kinh doanh";
      case "EMPLOYEE":
        return "Nhân viên";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Quản lý User</h2>
          <p className="text-muted-foreground">
            Quản lý tài khoản và phân quyền người dùng
          </p>
        </div>

        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm User
        </Button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">

        <div className="flex gap-2">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

            <Input
              placeholder="Tìm kiếm user..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* TABLE */}
        <div className="rounded-xl border shadow-sm overflow-x-auto">
          <Table>

            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[60px]">STT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="hidden md:table-cell">
                  SĐT
                </TableHead>
                <TableHead className="text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Không tìm thấy user nào
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <TableCell>{index + 1}</TableCell>

                    <TableCell className="font-medium">
                      {user.email}
                    </TableCell>

                    <TableCell>
                      {user.profile?.fullName}
                    </TableCell>

                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleName(user.role)}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {user.profile?.phone || "Chưa có"}
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
        </div>
      </div>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              {editingUser
                ? "Sửa thông tin User"
                : "Thêm User mới"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >

            <div>
              <Label>Email</Label>
              <Input
                {...register("email")}
                disabled={!!editingUser}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message as string}
                </span>
              )}
            </div>

            <div>
              <Label>Họ tên</Label>
              <Input {...register("profile.fullName")} />
            </div>

            <div>
              <Label>Vai trò</Label>

              <select
                {...register("role")}
                className="w-full h-10 rounded-md border px-3"
              >
                <option value="ADMIN">Quản trị viên</option>
                <option value="CUSTOMER">Khách hàng</option>
                <option value="HR_MANAGER">Quản lý Nhân sự</option>
                <option value="WAREHOUSE_MANAGER">
                  Quản lý Kho
                </option>
                <option value="SALES_MANAGER">
                  Quản lý Kinh doanh
                </option>
                <option value="EMPLOYEE">Nhân viên</option>
              </select>
            </div>

            {!editingUser && (
              <div>
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  {...register("password")}
                />

                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password.message as string}
                  </span>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="submit">
                {editingUser
                  ? "Lưu thay đổi"
                  : "Tạo mới"}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default UserManagement;