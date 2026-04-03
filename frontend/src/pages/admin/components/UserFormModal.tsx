import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema, UpdateUserSchema} from "@/schemas/user.schema";
import type { User } from "@/types/user.type";
import type { Role } from "@/types/auth.type";
import { ROLE_OPTIONS } from "@/constants/role";
import { AppModal } from "@/components/common/AppModal";

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

  const submit = async (data: UserFormValues) => {
    await onSubmit(data);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Chỉnh sửa User" : "Thêm User mới"}
      subtitle="Nhập thông tin tài khoản người dùng"
      maxWidthClassName="max-w-lg"
    >
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
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
    </AppModal>
  );
}