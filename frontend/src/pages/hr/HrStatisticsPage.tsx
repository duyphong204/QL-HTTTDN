import { useState, useEffect } from "react";
import { employeeApi, salaryApi } from "@/api/hr.api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, DollarSign, Gift } from "lucide-react";
import { toast } from "sonner";

const currentYear = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function HrStatisticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [allSalaries, setAllSalaries] = useState<any[]>([]);
    const [year, setYear] = useState(String(currentYear));
    const [month, setMonth] = useState(String(new Date().getMonth() + 1));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [hrStats, salaries] = await Promise.all([
                    employeeApi.getHrStatistics(),
                    salaryApi.getSalaries(),
                ]);
                setStats(hrStats);
                setAllSalaries(salaries);
            } catch { toast.error("Không thể tải thống kê!"); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const filteredSalaries = allSalaries.filter(s => s.month === Number(month) && s.year === Number(year));
    const totalPay = filteredSalaries.reduce((sum, s) => sum + s.amount, 0);
    const totalBonus = filteredSalaries.reduce((sum, s) => sum + s.bonus, 0);

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Thống Kê Nhân Sự & Lương</h1>
                <p className="text-sm text-gray-500">Tổng quan tình hình nhân sự tháng này</p>
            </div>

            {/* 4 thẻ tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Nhân viên đang làm", value: stats?.totalEmployees ?? "—", icon: Users, color: "blue" },
                    { label: "Đã nghỉ việc (lũy kế)", value: stats?.totalResigned ?? "—", icon: TrendingUp, color: "red" },
                    { label: "Quỹ lương tháng này", value: stats ? formatCurrency(stats.totalSalaryPaid) : "—", icon: DollarSign, color: "green" },
                    { label: "Tổng thưởng tháng này", value: stats ? formatCurrency(stats.totalBonus) : "—", icon: Gift, color: "purple" },
                ].map(card => (
                    <Card key={card.label}>
                        <CardContent className="pt-5 flex items-center gap-4">
                            <div className={`h-11 w-11 rounded-lg bg-${card.color}-100 flex items-center justify-center shrink-0`}>
                                <card.icon className={`h-5 w-5 text-${card.color}-600`} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
                                <p className="text-xl font-bold text-gray-900 mt-0.5">{loading ? "..." : card.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chi tiết lương theo tháng */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">Chi Tiết Lương Theo Tháng</h2>
                        <div className="flex gap-2">
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map(m => <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[currentYear, currentYear - 1].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3 text-left font-medium text-gray-600">Nhân viên</th>
                                    <th className="p-3 text-right font-medium text-gray-600">Lương cơ bản</th>
                                    <th className="p-3 text-right font-medium text-gray-600">Thưởng</th>
                                    <th className="p-3 text-right font-medium text-gray-600">Khấu trừ</th>
                                    <th className="p-3 text-right font-medium text-gray-600">Thực lĩnh</th>
                                    <th className="p-3 text-center font-medium text-gray-600">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSalaries.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">Không có dữ liệu lương cho tháng {month}/{year}</td></tr>
                                ) : filteredSalaries.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50/50">
                                        <td className="p-3 font-medium text-gray-900">{s.employee?.user?.profile?.fullName || "N/A"}</td>
                                        <td className="p-3 text-right text-gray-700">{formatCurrency(s.employee?.baseSalary || 0)}</td>
                                        <td className="p-3 text-right text-green-700 font-medium">+{formatCurrency(s.bonus)}</td>
                                        <td className="p-3 text-right text-red-700 font-medium">-{formatCurrency(s.deduction)}</td>
                                        <td className="p-3 text-right font-bold text-gray-900">{formatCurrency(s.amount)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}>
                                                {s.status === "PAID" ? "Đã trả" : "Chưa trả"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {filteredSalaries.length > 0 && (
                                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                    <tr>
                                        <td className="p-3 font-bold text-gray-700">Tổng cộng ({filteredSalaries.length} NV)</td>
                                        <td colSpan={2} className="p-3 text-right font-bold text-green-700">Thưởng: {formatCurrency(totalBonus)}</td>
                                        <td colSpan={2} className="p-3 text-right font-bold text-blue-700">Thực trả: {formatCurrency(totalPay)}</td>
                                        <td className="p-3"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
