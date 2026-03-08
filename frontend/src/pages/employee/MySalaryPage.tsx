import { useState, useEffect } from "react";
import { toast } from "sonner";
import { salaryApi } from "@/api/hr.api";
import type { Salary } from "@/types/hr.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Printer, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function MySalaryPage() {
    const [salaries, setSalaries] = useState<Salary[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState(String(currentYear));
    const [filterMonth, setFilterMonth] = useState("ALL");

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const params: { year?: number; month?: number } = { year: Number(filterYear) };
            if (filterMonth !== "ALL") params.month = Number(filterMonth);
            const data = await salaryApi.getMySalaries(params);
            setSalaries(data);
        } catch {
            toast.error("Không thể tải bảng lương!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSalaries(); }, [filterYear, filterMonth]);

    const totalNet = salaries.reduce((sum, s) => sum + s.amount, 0);

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bảng Lương Của Tôi</h1>
                    <p className="text-sm text-gray-500">Xem và in bảng lương theo tháng/năm</p>
                </div>
                <Button onClick={() => window.print()} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Printer className="h-4 w-4" /> In Bảng Lương
                </Button>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-full sm:w-36">
                        <SelectValue placeholder="Năm" />
                    </SelectTrigger>
                    <SelectContent>
                        {YEARS.map(y => <SelectItem key={y} value={String(y)}>Năm {y}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-full sm:w-44">
                        <SelectValue placeholder="Tháng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Cả năm</SelectItem>
                        {MONTHS.map(m => <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Thẻ tổng */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Tổng thực lĩnh</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalNet)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Tổng thưởng</p>
                            <p className="text-lg font-bold text-green-700">{formatCurrency(salaries.reduce((s, r) => s + r.bonus, 0))}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Tổng khấu trừ</p>
                            <p className="text-lg font-bold text-red-700">{formatCurrency(salaries.reduce((s, r) => s + r.deduction, 0))}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* BẢNG LƯƠNG (Phần này sẽ được in ra giấy khi print) */}
            <div>
                {loading ? (
                    <div className="text-center p-12 text-gray-400">Đang tải...</div>
                ) : salaries.length === 0 ? (
                    <div className="text-center p-12 text-gray-400">Chưa có bảng lương nào trong khoảng thời gian này.</div>
                ) : (
                    salaries.map((salary) => (
                        <Card key={salary.id} className="mb-6 print:shadow-none print:border print:mb-12">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
                                <h2 className="text-center text-white text-xl font-bold tracking-wide py-2">
                                    PHIẾU LƯƠNG THÁNG {salary.month}/{salary.year}
                                </h2>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="py-3 pr-4 text-sm font-medium text-gray-500 w-48">Lương cơ bản</td>
                                                <td className="py-3 text-sm font-semibold text-gray-900">{formatCurrency(salary.employee?.baseSalary || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 pr-4 text-sm font-medium text-gray-500">Thưởng</td>
                                                <td className="py-3 text-sm font-semibold text-green-700">+ {formatCurrency(salary.bonus)}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 pr-4 text-sm font-medium text-gray-500">Khấu trừ</td>
                                                <td className="py-3 text-sm font-semibold text-red-700">- {formatCurrency(salary.deduction)}</td>
                                            </tr>
                                            <tr className="bg-blue-50 rounded-lg">
                                                <td className="py-4 pr-4 text-base font-bold text-blue-700 pl-2 rounded-l">THỰC LĨNH</td>
                                                <td className="py-4 text-xl font-extrabold text-blue-800">{formatCurrency(salary.amount)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <Badge variant="secondary" className={salary.status === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                        {salary.status === "PAID" ? "✓ Đã nhận lương" : "⏳ Chưa thanh toán"}
                                    </Badge>
                                    <p className="text-xs text-gray-400">Ngày in: {new Date().toLocaleDateString("vi-VN")}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
