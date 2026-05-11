import { Clock, Phone, Mail, Calendar, CreditCard, MapPin } from "lucide-react";
import type { Employee } from "@/types/employee.types";
import { AppModal } from "@/components/common/AppModal";
import { PageLoading } from "@/components/common/Loading";
import dayjs from "dayjs";

interface Props {
  employee: Employee | null;
  isLoading?: boolean;
  onClose: () => void;
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "—";
  return `${value.toLocaleString("vi-VN")} ₫`;
}

function formatDate(value?: string | Date | null, format = "DD/MM/YYYY") {
  if (!value) return "Hiện tại";
  return dayjs(value).format(format);
}

export function EmployeeDetailModal({
  employee,
  isLoading = false,
  onClose,
}: Props) {
  const isOpen = !!employee || isLoading;
  const profile = employee?.user?.profile;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hồ sơ chi tiết nhân sự"
      maxWidthClassName="max-w-4xl"
    >
      <div className="p-6 md:p-8">
        {isLoading ? (
          <PageLoading text="Đang tải dữ liệu hồ sơ..." className="min-h-100" />
        ) : employee ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* HEADER: AVATAR & BASIC INFO */}
            <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-gray-100">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-100 shrink-0">
                {profile?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.fullName || "Chưa cập nhật"}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                    {employee.code}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600 font-medium">
                    {employee.position}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <Mail size={14} className="text-gray-400" />
                    {employee.user?.email}
                  </div>
                  <div className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <Phone size={14} className="text-gray-400" />
                    {profile?.phone || "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    Vào làm: {formatDate(employee.joinDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* THÔNG TIN CHI TIẾT CHIA CỘT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} /> Thông tin tổ chức
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phòng ban:</span>
                    <span className="font-semibold text-gray-900">
                      {employee.department || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                      Đang làm việc
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={14} /> Thông tin lương hiện tại
                </h4>
                <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 text-sm font-medium">
                      Lương cơ bản (Net):
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {formatCurrency(employee.baseSalary)}
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-400 italic leading-relaxed">
                    * Mức lương này là căn cứ để tính toán các khoản phụ cấp và
                    bảo hiểm.
                  </p>
                </div>
              </div>
            </div>

            {/* BẢNG LỊCH SỬ CHỨC VỤ VÀ LƯƠNG */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock size={20} className="text-orange-500" /> Lịch sử thay đổi
                nội bộ
              </h3>

              <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-semibold uppercase text-[11px]">
                        Giai đoạn
                      </th>
                      <th className="px-6 py-3 font-semibold uppercase text-[11px]">
                        Chức vụ & Phòng ban
                      </th>
                      <th className="px-6 py-3 font-semibold text-right uppercase text-[11px]">
                        Mức lương
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employee.jobHistories &&
                    employee.jobHistories.length > 0 ? (
                      employee.jobHistories.map((history) => (
                        <tr
                          key={history.id}
                          className="hover:bg-gray-50/80 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-medium">
                                {formatDate(history.startDate)} -{" "}
                                {formatDate(history.endDate)}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                REF_{history.id.split("-")[0].toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-800 font-semibold">
                              {history.position}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {history.department}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-blue-600">
                              {formatCurrency(history.baseSalary)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <Clock size={40} strokeWidth={1.5} />
                            <p className="text-sm font-medium">
                              Chưa ghi nhận lịch sử điều chuyển
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Không có dữ liệu hiển thị.
          </div>
        )}
      </div>
    </AppModal>
  );
}
