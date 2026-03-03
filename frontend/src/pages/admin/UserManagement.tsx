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
import { CreateUserSchema } from "@/schemas/user.schema"
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
    } = useForm({
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
                return "success";
            case "SALES_MANAGER":
                return "default";
            case "EMPLOYEE":
                return "secondary"; 
            default:
                return "outline";
        }
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case "ADMIN": return "Quản trị viên";
            case "CUSTOMER": return "Khách hàng";
            case "HR_MANAGER": return "Quản lý Nhân sự";
            case "WAREHOUSE_MANAGER": return "Quản lý Kho";
            case "SALES_MANAGER": return "Quản lý Kinh doanh";
            case "EMPLOYEE": return "Nhân viên";
            default: return role;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quản lý User</h2>
                    <p className="text-muted-foreground mt-1">
                        Quản lý tài khoản và phân quyền người dùng
                    </p>
                </div>
                <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Thêm User
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm user..."
                            className="pl-8 bg-gray-50 border-gray-200"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    {/* Filter button example */}
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4 text-gray-500" />
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="w-[200px] font-bold text-gray-700">Email</TableHead>
                                <TableHead className="font-bold text-gray-700">Họ tên</TableHead>
                                <TableHead className="font-bold text-gray-700">Vai trò</TableHead>
                                <TableHead className="font-bold text-gray-700">Sdt</TableHead>
                                <TableHead className="text-right font-bold text-gray-700">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Không tìm thấy user nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {user.profile?.fullName}
                                            </div>
                                        </TableCell>
                                     {/* <TableCell>{user.email}</TableCell> */}
                                        <TableCell>
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                                    {getRoleName(user.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.profile?.phone || "Chưa có số điện thoại"} </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} className="h-8 w-8 text-gray-600 hover:text-blue-600">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} className="h-8 w-8 text-gray-600 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Sửa thông tin User" : "Thêm User mới"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" {...register("email")} disabled={!!editingUser} />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email.message as string}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Họ tên</Label>
                            <Input id="fullName" {...register("profile.fullName")} />
                            {errors.profile?.fullName && <span className="text-red-500 text-sm">{errors.profile.fullName.message as string}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Vai trò</Label>
                            <div className="relative">
                                <select
                                    {...register("role")}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="ADMIN">Quản trị viên</option>
                                    <option value="CUSTOMER">Khách hàng</option>
                                    <option value="HR_MANAGER">Quản lý Nhân sự</option>
                                    <option value="WAREHOUSE_MANAGER">Quản lý Kho</option>
                                    <option value="SALES_MANAGER">Quản lý Kinh doanh</option>
                                    <option value="EMPLOYEE">Nhân viên</option>
                                </select>
                            </div>
                        </div>

                        {!editingUser && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <Input id="password" type="password" {...register("password")} 
                                />
                                    {errors.password && (
                                    <span className="text-red-500 text-sm">
                                        {errors.password.message as string}
                                    </span>
                        )}
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                {editingUser ? "Lưu thay đổi" : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
