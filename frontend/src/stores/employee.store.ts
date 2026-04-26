import { create } from "zustand"
import { toast } from "sonner"
import { employeeService, leaveRequestService } from "@/services/hr.service" // Giả sử service này có cả API user
import { getErrorMessage } from "@/stores/store.helpers"
import { REQUIRED_FIELDS_MESSAGE, hasEmptyRequiredValue } from "@/utils/validation"
import type { LeaveRequest, CreateLeaveRequestDto } from "@/types/leave.types"

// Định nghĩa cấu trúc Form cho Profile
interface ProfileFormData {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

interface EmployeeState {
  // --- Profile State ---
  myProfile: any | null; // Nên thay 'any' bằng Type User thực tế của bạn
  isLoadingProfile: boolean;
  isEditing: boolean;
  formData: ProfileFormData;

  // --- Leave Request State ---
  myLeaveRequests: LeaveRequest[];
  leaveRequests: LeaveRequest[];
  isLoadingLeave: boolean;
  dialogOpen: boolean;
  leaveForm: CreateLeaveRequestDto;

  // --- Profile Actions ---
  fetchMyProfile: () => Promise<void>;
  updateMyProfile: (data: ProfileFormData) => Promise<void>;
  setFormData: (data: Partial<ProfileFormData>) => void;
  handleEdit: () => void;
  handleCancel: () => void;

  // --- Leave Actions ---
  setLoadingLeave: (loading: boolean) => void;
  setDialogOpen: (open: boolean) => void;
  setLeaveForm: (data: Partial<CreateLeaveRequestDto>) => void;
  fetchMyLeaveRequests: () => Promise<void>;
  createLeaveRequest: () => Promise<void>;
  deleteLeaveRequest: (id: string) => Promise<void>;
  fetchAllLeaveRequests: () => Promise<void>;
  updateLeaveStatus: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  // Initial States
  myProfile: null,
  isLoadingProfile: false,
  isEditing: false,
  formData: {},
  
  myLeaveRequests: [],
  leaveRequests: [],
  isLoadingLeave: false,
  dialogOpen: false,
  leaveForm: {
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  },

  // --- Profile Logic ---
  fetchMyProfile: async () => {
    set({ isLoadingProfile: true });
    try {
      // Lưu ý: Đảm bảo employeeService hoặc một service tương đương có hàm này
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
      }
    });
  },

  handleCancel: () => set({ isEditing: false }),

  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),

  updateMyProfile: async (data) => {
    set({ isLoadingProfile: true });
    try {
      // Thay bằng API update thực tế của bạn
      await employeeService.updateMyProfile(data); 
      toast.success("Cập nhật thông tin thành công!");
      await get().fetchMyProfile(); // Refresh data
      set({ isEditing: false });
    } catch (error) {
      toast.error(getErrorMessage(error, "Cập nhật thất bại!"));
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  // --- Leave Logic (Giữ nguyên từ code cũ của bạn) ---
  setLoadingLeave: (isLoadingLeave) => set({ isLoadingLeave }),
  setDialogOpen: (dialogOpen) => set({ dialogOpen }),
  setLeaveForm: (data) => set((state) => ({
    leaveForm: { ...state.leaveForm, ...data }
  })),

  fetchMyLeaveRequests: async () => {
    set({ isLoadingLeave: true })
    try {
      const data = await leaveRequestService.getMyLeaveRequests()
      set({ myLeaveRequests: data })
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải đơn nghỉ phép!"))
    } finally {
      set({ isLoadingLeave: false })
    }
  },

  createLeaveRequest: async () => {
    const { leaveForm, myLeaveRequests } = get()
    if (hasEmptyRequiredValue([leaveForm.startDate, leaveForm.endDate, leaveForm.reason])) {
      toast.error(REQUIRED_FIELDS_MESSAGE)
      return
    }
    set({ isLoadingLeave: true })
    try {
      const newLeave = await leaveRequestService.createLeaveRequest(leaveForm)
      set({ 
        myLeaveRequests: [newLeave, ...myLeaveRequests],
        dialogOpen: false,
        leaveForm: { type: "ANNUAL", startDate: "", endDate: "", reason: "" }
      })
      toast.success("Gửi đơn nghỉ phép thành công!")
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể gửi đơn nghỉ phép!"))
    } finally {
      set({ isLoadingLeave: false })
    }
  },

  deleteLeaveRequest: async (id) => {
    try {
      await leaveRequestService.deleteLeaveRequest(id)
      set((state) => ({
        myLeaveRequests: state.myLeaveRequests.filter(l => l.id !== id)
      }))
      toast.success("Đã xóa đơn nghỉ phép")
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa đơn nghỉ phép"))
    }
  },

  fetchAllLeaveRequests: async () => {
    set({ isLoadingLeave: true })
    try {
      const data = await leaveRequestService.getLeaveRequests()
      set({ leaveRequests: data })
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách đơn!"))
    } finally {
      set({ isLoadingLeave: false })
    }
  },

  updateLeaveStatus: async (id, status) => {
    try {
      await leaveRequestService.approveLeaveRequest(id, { status })
      set((state) => ({
        leaveRequests: state.leaveRequests.map(item => 
          item.id === id ? { ...item, status } : item
        )
      }))
      toast.success(status === 'APPROVED' ? 'Đã duyệt đơn' : 'Đã từ chối đơn')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cập nhật thất bại'))
    }
  }
}))