import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, CreditCard, Wallet, ArrowUpRight, Calendar } from "lucide-react"
import { useHrStatisticsPage } from "@/hooks/useHrStatisticsPage"
import { RoleChartCard } from "@/components/common/reports/RoleChartCard"
import { InlineLoading } from "@/components/common/Loading"

export default function HrStatisticsPage() {
    const {
        statistics,
        salaries,
        month,
        year,
        totalBonus,
        totalBudget,
        isLoading,
        reportData,
        loadingReport,
        months,
        years,
        setMonth,
        setYear,
        formatCurrency,
    } = useHrStatisticsPage()

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans antialiased text-slate-900">
            {/* Upper Header: Navigation & Filters */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-1">
                        <div className="h-1 w-4 bg-blue-600 rounded-full" />
                        Analytics Dashboard
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">HR Insights</h1>
                </div>

                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/60">
                    <div className="p-2 bg-slate-50 rounded-xl">
                        <Calendar className="h-4 w-4 text-slate-500" />
                    </div>
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-30 border-none focus:ring-0 font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {months.map(m => <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-22.5 border-none focus:ring-0 font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
                {/* Highlight Stats: Left Column */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <Card className="bg-blue-600 border-none shadow-blue-200/50 shadow-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Wallet className="h-32 w-32 text-white" />
                        </div>
                        <CardContent className="p-8 relative">
                            <p className="text-blue-100 font-medium mb-1">Tổng chi ngân sách</p>
                            <h2 className="text-3xl font-bold text-white mb-6">
                                {isLoading ? "..." : formatCurrency(totalBudget)}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-blue-100 bg-blue-500/30 w-fit px-3 py-1 rounded-full border border-white/10">
                                <ArrowUpRight className="h-4 w-4" />
                                <span>Tháng {month}/{year}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="border-none shadow-sm bg-white p-6">
                            <Users className="h-6 w-6 text-blue-500 mb-4" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nhân sự</p>
                            <h3 className="text-2xl font-bold mt-1">{statistics?.totalEmployees || 0}</h3>
                        </Card>
                        <Card className="border-none shadow-sm bg-white p-6">
                            <CreditCard className="h-6 w-6 text-emerald-500 mb-4" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tiền thưởng</p>
                            <h3 className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(totalBonus)}</h3>
                        </Card>
                    </div>
                </div>

                {/* Main Table: Right Column */}
                <Card className="col-span-12 lg:col-span-8 border-none shadow-sm bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Danh sách chi trả lương</h3>
                            <span className="text-xs font-medium text-slate-400">Tháng {month}/{year}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-50">
                                        <th className="px-6 py-4 font-medium text-left">Nhân viên</th>
                                        <th className="px-6 py-4 font-medium text-right">Thu nhập</th>
                                        <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {salaries.map((s) => (
                                        <tr key={s.id} className="group hover:bg-white transition-all">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600 border border-white shadow-sm">
                                                        {s.employee?.user?.profile?.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                                                            {s.employee?.user?.profile?.fullName}
                                                        </p>
                                                        <p className="text-xs text-slate-400">Mã NV: {s.id.slice(-5)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <p className="font-bold text-slate-900">{formatCurrency(s.amount)}</p>
                                                <p className="text-[10px] text-emerald-500 font-medium">Thưởng: +{formatCurrency(s.bonus)}</p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <Badge className={`rounded-lg px-3 py-1 border-none shadow-none font-semibold ${
                                                    s.status === "PAID"
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "bg-orange-50 text-orange-600"
                                                }`}>
                                                    {s.status === "PAID" ? "Hoàn tất" : "Đang xử lý"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="col-span-12 grid gap-6 lg:grid-cols-2">
                    <RoleChartCard
                        title="Lương theo phòng ban"
                        chart={reportData?.charts?.salaryByDepartment}
                        type="bar"
                    />
                    <RoleChartCard
                        title="Tăng trưởng nhân sự"
                        chart={reportData?.charts?.headcountGrowth}
                        type="line"
                    />
                    <RoleChartCard
                        title="Tỷ lệ nghỉ phép"
                        chart={reportData?.charts?.leaveRatio}
                        type="pie"
                    />
                    <RoleChartCard
                        title="Tổng lương theo tháng/năm"
                        chart={reportData?.charts?.monthlySalarySummary}
                        type="line"
                    />
                </div>

                {loadingReport && (
                    <InlineLoading text="Đang tải dữ liệu biểu đồ HR..." className="col-span-12" />
                )}
            </div>
        </div>
    )
}
