import { useEffect, useState } from "react";
import {
  UserPlus,
  Trash2,
  Eye,
  UserPen,
  BriefcaseBusiness,
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

  const handleCreate = async (data: CreateEmployeeDto) => {
    await createEmployee(data);
    closeAdd();
  };

  // Modal: Đổi chức vụ
  const [positionTarget, setPositionTarget] = useState<Employee | null>(null);

  // Modal: Sửa thông tin cá nhân
  const [profileTarget, setProfileTarget] = useState<Employee | null>(null);

  const { confirmAndRun } = useConfirmAction();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleChangePosition = async (data: ChangePositionDto) => {
    if (!positionTarget) return;
    await changePosition(positionTarget.id, data);
  };

  const handleUpdateProfile = async (data: UpdateEmployeeProfileByHrDto) => {
    if (!profileTarget) return;
    await updateEmployeeProfile(profileTarget.id, data);
  };

  const handleDelete = (id: string, name?: string) => {
    confirmAndRun({
      message: `Bạn có chắc muốn cho nhân viên ${name ?? ""} nghỉ việc?`,
      action: () => deleteEmployee(id),
    });
  };

  const getPositionBadge = (position?: string) => {
    return (
      ROLE_BADGE[position as keyof typeof ROLE_BADGE] || {
        label: position || "—",
        color: "bg-indigo-100 text-indigo-700",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý nhân viên
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý hồ sơ và thông tin nhân sự
            </p>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <UserPlus size={18} /> Thêm nhân viên
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2 overflow-hidden">
          <DataTableToolbar
            searchValue={filters.search || ""}
            onSearchChange={(val) => setFilters({ search: val, page: 1 })}
            searchPlaceholder="Tìm kiếm nhân viên..."
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Họ tên</th>
                  <th className="px-6 py-4">Phòng ban</th>
                  <th className="px-6 py-4">Chức vụ</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loadingEmployees ? (
                  <TableLoadingRow colSpan={6} text="Đang tải dữ liệu..." />
                ) : employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Không tìm thấy nhân viên.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const badge = getPositionBadge(emp.position);
                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-gray-50/70 transition-colors group"
                      >
                        <td className="px-6 py-4 font-mono text-gray-900">
                          {emp.code}
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {emp.user?.profile?.fullName || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {emp.department || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {emp.user?.email || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            {/* Xem chi tiết + lịch sử chức vụ */}
                            <button
                              title="Xem chi tiết"
                              onClick={() => fetchEmployeeById(emp.id)}
                              className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                              <Eye size={17} />
                            </button>

                            {/* Sửa thông tin cá nhân */}
                            <button
                              title="Sửa thông tin cá nhân"
                              onClick={() => setProfileTarget(emp)}
                              className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <UserPen size={17} />
                            </button>

                            {/* Đổi chức vụ / lương */}
                            <button
                              title="Thay đổi chức vụ"
                              onClick={() => setPositionTarget(emp)}
                              className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <BriefcaseBusiness size={17} />
                            </button>

                            {/* Xóa / nghỉ việc */}
                            <button
                              title="Cho nghỉ việc"
                              onClick={() =>
                                handleDelete(
                                  emp.id,
                                  emp.user?.profile?.fullName,
                                )
                              }
                              className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            meta={meta}
            currentPage={filters.page}
            isLoading={loadingEmployees}
            onPageChange={(p) => setFilters({ page: p })}
          />
        </div>
      </div>

      {/* Modal thêm nhân viên mới */}
      <EmployeeFormModal
        isOpen={addOpen}
        onClose={closeAdd}
        onSubmit={handleCreate}
      />

      {/* Modal xem chi tiết + lịch sử chức vụ */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        isLoading={loadingEmployeeDetail}
        onClose={clearSelectedEmployee}
      />

      {/* Modal đổi chức vụ */}
      <ChangePositionModal
        isOpen={!!positionTarget}
        onClose={() => setPositionTarget(null)}
        employee={positionTarget}
        onSubmit={handleChangePosition}
      />

      {/* Modal sửa thông tin cá nhân */}
      <UpdateEmployeeProfileModal
        isOpen={!!profileTarget}
        onClose={() => setProfileTarget(null)}
        employee={profileTarget}
        onSubmit={handleUpdateProfile}
      />
    </div>
  );
}
