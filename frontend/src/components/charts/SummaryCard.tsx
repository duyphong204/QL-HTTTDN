import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type SummaryCardTone =
  | "blue"
  | "emerald"
  | "rose"
  | "amber"
  | "violet"
  | "slate";

const TONE_MAP: Record<SummaryCardTone, { wrap: string; icon: string }> = {
  blue: { wrap: "bg-blue-50 text-blue-600", icon: "bg-blue-500/10 text-blue-600" },
  emerald: {
    wrap: "bg-emerald-50 text-emerald-600",
    icon: "bg-emerald-500/10 text-emerald-600",
  },
  rose: { wrap: "bg-rose-50 text-rose-600", icon: "bg-rose-500/10 text-rose-600" },
  amber: {
    wrap: "bg-amber-50 text-amber-600",
    icon: "bg-amber-500/10 text-amber-600",
  },
  violet: {
    wrap: "bg-violet-50 text-violet-600",
    icon: "bg-violet-500/10 text-violet-600",
  },
  slate: { wrap: "bg-slate-50 text-slate-600", icon: "bg-slate-500/10 text-slate-600" },
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: SummaryCardTone;
  loading?: boolean;
  className?: string;
}

export const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "blue",
  loading,
  className,
}: SummaryCardProps) => {
  const t = TONE_MAP[tone];

  return (
    <Card
      className={cn(
        "py-4 border-gray-100 shadow-sm hover:shadow-md transition-shadow",
        className,
      )}
    >
      <CardContent className="flex items-center justify-between gap-4 px-5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-32" />
          ) : (
            <h3 className="mt-1 text-2xl font-bold text-gray-900 truncate">
              {value}
            </h3>
          )}
          {subtitle && !loading && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              t.icon,
            )}
          >
            <Icon size={20} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
