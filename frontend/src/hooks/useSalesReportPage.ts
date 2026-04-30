import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSalesStore } from "@/stores/sales.store";
import { orderService } from "@/services/sales.service";
import { reportService } from "@/services/report.service";
import { getErrorMessage } from "@/stores/store.helpers";
import { getCurrentYear, getRecentYears, MONTH_OPTIONS } from "@/utils/date";
import { formatCurrencyVnd } from "@/utils/format";
import type { RoleReportResponse } from "@/types/report.types";

export type ReportPeriodType = "month" | "quarter" | "year";

const currentYear = getCurrentYear();

export const useSalesReportPage = () => {
  const { stats, isLoadingStats, setStats, setLoadingStats } = useSalesStore();
  const [reportData, setReportData] = useState<RoleReportResponse | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const [periodType, setPeriodType] = useState<ReportPeriodType>("month");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [quarter, setQuarter] = useState("1");
  const [year, setYear] = useState(String(currentYear));

  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const data =
          periodType === "month"
            ? await orderService.getSalesStats({
                month: Number(month),
                year: Number(year),
              })
            : await orderService.getSalesStatsByPeriod({
                year: Number(year),
                quarter: periodType === "quarter" ? Number(quarter) : undefined,
              });
        setStats(data);
      } catch (error: unknown) {
        const msg = getErrorMessage(error, "Không thể tải thống kê");
        toast.error(msg);
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    void loadStats();
  }, [month, periodType, quarter, setLoadingStats, setStats, year]);

  useEffect(() => {
    const loadReport = async () => {
      setIsLoadingReport(true);
      try {
        const data = await reportService.getSalesReport({
          year: Number(year),
          month: periodType === "month" ? Number(month) : undefined,
          quarter: periodType === "quarter" ? Number(quarter) : undefined,
          period: periodType,
        });
        setReportData(data);
      } catch {
        setReportData(null);
      } finally {
        setIsLoadingReport(false);
      }
    };

    void loadReport();
  }, [periodType, month, quarter, year]);

  const years = useMemo(() => getRecentYears(3, currentYear), []);
  const months = useMemo(() => MONTH_OPTIONS, []);

  const statCards = useMemo(
    () => [
      {
        label: "Tổng đơn hàng",
        value: stats?.totalOrders ?? 0,
        icon: "orders" as const,
      },
      {
        label: "Sản phẩm xuất",
        value: stats?.totalItemsSold ?? 0,
        icon: "items" as const,
      },
      {
        label: "Doanh thu",
        value: formatCurrencyVnd(stats?.totalRevenue ?? 0),
        icon: "revenue" as const,
      },
      {
        label: "Lợi nhuận",
        value: formatCurrencyVnd(stats?.totalProfit ?? 0),
        icon: "profit" as const,
      },
    ],
    [stats],
  );

  const handlePrint = () => window.print();

  return {
    stats,
    isLoadingStats,
    periodType,
    month,
    quarter,
    year,
    years,
    months,
    statCards,
    reportData,
    isLoadingReport,
    setPeriodType,
    setMonth,
    setQuarter,
    setYear,
    handlePrint,
  };
};
