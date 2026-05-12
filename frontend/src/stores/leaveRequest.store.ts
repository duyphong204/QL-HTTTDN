import { create } from "zustand";
import { leaveRequestService } from "@/services/hr.service";
import { getErrorMessage } from "@/stores/store.helpers";
import { toast } from "sonner";
import type {
  LeaveRequest,
  LeaveBalance,
  CreateLeaveRequestDto,
  QueryLeaveRequestDto,
} from "@/types/leave.types";

interface LeaveRequestState {
  myLeaveRequests: LeaveRequest[];
  allLeaveRequests: LeaveRequest[];
  leaveBalance: LeaveBalance | null;
  isLoading: boolean;

  fetchMyRequests: () => Promise<void>;
  fetchMyBalance: () => Promise<void>;
  createRequest: (payload: CreateLeaveRequestDto) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;

  fetchAllRequests: (params?: QueryLeaveRequestDto) => Promise<void>;
  approveRequest: (
    id: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) => Promise<void>;
}

export const useLeaveRequestStore = create<LeaveRequestState>((set, get) => ({
  myLeaveRequests: [],
  allLeaveRequests: [],
  leaveBalance: null,
  isLoading: false,

  fetchMyRequests: async () => {
    set({ isLoading: true });
    try {
      const data = await leaveRequestService.getMyLeaveRequests();
      set({ myLeaveRequests: data });
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải đơn của bạn"));
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyBalance: async () => {
    try {
      const data = await leaveRequestService.getMyLeaveBalance();
      set({ leaveBalance: data });
    } catch {
      // Không hiện toast lỗi vì có thể user không có record employee
    }
  },

  createRequest: async (payload: CreateLeaveRequestDto) => {
    set({ isLoading: true });
    try {
      const newReq = await leaveRequestService.createLeaveRequest(payload);
      set({ myLeaveRequests: [newReq, ...get().myLeaveRequests] });
      toast.success("Gửi đơn nghỉ phép thành công!");
      // Làm mới balance sau khi gửi đơn (nếu là ANNUAL sẽ kiểm tra balance)
      get().fetchMyBalance();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRequest: async (id: string) => {
    try {
      await leaveRequestService.deleteLeaveRequest(id);
      set({
        myLeaveRequests: get().myLeaveRequests.filter((r) => r.id !== id),
      });
      toast.success("Đã xóa đơn nghỉ phép");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  fetchAllRequests: async (params?: QueryLeaveRequestDto) => {
    set({ isLoading: true });
    try {
      const data = await leaveRequestService.getLeaveRequests(params);
      set({ allLeaveRequests: data });
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách đơn"));
    } finally {
      set({ isLoading: false });
    }
  },

  approveRequest: async (
    id: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) => {
    try {
      await leaveRequestService.updateLeaveStatus(id, {
        status,
        rejectionReason,
      });
      set({
        allLeaveRequests: get().allLeaveRequests.map((r) =>
          r.id === id
            ? { ...r, status, ...(rejectionReason ? { rejectionReason } : {}) }
            : r,
        ),
      });
      toast.success(status === "APPROVED" ? "Đã duyệt đơn" : "Đã từ chối đơn");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },
}));
