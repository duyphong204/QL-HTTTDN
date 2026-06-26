import { useEffect, useMemo } from "react";
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
  "h-10 min-w-[120px] px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer transition-all disabled:opacity-50";

export const ReportFilter = ({
  filters,
  onChange,
  onApply,
  loading,
  typeOptions,
}: ReportFilterProps) => {
  const allowedTypes = useMemo(() => typeOptions ?? ["month", "quarter", "year"], [typeOptions]);

  useEffect(() => {
    if (!allowedTypes.includes(filters.type)) {
      onChange({ type: allowedTypes[0] });
    }
  }, [allowedTypes, filters.type, onChange]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 pr-2 text-gray-500">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 shadow-inner">
          <Calendar size={16} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">
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
          className="ml-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60"
        >
          {loading ? "Đang tải..." : "Áp dụng"}
        </button>
      )}
    </div>
  );
};
