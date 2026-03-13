import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema, UpdateUserSchema} from "@/schemas/user.schema";
import type { User } from "@/types/user.type";
import type { Role } from "@/types/auth.type";

const ROLE_CONFIG = {
  ADMIN: "Quản trị viên",
  HR_MANAGER: "Quản lý Nhân sự",
  WAREHOUSE_MANAGER: "Quản lý Kho",
  SALES_MANAGER: "Quản lý Kinh doanh",
  EMPLOYEE: "Nhân viên",
  CUSTOMER: "Khách hàng",
} as const;

type UserFormValues = {
  email: string;
  password?: string;
  role: Role;
  profile: {
    fullName: string;
  };
};

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: User | null;
  onSubmit: (data: UserFormValues) => Promise<void>;
}

export function UserFormModal({
  isOpen,
  onClose,
  editingUser,
  onSubmit,
}: UserFormModalProps) {
  const isEditMode = !!editingUser;

  const resolver = useMemo(() => {
    return (isEditMode
      ? zodResolver(UpdateUserSchema)
      : zodResolver(CreateUserSchema)) as Resolver<UserFormValues>;
  }, [isEditMode]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver,
    defaultValues: {
      email: "",
      password: "",
      role: "CUSTOMER",
      profile: { fullName: "" },
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingUser) {
      reset({
        email: editingUser.email,
        role: editingUser.role,
        profile: { fullName: editingUser.profile?.fullName || "" },
      });
      return;
    }

    reset({
      email: "",
      password: "",
      role: "CUSTOMER",
      profile: { fullName: "" },
    });
  }, [isOpen, editingUser, reset]);

  if (!isOpen) return null;

  const submit = async (data: UserFormValues) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Chỉnh sửa User" : "Thêm User mới"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Nhập thông tin tài khoản người dùng
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              className="w-full h-11 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                className="w-full h-11 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                {...register("password")}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên</label>
            <input
              type="text"
              className="w-full h-11 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg"
              {...register("profile.fullName")}
            />
            {errors.profile?.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.profile.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò</label>
            <select className="w-full h-11 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg" {...register("role")}>
              {Object.entries(ROLE_CONFIG).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-6 bg-[#0a0f1c] hover:bg-black text-white text-sm font-semibold rounded-lg"
          >
            {isSubmitting ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Thêm User"}
          </button>
        </form>
      </div>
    </div>
  );
}