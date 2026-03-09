import { useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema, type CreateUserValues } from "@/schemas/user.schema";
import type { User } from "@/types/user.type";

const ROLE_CONFIG = {
    ADMIN: "Quản trị viên",
    HR_MANAGER: "Quản lý Nhân sự",
    WAREHOUSE_MANAGER: "Quản lý Kho",
    SALES_MANAGER: "Quản lý Kinh doanh",
    EMPLOYEE: "Nhân viên",
    CUSTOMER: "Khách hàng",
} as const;

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser: User | null;
    onSubmit: (data: CreateUserValues) => Promise<void>;
}

export function UserFormModal({ isOpen, onClose, editingUser, onSubmit }: UserFormModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateUserValues>({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: {
            email: "",
            password: "",
            role: "CUSTOMER",
            profile: { fullName: "" },
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (editingUser) {
                setValue("email", editingUser.email);
                setValue("role", editingUser.role);
                setValue("profile.fullName", editingUser.profile?.fullName || "");
            } else {
                reset();
            }
        }
    }, [isOpen, editingUser, setValue, reset]);

    if (!isOpen) return null;

    const inputClass =
        "w-full h-11 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    const handleFormSubmit = async (data: CreateUserValues) => {
        await onSubmit(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Lớp nền mờ */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingUser ? "Chỉnh sửa User" : "Thêm User mới"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Nhập thông tin tài khoản người dùng
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">

                    <div>
                        <label className={labelClass}>Tên đăng nhập / Email</label>
                        <input
                            type="text"
                            placeholder="admin@example.com"
                            className={`${inputClass} ${editingUser ? "bg-gray-100/50 cursor-not-allowed text-gray-400" : ""}`}
                            {...register("email")}
                            disabled={!!editingUser}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    {!editingUser && (
                        <div>
                            <label className={labelClass}>Mật khẩu</label>
                            <input
                                type="password"
                                placeholder="********"
                                className={inputClass}
                                {...register("password")}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Họ tên</label>
                        <input
                            type="text"
                            placeholder="Nguyễn Văn A"
                            className={inputClass}
                            {...register("profile.fullName")}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Vai trò</label>
                        <select
                            className={`${inputClass} appearance-none cursor-pointer`}
                            {...register("role")}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: `right 12px center`, backgroundRepeat: `no-repeat`, backgroundSize: `16px` }}
                        >
                            {Object.entries(ROLE_CONFIG).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 mt-6 bg-[#0a0f1c] hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Đang xử lý..." : (editingUser ? "Cập nhật" : "Thêm User")}
                    </button>
                </form>
            </div>
        </div>
    );
}
