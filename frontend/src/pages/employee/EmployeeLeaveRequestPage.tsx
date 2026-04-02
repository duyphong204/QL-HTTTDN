import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import dayjs from "dayjs";

import { useEmployeeStore } from "@/store/employee.store";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { PaginationControls } from "@/components/common/PaginationControls";

import type { LeaveRequest } from "@/types/hr.type";
import type { CreateLeaveRequestValues } from "@/schemas/employee.schema";

export default function EmployeeLeaveRequestPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState<CreateLeaveRequestValues>({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const {
    myLeaveRequests,
    meta, // Bây giờ Store đã có meta nên sẽ hết lỗi TS2339
    isLoadingLeave,
    fetchMyLeaveRequests,
    createLeaveRequest,
    deleteLeaveRequest,
  } = useEmployeeStore();

  useEffect(() => {
    fetchMyLeaveRequests();
  }, [fetchMyLeaveRequests]);

  const handleChange = (key: keyof CreateLeaveRequestValues, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    await createLeaveRequest(form);
    setForm({ type: "ANNUAL", startDate: "", endDate: "", reason: "" });
    setDialogOpen(false);
  };

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn này?")) {
      await deleteLeaveRequest(id);
    }
  }, [deleteLeaveRequest]);

  const renderStatus = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    const labels = { PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối" };
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || styles.REJECTED}`}>
        {labels[status as keyof typeof labels] || "Từ chối"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đơn xin nghỉ</h1>
            <p className="text-sm text-gray-500 mt-1">Nộp và theo dõi đơn xin nghỉ của bạn</p>
          </div>

          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Nộp đơn xin nghỉ
          </button>
        </div>

        {/* TABLE CONTAINER */}
        {/* Đã sửa min-h-[400px] thành min-h-100 theo gợi ý Lint */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative min-h-100">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm kiếm lý do..."
          />

          <div className="relative">
            {isLoadingLeave && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-600 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Nhân viên</th>
                    <th className="px-6 py-4">Loại đơn</th>
                    <th className="px-6 py-4">Từ ngày</th>
                    <th className="px-6 py-4">Đến ngày</th>
                    <th className="px-6 py-4">Lý do</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {myLeaveRequests.length === 0 && !isLoadingLeave ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-medium">
                        Chưa có đơn xin nghỉ nào.
                      </td>
                    </tr>
                  ) : (
                    myLeaveRequests.map((request: LeaveRequest) => (
                      <tr key={request.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-gray-900">{request.employeeName || "Bạn"}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {request.type === "ANNUAL" && "Nghỉ phép"}
                          {request.type === "SICK" && "Nghỉ bệnh"}
                          {request.type === "MATERNITY" && "Nghỉ thai sản"}
                          {request.type === "RESIGNATION" && "Đơn nghỉ việc"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{dayjs(request.startDate).format("DD/MM/YYYY")}</td>
                        <td className="px-6 py-4 text-gray-600">{dayjs(request.endDate).format("DD/MM/YYYY")}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={request.reason}>{request.reason}</td>
                        <td className="px-6 py-4">{renderStatus(request.status)}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            {request.status === "PENDING" && (
                              <button
                                onClick={() => handleDelete(request.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationControls
            meta={meta}
            currentPage={meta?.page || 1}
            totalLabel="Tổng số đơn"
            isLoading={isLoadingLeave}
            onPageChange={() => {}}
          />
        </div>
      </div>

      {/* MODAL TRỰC TIẾP TRONG FILE */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nộp đơn xin nghỉ</h2>
              <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            </div>

            <div className="space-y-4">
              {/* Form fields giữ nguyên... */}
              {/* ... */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm shadow-blue-200 transition-all active:scale-95"
                >
                  Gửi đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}