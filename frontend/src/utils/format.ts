export const formatCurrencyVnd = (value: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

export const formatNumberVi = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(value || 0);

export const formatNumberWithDong = (value: number, spaced = false): string =>
  `${formatNumberVi(value)}${spaced ? " đ" : "đ"}`;

export const formatReportPeriod = (filters: {
  type: string;
  year: number;
  month?: number;
  quarter?: number;
}): string => {
  if (filters.type === "month") return `Tháng ${filters.month}/${filters.year}`;
  if (filters.type === "quarter") return `Quý ${filters.quarter}/${filters.year}`;
  return `Năm ${filters.year}`;
};
