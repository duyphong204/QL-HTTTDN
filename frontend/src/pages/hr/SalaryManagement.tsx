import React, { useState } from "react";
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
import { DollarSign, Download, Search } from "lucide-react";
import { toast } from "sonner";

/* ================= TYPES ================= */
type Salary = {
  id: string;
  month: number;
  year: number;
  amount: number;
  bonus: number;
  deduction: number;
  status: "PAID" | "PENDING";
  employee: {
    id: string;
    code: string;
    baseSalary: number;
    user: {
      id: string;
      email: string;
      profile: {
        fullName: string;
        phone: string | null;
      };
    };
  };
};

/* ================= MOCK DATA ================= */
const mockSalaries: Salary[] = [
  {
    id: "1",
    month: 3,
    year: 2026,
    amount: 12800000,
    bonus: 1000000,
    deduction: 200000,
    status: "PENDING",
    employee: {
      id: "emp1",
      code: "NV0001",
      baseSalary: 12000000,
      user: {
        id: "user1",
        email: "dat@gmail.com",
        profile: {
          fullName: "Lê Văn Đạt",
          phone: null,
        },
      },
    },
  },
  {
    id: "2",
    month: 3,
    year: 2026,
    amount: 15500000,
    bonus: 1500000,
    deduction: 500000,
    status: "PAID",
    employee: {
      id: "emp2",
      code: "NV0002",
      baseSalary: 14000000,
      user: {
        id: "user2",
        email: "minh@gmail.com",
        profile: {
          fullName: "Phạm Thị Minh",
          phone: null,
        },
      },
    },
  },
];

/* ================= COMPONENT ================= */
const SalaryManagement = () => {
  const [salaries, setSalaries] = useState<Salary[]>(mockSalaries);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ================= FILTER ================= */
  const filteredSalaries = salaries.filter((s) => {
    const monthString = `${s.year}-${String(s.month).padStart(2, "0")}`;
    const matchesMonth = monthString === selectedMonth;
    const matchesSearch = s.employee.user.profile.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || s.status === statusFilter;

    return matchesMonth && matchesSearch && matchesStatus;
  });

  /* ================= FORMAT ================= */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  /* ================= ACTION ================= */
  const handleMarkAsPaid = (salaryId: string) => {
    setSalaries(
      salaries.map((s) =>
        s.id === salaryId ? { ...s, status: "PAID" } : s
      )
    );
    toast.success("Đã thanh toán lương!");
  };

  const handleExport = () => {
    toast.info("Chức năng xuất Excel đang phát triển");
  };

  /* ================= SUMMARY ================= */
  const totalSalary = filteredSalaries.reduce(
    (sum, s) => sum + s.amount,
    0
  );
  const paidCount = filteredSalaries.filter(
    (s) => s.status === "PAID"
  ).length;

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold">Quản lý Lương</h1>
        <p className="text-gray-500 mt-1">
          Quản lý và thanh toán lương nhân viên
        </p>
      </div>

      {/* SUMMARY */}
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
            <p className="text-sm font-medium">Số nhân viên</p>
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
            <div className="text-2xl font-bold">
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
                placeholder="Tìm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
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
                {filteredSalaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium">
                      {salary.employee.user.profile.fullName}
                    </TableCell>

                    <TableCell className="text-right">
                      {formatCurrency(salary.employee.baseSalary)}
                    </TableCell>

                    <TableCell className="text-right text-green-600">
                      +{formatCurrency(salary.bonus)}
                    </TableCell>

                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(salary.deduction)}
                    </TableCell>

                    <TableCell className="text-right font-semibold">
                      {formatCurrency(salary.amount)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          salary.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {salary.status === "PAID"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>

                        {salary.status === "PENDING" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsPaid(salary.id)}
                            className="text-green-600"
                          >
                            Thanh toán
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryManagement;