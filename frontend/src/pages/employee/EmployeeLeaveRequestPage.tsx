import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Eye, Edit, Trash2, Search, UserPlus } from "lucide-react";

import { employeeApi } from "@/api/hr.api";
import type { Employee } from "@/types/hr.type";
// import { EmployeeDetailModal } from "@/components/employee/EmployeeDetailModal";
import { AddEmployeeModal } from "@/components/employee/AddEmployeeModal";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Trạng thái quản lý Modals
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeApi.getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (formData: any) => {
    try {
      // NOTE: Gọi API create của bạn tại đây, truyền payload formData phù hợp
      // await employeeApi.createEmployee(formData);
      toast.success("Thêm nhân viên thành công!");
      setIsAddModalOpen(false);
      fetchEmployees();
    } catch {
      toast.error("Lỗi khi thêm nhân viên!");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;
    try {
      await employeeApi.deleteEmployee(id);
      toast.success("Đã xóa nhân viên!");
      fetchEmployees();
    } catch {
      toast.error("Lỗi khi xóa nhân viên!");
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.user?.profile?.fullName?.toLowerCase().includes(term) ||
        emp.code.toLowerCase().includes(term) ||
        emp.department?.toLowerCase().includes(term)
    );
  }, [employees, search]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Nhân sự</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý thông tin nhân viên</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            Thêm Nhân sự
          </button>
        </div>

        {/* Khối Bảng */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-2">

          {/* Box Tìm kiếm */}
          <div className="p-4 border-b border-gray-50">
            <div className="relative max-w-xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm nhân sự..."
                className="w-full h-11 pl-11 pr-4 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Họ tên</th>
                  <th className="px-6 py-4">Chức vụ</th>
                  <th className="px-6 py-4">Phòng ban</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Điện thoại</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Không tìm thấy nhân sự phù hợp.</td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {emp.user?.profile?.fullName || "Chưa cập nhật"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{emp.position || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{emp.department || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{emp.user?.email || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{emp.user?.profile?.phone || "—"}</td>
                      <td className="px-6 py-4">
                        {emp.resignDate ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600">
                            Đã nghỉ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600">
                            Đang làm
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Xóa nhân sự"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Render Modals */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEmployee}
      />

      {/* <EmployeeDetailModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      /> */}

    </div>
  );
}
