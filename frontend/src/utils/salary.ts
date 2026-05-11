export const SALARY_STATUS_BADGE = {
  PENDING: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Đã duyệt", color: "bg-blue-100 text-blue-700" },
  PAID: { label: "Đã thanh toán", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
} as const;

export const DETAIL_TYPE_BADGE = {
  BONUS: {
    label: "Thưởng",
    color: "bg-green-100 text-green-700",
    isPositive: true,
  },
  OT: {
    label: "Tăng ca",
    color: "bg-green-100 text-green-700",
    isPositive: true,
  },
  ALLOWANCE: {
    label: "Phụ cấp",
    color: "bg-green-100 text-green-700",
    isPositive: true,
  },
  DEDUCTION: {
    label: "Khấu trừ",
    color: "bg-red-100 text-red-700",
    isPositive: false,
  },
  INSURANCE: {
    label: "Bảo hiểm",
    color: "bg-red-100 text-red-700",
    isPositive: false,
  },
  TAX: { label: "Thuế", color: "bg-red-100 text-red-700", isPositive: false },
} as const;
