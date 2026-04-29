import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { User } from "@/types/user.types";
import { AppModal } from "@/components/common/AppModal";

type UserFormValues = {
  email: string;
  password?: string;
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    defaultValues: {
      email: "",
      password: "",
      profile: { fullName: "" },
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingUser) {
      reset({
        email: editingUser.email,
        profile: { fullName: editingUser.profile?.fullName || "" },
      });
      return;
    }

    reset({
      email: "",
      password: "",
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
      subtitle={isEditMode ? "Cập nhật thông tin cá nhân" : "Nhập thông tin tài khoản người dùng"}
      maxWidthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit(submit)} className="p-6 space-y-4">
        {/* Email - Khóa khi Edit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            disabled={isEditMode}
            className={`w-full h-11 px-3 text-sm border rounded-lg ${
              isEditMode ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-gray-50 border-gray-200"
            }`}
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Mật khẩu - Chỉ hiện khi thêm mới */}
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

        {/* Họ tên - LUÔN CHO CHỈNH SỬA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên</label>
          <input
            type="text"
            placeholder="Nhập họ và tên..."
            className="w-full h-11 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            {...register("profile.fullName")}
          />
          {errors.profile?.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.profile.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò</label>
          <input
            type="text"
            readOnly
            value="Khách hàng"
            className="w-full h-11 px-3 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            Màn này chỉ tạo và quản lý tài khoản khách hàng.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 mt-6 bg-[#0a0f1c] hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Thêm User"}
        </button>
      </form>
    </AppModal>
  );
}