import { useEffect, useState } from "react"
import { useEmployeeStore } from "@/store/employee.store"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Printer } from "lucide-react"

const currentYear = new Date().getFullYear()

const YEARS = [currentYear, currentYear - 1, currentYear - 2]
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n || 0)

export default function MySalaryPage() {
  const { mySalaries, isLoadingSalary, fetchMySalaries } = useEmployeeStore()

  const [filterYear, setFilterYear] = useState(String(currentYear))
  const [filterMonth, setFilterMonth] = useState("ALL")

  useEffect(() => {
    const params: { year?: number; month?: number } = {
      year: Number(filterYear),
    }

    if (filterMonth !== "ALL") {
      params.month = Number(filterMonth)
    }

    fetchMySalaries(params)

  }, [filterYear, filterMonth, fetchMySalaries])

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Bảng lương của tôi
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Xem bảng lương theo tháng / năm
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
          >
            <Printer size={18} />
            In bảng lương
          </button>

        </div>

        {/* FILTER */}
        <div className="flex flex-col sm:flex-row gap-3">

          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>

            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  Năm {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="ALL">Cả năm</SelectItem>

              {MONTHS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  Tháng {m}
                </SelectItem>
              ))}

            </SelectContent>
          </Select>

        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm whitespace-nowrap">

              {/* HEADER */}
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">

                <tr>
                  <th className="px-6 py-4">Tên nhân viên</th>
                  <th className="px-6 py-4">Tháng</th>
                  <th className="px-6 py-4">Năm</th>
                  <th className="px-6 py-4">Lương cơ bản</th>
                  <th className="px-6 py-4">Thưởng</th>
                  <th className="px-6 py-4">Khấu trừ</th>
                  <th className="px-6 py-4">Thực lĩnh</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>

              </thead>

              {/* BODY */}
              <tbody className="divide-y divide-gray-50">

                {isLoadingSalary ? (

                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                      Đang tải bảng lương...
                    </td>
                  </tr>

                ) : mySalaries.length === 0 ? (

                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                      Không có dữ liệu bảng lương.
                    </td>
                  </tr>

                ) : (

                  mySalaries.map((salary) => (

                    <tr
                      key={salary.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {salary.employee?.user?.profile?.fullName || "N/A"}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {salary.month}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {salary.year}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatCurrency(salary.employee?.baseSalary || 0)}
                      </td>

                      <td className="px-6 py-4 text-green-600 font-medium">
                        + {formatCurrency(salary.bonus)}
                      </td>

                      <td className="px-6 py-4 text-red-600 font-medium">
                        - {formatCurrency(salary.deduction)}
                      </td>

                      <td className="px-6 py-4 font-bold text-blue-700">
                        {formatCurrency(salary.amount)}
                      </td>

                      <td className="px-6 py-4 text-center">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            salary.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {salary.status === "PAID"
                            ? "Đã nhận lương"
                            : "Chưa thanh toán"}
                        </span>

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
  )
}