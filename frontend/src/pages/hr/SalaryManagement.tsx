import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Download, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { salaryApi } from "@/api/hr.api";
import type { Salary } from "@/types/hr.type";

export default function SalaryManagement() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch dữ liệu từ API thực tế
  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const data = await salaryApi.getSalaries();
      setSalaries(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách lương!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động load dữ liệu khi component vào trang
  useEffect(() => {
    fetchSalaries();
  }, []);

  /* ================= FILTER ================= */
  const filteredSalaries = salaries.filter((s) => {
    // Chuyển format {month, year} sang string dạng YYYY-MM
    const monthString = `${s.year}-${String(s.month).padStart(2, "0")}`;
    const matchesMonth = monthString === selectedMonth;
    
    // Tìm kiếm theo tên (có check null safety)
    const fullName = s.employee?.user?.profile?.fullName || "";
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase());

    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

    return matchesMonth && matchesSearch && matchesStatus;
  });

  /* ================= FORMAT ================= */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  /* ================= ACTION ================= */
  const handleMarkAsPaid = async (salaryId: string) => {
    try {
      // Cập nhật API (status => "PAID")
      await salaryApi.updateSalary(salaryId, { status: "PAID" });
      
      // Update state tại giao diện luôn để phản hồi ngay lập tức
      setSalaries(
        salaries.map((s) =>
          s.id === salaryId ? { ...s, status: "PAID" } : s
        )
      );
      toast.success("Đã thanh toán lương thành công!");
    } catch (error) {
      toast.error("Xảy ra lỗi khi thanh toán lương!");
      console.error(error);
    }
  };

  const handleExport = () => {
    toast.info("Chức năng xuất Excel đang trong quá trình phát triển");
  };

  /* ================= SUMMARY ================= */
  const totalSalary = filteredSalaries.reduce(
    (sum, s) => sum + (s.amount || 0),
    0
  );
  const paidCount = filteredSalaries.filter(
    (s) => s.status === "PAID"
  ).length;

  return (
    <div className="space-y-6 p-6">
      {/* TITLE VÀ HEADER ACTIONS */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Lương</h1>
          <p className="text-gray-500 mt-1">
            Quản lý và thanh toán lương nhân viên
          </p>
        </div>
        
        <Button variant="outline" onClick={fetchSalaries} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </Button>
      </div>

      {/* THẺ SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium">Tổng lương tháng</p>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalSalary / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium">Số nhân viên trong tháng</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSalaries.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium">Đã thanh toán</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidCount}/{filteredSalaries.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-01">Tháng 01/2026</SelectItem>
                <SelectItem value="2026-02">Tháng 02/2026</SelectItem>
                <SelectItem value="2026-03">Tháng 03/2026</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                <SelectItem value="PENDING">Chưa thanh toán</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm tên nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead className="text-right">Lương cơ bản</TableHead>
                  <TableHead className="text-right">Thưởng</TableHead>
                  <TableHead className="text-right">Khấu trừ</TableHead>
                  <TableHead className="text-right">Thực lĩnh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredSalaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Không tìm thấy bản ghi lương nào trong tháng này.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSalaries.map((salary) => (
                    <TableRow key={salary.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium">
                        {salary.employee?.user?.profile?.fullName || "N/A"}
                      </TableCell>

                      <TableCell className="text-right">
                        {formatCurrency(salary.employee?.baseSalary || 0)}
                      </TableCell>

                      <TableCell className="text-right text-green-600">
                        +{formatCurrency(salary.bonus || 0)}
                      </TableCell>

                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(salary.deduction || 0)}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {formatCurrency(salary.amount || 0)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            salary.status === "PAID"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }
                        >
                          {salary.status === "PAID"
                            ? "Đã thanh toán"
                            : "Chưa thanh toán"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {salary.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(salary.id)}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              Thanh toán
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}