export const LEAVE_TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Nghỉ phép năm",
  SICK: "Nghỉ ốm",
  MATERNITY: "Thai sản",
  UNPAID: "Nghỉ không lương",
  RESIGNATION: "Xin nghỉ việc",
};

export const LEAVE_STATUS_CONFIG = {
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  REJECTED: { label: "Từ chối", className: "bg-rose-50 text-rose-700 border-rose-100" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-100" },
};
