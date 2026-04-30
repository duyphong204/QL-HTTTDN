import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useReportStore } from "@/stores/report.store";
import { reportService } from "@/services/report.service";
import { warehouseReportService } from "@/services/warehouse.service";
import { getErrorMessage } from "@/stores/store.helpers";
import { getCurrentYear, getRecentYears, MONTH_OPTIONS } from "@/utils/date";
import { formatCurrencyVnd } from "@/utils/format";
import type { RoleReportResponse } from "@/types/report.types";

const currentYear = getCurrentYear();

export const useWarehouseReportPage = () => {
  const report = useReportStore((state) => state.report);
  const isLoadingReport = useReportStore((state) => state.isLoading);
  const setLoadingReport = useReportStore((state) => state.setLoading);
  const setReport = useReportStore((state) => state.setReport);
  const [analyticsReport, setAnalyticsReport] =
    useState<RoleReportResponse | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState(String(currentYear));

  useEffect(() => {
    const loadWarehouseReport = async () => {
      setLoadingReport(true);
      try {
        const data = await warehouseReportService.getReport({
          month: month ? Number(month) : undefined,
          year: Number(year),
        });
        setReport(data);
      } catch (error: unknown) {
        const msg = getErrorMessage(error, "Không thể tải báo cáo kho");
        toast.error(msg);
        setReport(null);
      } finally {
        setLoadingReport(false);
      }
    };

    void loadWarehouseReport();
  }, [month, setLoadingReport, setReport, year]);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const data = await reportService.getWarehouseReport({
          month: month ? Number(month) : undefined,
          year: Number(year),
        });
        setAnalyticsReport(data);
      } catch {
        setAnalyticsReport(null);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    void loadAnalytics();
  }, [month, year]);

  const years = useMemo(() => getRecentYears(3, currentYear), []);
  const months = useMemo(() => MONTH_OPTIONS, []);

  const statCards = useMemo(
    () => [
      {
        label: "Số phiếu nhập",
        value: report?.totalStockIns ?? 0,
        icon: "stockIns" as const,
      },
      {
        label: "Giá trị nhập",
        value: formatCurrencyVnd(report?.totalImportValue ?? 0),
        icon: "importValue" as const,
      },
      {
        label: "Loại sản phẩm",
        value: report?.totalProductTypes ?? 0,
        icon: "types" as const,
      },
      {
        label: "Tổng tồn kho",
        value: report?.totalStockQuantity ?? 0,
        icon: "stockQty" as const,
      },
    ],
    [report],
  );

  const lowStockProducts = report?.lowStockProducts ?? [];

  const handlePrint = () => window.print();

  return {
    report,
    isLoadingReport,
    month,
    year,
    years,
    months,
    statCards,
    lowStockProducts,
    analyticsReport,
    isLoadingAnalytics,
    setMonth,
    setYear,
    handlePrint,
  };
};
