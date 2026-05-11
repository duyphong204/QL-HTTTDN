import { create } from "zustand";
import { toast } from "sonner";
import { employeeService } from "@/services/hr.service";
import { getErrorMessage } from "@/stores/store.helpers";
import { mergeFiltersWithPageReset } from "@/stores/store.helpers";
import type {
  Employee,
  CreateEmployeeDto,
  // UpdateEmployeeDto,
  ChangePositionDto,
  UpdateEmployeeProfileByHrDto,
} from "@/types/employee.types";
import type {
  BaseFilters,
  PaginationMeta,
  SortOrder,
} from "@/types/common.types";

type EmployeeFilters = BaseFilters & {
  department?: string;
  position?: string;
  isActive?: boolean;
};

interface HrEmployeeState {
  employees: Employee[];
  meta: PaginationMeta | null;
  filters: EmployeeFilters;
  selectedEmployee: Employee | null;
  loadingEmployees: boolean;
  loadingEmployeeDetail: boolean;

  // Actions
  setFilters: (filters: Partial<EmployeeFilters>) => void;
  fetchEmployees: () => Promise<void>;
  fetchEmployeeById: (id: string) => Promise<void>;
  createEmployee: (data: CreateEmployeeDto) => Promise<void>;
  changePosition: (id: string, data: ChangePositionDto) => Promise<void>;
  updateEmployeeProfile: (
    id: string,
    data: UpdateEmployeeProfileByHrDto,
  ) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  clearSelectedEmployee: () => void;
}

export const useHrEmployeeStore = create<HrEmployeeState>((set, get) => ({
  employees: [],
  meta: null,
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "code",
    sortOrder: "asc" as SortOrder,
    department: "",
    position: "",
    isActive: true,
  },
  selectedEmployee: null,
  loadingEmployees: false,
  loadingEmployeeDetail: false,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: mergeFiltersWithPageReset(state.filters, newFilters),
    }));
    get().fetchEmployees(); // Fetch lại khi filter thay đổi
  },

  fetchEmployees: async () => {
    set({ loadingEmployees: true });
    try {
      const { filters } = get();
      const response = await employeeService.getEmployees({
        ...filters,
        department: filters.department || undefined,
        position: filters.position || undefined,
      });
      set({ employees: response.data, meta: response.meta });
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách nhân viên"));
    } finally {
      set({ loadingEmployees: false });
    }
  },

  fetchEmployeeById: async (id: string) => {
    set({ loadingEmployeeDetail: true });
    try {
      const employee = await employeeService.getEmployeeById(id);
      set({ selectedEmployee: employee });
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải chi tiết nhân viên"));
    } finally {
      set({ loadingEmployeeDetail: false });
    }
  },

  createEmployee: async (data) => {
    try {
      await employeeService.createEmployee(data);
      toast.success("Thêm nhân sự thành công");
      await get().fetchEmployees();
    } catch (error) {
      toast.error(getErrorMessage(error, "Thêm nhân sự thất bại"));
      throw error;
    }
  },

  changePosition: async (id, data) => {
    try {
      await employeeService.changePosition(id, data);
      toast.success("Thay đổi chức vụ thành công");
      await get().fetchEmployees();
    } catch (error) {
      toast.error(getErrorMessage(error, "Thay đổi chức vụ thất bại"));
      throw error;
    }
  },

  updateEmployeeProfile: async (id, data) => {
    try {
      await employeeService.updateEmployeeProfile(id, data);
      toast.success("Cập nhật thông tin nhân viên thành công");
      await get().fetchEmployees();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Cập nhật thông tin nhân viên thất bại"),
      );
      throw error;
    }
  },

  deleteEmployee: async (id) => {
    try {
      await employeeService.deleteEmployee(id);
      toast.success("Đã xóa nhân sự");
      await get().fetchEmployees();
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa nhân sự thất bại"));
    }
  },

  clearSelectedEmployee: () => set({ selectedEmployee: null }),
}));
