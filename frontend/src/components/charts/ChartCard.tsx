import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  height?: number;
  className?: string;
}

export const ChartCard = ({
  title,
  description,
  children,
  action,
  loading,
  empty,
  emptyText = "Chưa có dữ liệu",
  height = 280,
  className,
}: ChartCardProps) => {
  return (
    <Card className={cn("py-4 border-gray-100 shadow-sm", className)}>
      <CardHeader className="px-5 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-gray-900">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-0.5 text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div style={{ height }} className="w-full">
          {loading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : empty ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400 italic">
              {emptyText}
            </div>
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  );
};
