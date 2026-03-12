import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DollarSign, Users, CheckCircle2, Download } from "lucide-react";
import { salaryApi } from "@/api/hr.api";
import type { Salary } from "@/types/hr.type";


const STATUS_BADGE = {
  PAID: {
    label: "Đã thanh toán",
    color: "bg-green-100 text-green-600",
  },
  PENDING: {
    label: "Chưa thanh toán",
    color: "bg-yellow-100 text-yellow-600",
  },
} as const;


export default function SalaryManagement() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("2026-03");

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const data = await salaryApi.getSalaries();
      setSalaries(data);
    } catch {
      toast.error("Lỗi khi tải bảng lương");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */

  const filteredSalaries = useMemo(() => {
    return salaries.filter((s) => {
      const month = `${s.year}-${String(s.month).padStart(2, "0")}`;
      return month === selectedMonth;
    });
  }, [salaries, selectedMonth]);

  /* ================= SUMMARY ================= */

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
      paid,
    };
  }, [filteredSalaries]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount || 0) + " đ";

  const handleExport = () => {
    toast.info("Xuất Excel đang phát triển");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý lương
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Theo dõi bảng lương nhân viên
            </p>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-10 px-4 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="2026-01">Tháng 01/2026</option>
            <option value="2026-02">Tháng 02/2026</option>
            <option value="2026-03">Tháng 03/2026</option>
          </select>

        </div>

        {/* STATS */}

        <div className="grid gap-4 md:grid-cols-3">

          <StatCard
            title="Tổng lương"
            value={summary.total}
            icon={<DollarSign size={18} />}
          />

          <StatCard
            title="Nhân sự"
            value={summary.count}
            icon={<Users size={18} />}
          />

          <StatCard
            title="Đã thanh toán"
            value={`${summary.paid}/${summary.count}`}
            icon={<CheckCircle2 size={18} />}
          />

        </div>

        {/* TABLE CONTAINER */}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm whitespace-nowrap">

              {/* TABLE HEADER */}

              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nhân viên</th>
                  <th className="px-6 py-4 text-center">Lương cơ bản</th>
                  <th className="px-6 py-4 text-center">Thưởng</th>
                  <th className="px-6 py-4 text-center">Khấu trừ</th>
                  <th className="px-6 py-4 text-center">Thực lĩnh</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody className="divide-y divide-gray-50">

                {loading ? (
                  <EmptyRow text="Đang tải dữ liệu..." />
                ) : filteredSalaries.length === 0 ? (
                  <EmptyRow text="Không có dữ liệu bảng lương." />
                ) : (
                  filteredSalaries.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {s.employee?.user?.profile?.fullName || "—"}
                      </td>

                      <td className="px-6 py-4 text-center text-gray-600">
                        {formatCurrency(s.employee?.baseSalary || 0)}
                      </td>

                      <td className="px-6 py-4 text-center text-green-600 font-medium">
                        +{formatCurrency(s.bonus || 0)}
                      </td>

                      <td className="px-6 py-4 text-center text-red-600 font-medium">
                        -{formatCurrency(s.deduction || 0)}
                      </td>

                      <td className="px-6 py-4 text-center font-semibold text-gray-900">
                        {formatCurrency(s.amount || 0)}
                      </td>

                      <td className="px-6 py-4 text-center">

                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            STATUS_BADGE[
                              s.status as keyof typeof STATUS_BADGE
                            ]?.color
                          }`}
                        >
                          {
                            STATUS_BADGE[
                              s.status as keyof typeof STATUS_BADGE
                            ]?.label
                          }
                        </span>

                      </td>

                      <td className="px-6 py-4 text-center">

                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">

                          <button
                            onClick={handleExport}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Xuất Excel"
                          >
                            <Download size={18} />
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
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center">

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-xl font-bold text-gray-900">{value}</span>
      </div>

      <div className="text-blue-600">{icon}</div>

    </div>
  );
}

/* ================= EMPTY ROW ================= */

function EmptyRow({ text }: { text: string }) {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
        {text}
      </td>
    </tr>
  );
}