import { create } from "zustand"
import { toast } from "sonner"
import { employeeService } from "@/services/hr.service"
import { getErrorMessage } from "@/stores/store.helpers"

interface ProfileFormData {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

interface EmployeeState {
  myProfile: any | null;
  isLoadingProfile: boolean;
  isEditing: boolean;
  formData: ProfileFormData;

  fetchMyProfile: () => Promise<void>;
  updateMyProfile: (data: ProfileFormData) => Promise<void>;
  setFormData: (data: Partial<ProfileFormData>) => void;
  handleEdit: () => void;
  handleCancel: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  myProfile: null,
  isLoadingProfile: false,
  isEditing: false,
  formData: {},

  fetchMyProfile: async () => {
    set({ isLoadingProfile: true });
    try {
      const data = await employeeService.getMyProfile();
      set({ myProfile: data });
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải hồ sơ!"));
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  handleEdit: () => {
    const { myProfile } = get();
    const profile = myProfile?.user?.profile;
    set({
      isEditing: true,
      formData: {
        fullName: profile?.fullName || "",
        dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
        phone: profile?.phone || "",
        address: profile?.address || "",
        avatar: profile?.avatar || "",
      },
    });
  },

  handleCancel: () => set({ isEditing: false }),

  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data },
  })),

  updateMyProfile: async (data) => {
    set({ isLoadingProfile: true });
    try {
      await employeeService.updateMyProfile(data);
      toast.success("Cập nhật thông tin thành công!");
      await get().fetchMyProfile();
      set({ isEditing: false });
    } catch (error) {
      toast.error(getErrorMessage(error, "Cập nhật thất bại!"));
    } finally {
      set({ isLoadingProfile: false });
    }
  },
}))
