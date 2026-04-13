import { useEffect, useMemo, useState } from "react"
import { useEmployeeStore } from "@/stores/employee.store"

const currentYear = new Date().getFullYear()
const YEARS = [currentYear, currentYear - 1, currentYear - 2]
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n || 0)

export const useSalary = () => {
  const { mySalaries, isLoadingSalary, fetchMySalaries, myProfile } = useEmployeeStore()
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
    formatCurrency,
  }
}