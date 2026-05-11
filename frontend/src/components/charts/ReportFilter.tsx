import { useEffect } from "react";
import { Calendar } from "lucide-react";
import type { ReportQuery, ReportType } from "@/types/report.type";

interface ReportFilterProps {
  filters: ReportQuery;
  onChange: (patch: Partial<ReportQuery>) => void;
  onApply?: () => void;
  loading?: boolean;
  typeOptions?: ReportType[];
}

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "month", label: "Theo tháng" },
  { value: "quarter", label: "Theo quý" },
  { value: "year", label: "Theo năm" },
];

const YEARS = (() => {
  const cur = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => cur - i);
})();

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const QUARTERS = [1, 2, 3, 4];

const SELECT_CLASS =
  "h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50";

export const ReportFilter = ({
  filters,
  onChange,
  onApply,
  loading,
  typeOptions,
}: ReportFilterProps) => {
  const allowedTypes = typeOptions ?? ["month", "quarter", "year"];

  useEffect(() => {
    if (!allowedTypes.includes(filters.type)) {
      onChange({ type: allowedTypes[0] });
    }
  }, [allowedTypes, filters.type, onChange]);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 pr-2 text-gray-500">
        <Calendar size={16} />
        <span className="text-xs font-medium uppercase tracking-wide">
          Bộ lọc
        </span>
      </div>

      <select
        value={filters.type}
        onChange={(e) => onChange({ type: e.target.value as ReportType })}
        className={SELECT_CLASS}
        disabled={loading}
      >
        {REPORT_TYPES.filter((t) => allowedTypes.includes(t.value)).map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        value={filters.year}
        onChange={(e) => onChange({ year: Number(e.target.value) })}
        className={SELECT_CLASS}
        disabled={loading}
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            Năm {y}
          </option>
        ))}
      </select>

      {filters.type === "month" && (
        <select
          value={filters.month ?? 1}
          onChange={(e) => onChange({ month: Number(e.target.value) })}
          className={SELECT_CLASS}
          disabled={loading}
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              Tháng {m}
            </option>
          ))}
        </select>
      )}

      {filters.type === "quarter" && (
        <select
          value={filters.quarter ?? 1}
          onChange={(e) => onChange({ quarter: Number(e.target.value) })}
          className={SELECT_CLASS}
          disabled={loading}
        >
          {QUARTERS.map((q) => (
            <option key={q} value={q}>
              Quý {q}
            </option>
          ))}
        </select>
      )}

      {onApply && (
        <button
          onClick={onApply}
          disabled={loading}
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Đang tải..." : "Áp dụng"}
        </button>
      )}
    </div>
  );
};
