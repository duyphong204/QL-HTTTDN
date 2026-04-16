import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useEmployeeStore } from "@/stores/employee.store"
import { salaryService } from "@/services/hr.service"
import { reportService } from "@/services/report.service"
import { getErrorMessage } from "@/stores/store.helpers"
import { getCurrentYear, getRecentYears, MONTH_OPTIONS } from "@/utils/date"
import { formatCurrencyVnd } from "@/utils/format"
import type { RoleReportResponse } from "@/types/report.types"

const currentYear = getCurrentYear()
const YEARS = getRecentYears(3, currentYear)
const MONTHS = MONTH_OPTIONS

export const useSalary = () => {
  const { mySalaries, isLoadingSalary, myProfile, setMySalaries, setLoadingSalary } = useEmployeeStore()
  const [filterYear, setFilterYear] = useState(String(currentYear))
  const [filterMonth, setFilterMonth] = useState("ALL")
  const [salaryReport, setSalaryReport] = useState<RoleReportResponse | null>(null)
  const [isLoadingSalaryReport, setIsLoadingSalaryReport] = useState(false)

  const fetchMySalaries = useCallback(
    async (params?: { month?: number; year?: number }) => {
      setLoadingSalary(true)
      try {
        const data = await salaryService.getMySalaries(params)
        setMySalaries(data)
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Không thể tải bảng lương!"))
      } finally {
        setLoadingSalary(false)
      }
    },
    [setLoadingSalary, setMySalaries],
  )

  useEffect(() => {
    const params: { year?: number; month?: number } = {
      year: Number(filterYear),
    }

    if (filterMonth !== "ALL") {
      params.month = Number(filterMonth)
    }

    void fetchMySalaries(params)
  }, [filterYear, filterMonth, fetchMySalaries])

  useEffect(() => {
    const loadSalaryReport = async () => {
      setIsLoadingSalaryReport(true)
      try {
        const data = await reportService.getEmployeeSalaryReport({
          year: Number(filterYear),
          month: filterMonth === "ALL" ? undefined : Number(filterMonth),
        })
        setSalaryReport(data)
      } catch {
        setSalaryReport(null)
      } finally {
        setIsLoadingSalaryReport(false)
      }
    }

    void loadSalaryReport()
  }, [filterYear, filterMonth])

  const monthlySalary = useMemo(() => {
    if (filterMonth === "ALL") return null
    const month = Number(filterMonth)
    return mySalaries.find((s) => s.month === month && s.year === Number(filterYear)) || null
  }, [mySalaries, filterMonth, filterYear])

  const yearlySummary = useMemo(() => {
    const rows = MONTHS.map((m) => {
      const salary = mySalaries.find((s) => s.month === m && s.year === Number(filterYear))
      return {
        month: m,
        baseSalary: salary?.employee?.baseSalary || 0,
        bonus: salary?.bonus || 0,
        deduction: salary?.deduction || 0,
        amount: salary?.amount || 0,
        status: salary?.status || "PENDING",
      }
    })

    const totalAmount = rows.reduce((sum, r) => sum + r.amount, 0)
    const totalBonus = rows.reduce((sum, r) => sum + r.bonus, 0)
    const totalDeduction = rows.reduce((sum, r) => sum + r.deduction, 0)

    return {
      rows,
      totalAmount,
      totalBonus,
      totalDeduction,
    }
  }, [mySalaries, filterYear])

  const printMonthly = () => {
    if (filterMonth === "ALL") return
    document.body.classList.add("print-monthly")
    window.print()
    document.body.classList.remove("print-monthly")
  }

  const printYearly = () => {
    document.body.classList.add("print-yearly")
    window.print()
    document.body.classList.remove("print-yearly")
  }

  return {
    // Data
    mySalaries,
    myProfile,
    isLoadingSalary,
    monthlySalary,
    yearlySummary,
    salaryReport,
    isLoadingSalaryReport,

    // Filters
    filterYear,
    setFilterYear,
    filterMonth,
    setFilterMonth,

    // Handlers
    printMonthly,
    printYearly,

    // Constants
    YEARS,
    MONTHS,
    formatCurrency: formatCurrencyVnd,
  }
}