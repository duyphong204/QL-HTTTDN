import { useState, useEffect } from "react";
import { toast } from "sonner";
import { employeeApi } from "@/api/hr.api";
import { userApi } from "@/api/user.api";
import type { Employee } from "@/types/hr.type";
import type { User } from "@/types/user.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, History } from "lucide-react";

type ModalType = "add" | "edit-position" | "history" | null;

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Form State
  const [addForm, setAddForm] = useState({ userId: "", department: "", position: "", baseSalary: "", joinDate: "" });
  const [posForm, setPosForm] = useState({ department: "", position: "", baseSalary: "" });

  useEffect(() => { fetchEmployees(); fetchUsers(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeApi.getEmployees();
      setEmployees(data);
    } catch { toast.error("Lỗi khi tải danh sách nhân viên!"); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch { /* bỏ qua */ }
  };

  const handleAdd = async () => {
    try {
      await employeeApi.createEmployee(addForm as any);
      toast.success("Thêm nhân viên thành công!");
      setModal(null);
      fetchEmployees();
    } catch { toast.error("Lỗi khi thêm nhân viên!"); }
  };

  const handleUpdatePosition = async () => {
    if (!selectedEmp) return;
    try {
      await employeeApi.updateEmployee(selectedEmp.id, {
        department: posForm.department,
        position: posForm.position,
        baseSalary: Number(posForm.baseSalary),
      });
      toast.success("Cập nhật chức vụ thành công! Lịch sử công tác đã được lưu.");
      setModal(null);
      fetchEmployees();
    } catch { toast.error("Lỗi khi cập nhật chức vụ!"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Cho nhân viên này nghỉ việc?")) return;
    try {
      await employeeApi.deleteEmployee(id);
      toast.success("Đã xử lý nghỉ việc thành công!");
      fetchEmployees();
    } catch { toast.error("Lỗi khi xử lý!"); }
  };

  const openEditPosition = (emp: Employee) => {
    setSelectedEmp(emp);
    setPosForm({ department: emp.department || "", position: emp.position || "", baseSalary: String(emp.baseSalary) });
    setModal("edit-position");
  };

  const filtered = employees.filter(e =>
    (e.user?.profile?.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    e.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhân sự</h1>
          <p className="text-sm text-gray-500">{employees.length} nhân viên đang làm việc</p>
        </div>
        <Button onClick={() => setModal("add")} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Thêm Nhân viên
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên hoặc mã NV..." className="pl-10" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left font-medium text-gray-600">Mã NV</th>
                  <th className="p-4 text-left font-medium text-gray-600">Họ Tên</th>
                  <th className="p-4 text-left font-medium text-gray-600 hidden sm:table-cell">Phòng ban</th>
                  <th className="p-4 text-left font-medium text-gray-600 hidden md:table-cell">Chức vụ</th>
                  <th className="p-4 text-right font-medium text-gray-600 hidden lg:table-cell">Lương Cơ Bản</th>
                  <th className="p-4 text-center font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-400">Đang tải...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-400">Không có nhân viên nào.</td></tr>
                ) : filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-semibold text-gray-600">{emp.code}</td>
                    <td className="p-4 font-medium text-gray-900">{emp.user?.profile?.fullName || "N/A"}</td>
                    <td className="p-4 text-gray-600 hidden sm:table-cell">{emp.department || "—"}</td>
                    <td className="p-4 hidden md:table-cell">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">{emp.position || "Nhân viên"}</Badge>
                    </td>
                    <td className="p-4 text-right font-semibold text-gray-800 hidden lg:table-cell">{emp.baseSalary?.toLocaleString("vi-VN")} ₫</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700" onClick={() => openEditPosition(emp)} title="Đổi chức vụ/lương">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 hover:bg-purple-50" onClick={() => { setSelectedEmp(emp); setModal("history"); }} title="Lịch sử công tác">
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(emp.id)} title="Cho nghỉ việc">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ===== MODAL THÊM NHÂN VIÊN ===== */}
      {modal === "add" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold">Thêm Nhân Viên Mới</h2>
              <div>
                <label className="text-sm font-medium text-gray-600">Chọn User (tài khoản đã có)</label>
                <select className="mt-1 w-full border rounded-md p-2 text-sm" onChange={e => setAddForm(f => ({ ...f, userId: e.target.value }))}>
                  <option value="">-- Chọn User --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.email} ({u.profile?.fullName || "Chưa có tên"})</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-600">Phòng ban</label>
                <Input className="mt-1" placeholder="Ví dụ: Kinh Doanh" onChange={e => setAddForm(f => ({ ...f, department: e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-gray-600">Chức vụ</label>
                <Input className="mt-1" placeholder="Ví dụ: Nhân viên KD" onChange={e => setAddForm(f => ({ ...f, position: e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-gray-600">Lương cơ bản (VNĐ)</label>
                <Input className="mt-1" type="number" placeholder="5000000" onChange={e => setAddForm(f => ({ ...f, baseSalary: e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-gray-600">Ngày vào làm</label>
                <Input className="mt-1" type="date" onChange={e => setAddForm(f => ({ ...f, joinDate: e.target.value }))} /></div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdd} className="flex-1 bg-blue-600 hover:bg-blue-700">Thêm</Button>
                <Button variant="outline" onClick={() => setModal(null)} className="flex-1">Huỷ</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== MODAL ĐỔI CHỨC VỤ / LƯƠNG ===== */}
      {modal === "edit-position" && selectedEmp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold">Cập Nhật Chức Vụ / Lương</h2>
              <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-3">⚠️ Thay đổi sẽ TỰ ĐỘNG lưu lịch sử công tác với thời điểm hiện tại.</p>
              <div><label className="text-sm font-medium text-gray-600">Phòng ban mới</label>
                <Input className="mt-1" value={posForm.department} onChange={e => setPosForm(f => ({ ...f, department: e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-gray-600">Chức vụ mới</label>
                <Input className="mt-1" value={posForm.position} onChange={e => setPosForm(f => ({ ...f, position: e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-gray-600">Lương cơ bản mới (VNĐ)</label>
                <Input className="mt-1" type="number" value={posForm.baseSalary} onChange={e => setPosForm(f => ({ ...f, baseSalary: e.target.value }))} /></div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleUpdatePosition} className="flex-1 bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
                <Button variant="outline" onClick={() => setModal(null)} className="flex-1">Huỷ</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== MODAL LỊCH SỬ CÔNG TÁC ===== */}
      {modal === "history" && selectedEmp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Lịch Sử Công Tác - {selectedEmp.user?.profile?.fullName || selectedEmp.code}</h2>
                <Button variant="ghost" size="sm" onClick={() => setModal(null)}>✕</Button>
              </div>
              {(selectedEmp as any).jobHistories?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Chưa có lịch sử công tác.</p>
              ) : (
                <div className="space-y-3">
                  {((selectedEmp as any).jobHistories || []).map((h: any, i: number) => (
                    <div key={i} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{h.position || "Nhân viên"}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{h.department || "Chưa phân công"}</p>
                        </div>
                        <p className="font-bold text-green-700 text-sm">{h.baseSalary?.toLocaleString("vi-VN")} ₫</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(h.startDate).toLocaleDateString("vi-VN")} → {h.endDate ? new Date(h.endDate).toLocaleDateString("vi-VN") : "Hiện tại"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
