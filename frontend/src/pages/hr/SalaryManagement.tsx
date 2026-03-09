import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { DollarSign, Download, Users, CheckCircle2 } from "lucide-react";
import { salaryApi } from "@/api/hr.api";
import type { Salary } from "@/types/hr.type";

export default function SalaryManagement() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("2026-03");

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const data = await salaryApi.getSalaries();
      setSalaries(data);
    } catch {
      toast.error("Lỗi khi tải danh sách lương!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const filteredSalaries = useMemo(() => {
    return salaries.filter((s) => {
      const month = `${s.year}-${String(s.month).padStart(2, "0")}`;
      return month === selectedMonth;
    });
  }, [salaries, selectedMonth]);

  const summary = useMemo(() => {
    let total = 0;
    let paid = 0;

    filteredSalaries.forEach((s) => {
      total += s.amount || 0;
      if (s.status === "PAID") paid++;
    });

    return {
      total: (total / 1000000).toFixed(1) + "M",
      count: filteredSalaries.length,
      paidCount: paid,
    };
  }, [filteredSalaries]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount || 0) + " đ";

  const handleExport = () => {
    toast.info("Chức năng xuất Excel đang phát triển");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Quản lý lương</h1>
          <p className="text-sm text-gray-500">Xem bảng lương của nhân viên</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <StatCard title="Tổng lương tháng" value={summary.total} icon={<DollarSign size={18} />} />
          <StatCard title="Số nhân sự" value={summary.count} icon={<Users size={18} />} />
          <StatCard
            title="Đã thanh toán"
            value={summary.paidCount}
            subValue={summary.count}
            icon={<CheckCircle2 size={18} />}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border shadow-sm">

          {/* Filter */}
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="2026-01">Tháng 01/2026</option>
              <option value="2026-02">Tháng 02/2026</option>
              <option value="2026-03">Tháng 03/2026</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Nhân viên</th>
                  <th className="px-4 py-3 text-center">Lương cơ bản</th>
                  <th className="px-4 py-3 text-center">Thưởng</th>
                  <th className="px-4 py-3 text-center">Khấu trừ</th>
                  <th className="px-4 py-3 text-center">Thực lĩnh</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredSalaries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredSalaries.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {s.employee?.user?.profile?.fullName || "Chưa cập nhật"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {formatCurrency(s.employee?.baseSalary || 0)}
                      </td>

                      <td className="px-4 py-3 text-center text-green-600 font-medium">
                        +{formatCurrency(s.bonus || 0)}
                      </td>

                      <td className="px-4 py-3 text-center text-red-600 font-medium">
                        -{formatCurrency(s.deduction || 0)}
                      </td>

                      <td className="px-4 py-3 text-center font-bold">
                        {formatCurrency(s.amount || 0)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === "PAID"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                            }`}
                        >
                          {s.status === "PAID"
                            ? "Đã thanh toán"
                            : "Chưa thanh toán"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={handleExport}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-5 text-sm space-y-2">
          <h3 className="font-semibold">Cách tính lương</h3>
          <p>• Lương thực lĩnh = Lương cơ bản + Thưởng - Khấu trừ</p>
          <p>• Thưởng dựa trên hiệu suất công việc</p>
          <p>• Khấu trừ gồm bảo hiểm, thuế và các khoản khác</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subValue }: any) {
  return (
    <div className="bg-white border rounded-xl p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <div className="flex items-end gap-1">
          <span className="text-xl font-bold">{value}</span>
          {subValue && <span className="text-xs text-gray-400">/{subValue}</span>}
        </div>
      </div>
      <div className="text-blue-600">{icon}</div>
    </div>
  );
}