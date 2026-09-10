import { useEffect, useState, useCallback } from "react";
import {
  UserPlus,
  Trash2,
  Eye,
  UserPen,
  BriefcaseBusiness,
  Users,
} from "lucide-react";
import { useHrEmployeeStore } from "@/stores/hrEmployee.store";
import { useEntityModal } from "@/hooks/useEntityModal";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { ROLE_BADGE } from "@/utils/role";

import { EmployeeFormModal } from "@/components/forms/EmployeeFormModal";
import { EmployeeDetailModal } from "@/components/forms/EmployeeDetailModal";
import { ChangePositionModal } from "@/components/forms/ChangePositionModal";
import { UpdateEmployeeProfileModal } from "@/components/forms/UpdateEmployeeProfileModal";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableLoadingRow } from "@/components/common/Loading";
import type {
  Employee,
  CreateEmployeeDto,
  ChangePositionDto,
  UpdateEmployeeProfileByHrDto,
} from "@/types/employee.types";

export default function EmployeeManagement() {
  const {
    employees,
    meta,
    filters,
    loadingEmployees,
    selectedEmployee,
    loadingEmployeeDetail,
    fetchEmployees,
    fetchEmployeeById,
    setFilters,
    createEmployee,
    changePosition,
    updateEmployeeProfile,
    deleteEmployee,
    clearSelectedEmployee,
  } = useHrEmployeeStore();

  // Modal: Thêm nhân viên mới
  const { modalOpen: addOpen, openCreateModal: openAdd, closeModal: closeAdd } =
    useEntityModal<Employee>();

  const handleCreate = useCallback(async (data: CreateEmployeeDto) => {
    await createEmployee(data);
    closeAdd();
  }, [createEmployee, closeAdd]);

  // Modal: Đổi chức vụ
  const [positionTarget, setPositionTarget] = useState<Employee | null>(null);

  // Modal: Sửa thông tin cá nhân
  const [profileTarget, setProfileTarget] = useState<Employee | null>(null);

  const { confirmAndRun } = useConfirmAction();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleChangePosition = useCallback(async (data: ChangePositionDto) => {
    if (!positionTarget) return;
    await changePosition(positionTarget.id, data);
  }, [positionTarget, changePosition]);

  const handleUpdateProfile = useCallback(async (data: UpdateEmployeeProfileByHrDto) => {
    if (!profileTarget) return;
    await updateEmployeeProfile(profileTarget.id, data);
  }, [profileTarget, updateEmployeeProfile]);

  const handleDelete = useCallback((id: string, name?: string) => {
    void confirmAndRun({
      message: `Bạn có chắc muốn cho nhân viên ${name ?? "này"} nghỉ việc? Hành động này không thể hoàn tác.`,
      action: () => deleteEmployee(id),
    });
  }, [confirmAndRun, deleteEmployee]);

  const getPositionBadge = (position?: string) => {
    return (
      ROLE_BADGE[position as keyof typeof ROLE_BADGE] || {
        label: position || "—",
        color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      }
    );
  };

  const renderTableBody = () => {
    if (loadingEmployees) return <TableLoadingRow colSpan={6} text="Đang tải dữ liệu..." />;
    
    if (employees.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">👥</span>
              <p className="font-medium text-gray-600">Không tìm thấy nhân viên nào.</p>
              <p className="text-sm">Vui lòng thử tìm kiếm với từ khóa khác.</p>
            </div>
          </td>
        </tr>
      );
    }

    return employees.map((emp) => {
      const badge = getPositionBadge(emp.position);
      return (
        <tr
          key={emp.id}
          className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40"
        >
          <td className="px-6 py-4 font-mono text-gray-500 text-xs">
            <span className="bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
              {emp.code}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {emp.user?.profile?.fullName || "—"}
              </span>
            </div>
          </td>
          <td className="px-6 py-4 text-gray-600 font-medium">
            {emp.department || "—"}
          </td>
          <td className="px-6 py-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm border border-white/20 ${badge.color}`}
            >
              {badge.label}
            </span>
          </td>
          <td className="px-6 py-4 text-gray-600">
            {emp.user?.email || "—"}
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-1 opacity-50 transition-opacity duration-200 group-hover:opacity-100">
              {/* Xem chi tiết + lịch sử chức vụ */}
              <button
                title="Xem chi tiết"
                onClick={() => fetchEmployeeById(emp.id)}
                className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95"
              >
                <Eye size={16} strokeWidth={2.5} />
              </button>

              {/* Sửa thông tin cá nhân */}
              <button
                title="Sửa thông tin cá nhân"
                onClick={() => setProfileTarget(emp)}
                className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 active:scale-95"
              >
                <UserPen size={16} strokeWidth={2.5} />
              </button>

              {/* Đổi chức vụ / lương */}
              <button
                title="Thay đổi chức vụ"
                onClick={() => setPositionTarget(emp)}
                className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95"
              >
                <BriefcaseBusiness size={16} strokeWidth={2.5} />
              </button>

              {/* Xóa / nghỉ việc */}
              <button
                title="Cho nghỉ việc"
                onClick={() => handleDelete(emp.id, emp.user?.profile?.fullName)}
                className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Users size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Quản lý nhân viên
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý hồ sơ, chức vụ và thông tin nhân sự
              </p>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 active:translate-y-0 active:scale-95"
          >
            <UserPlus size={18} strokeWidth={2.5} />
            Thêm nhân viên
          </button>
        </div>

        {/* Main Content Area */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar
              searchValue={filters.search || ""}
              onSearchChange={(val) => setFilters({ search: val, page: 1 })}
              searchPlaceholder="Tìm kiếm nhân viên (Tên, Mã NV, Email)..."
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-gray-50/80 font-semibold text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Mã NV</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Họ tên</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Phòng ban</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Chức vụ</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Email</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 bg-white">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100 bg-white p-4">
            <PaginationControls
              meta={meta}
              currentPage={filters.page}
              totalLabel="Nhân viên"
              isLoading={loadingEmployees}
              onPageChange={(p) => setFilters({ page: p })}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmployeeFormModal
        isOpen={addOpen}
        onClose={closeAdd}
        onSubmit={handleCreate}
      />

      <EmployeeDetailModal
        employee={selectedEmployee}
        isLoading={loadingEmployeeDetail}
        onClose={clearSelectedEmployee}
      />

      <ChangePositionModal
        isOpen={!!positionTarget}
        onClose={() => setPositionTarget(null)}
        employee={positionTarget}
        onSubmit={handleChangePosition}
      />

      <UpdateEmployeeProfileModal
        isOpen={!!profileTarget}
        onClose={() => setProfileTarget(null)}
        employee={profileTarget}
        onSubmit={handleUpdateProfile}
      />
    </div>
  );
}
