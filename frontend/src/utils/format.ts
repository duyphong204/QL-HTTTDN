export const formatCurrencyVnd = (value: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

export const formatNumberVi = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(value || 0);

export const formatNumberWithDong = (value: number, spaced = false): string =>
  `${formatNumberVi(value)}${spaced ? " đ" : "đ"}`;
