import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  children,
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn("p-4 border-b border-border bg-background", className)}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Ô Search - Hover màu xám nhạt trung tính */}
        <div className="relative max-w-md flex-1 group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-slate-500"
          />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "pl-10 h-10 border-input bg-background rounded-md transition-all",
              "focus-visible:ring-ring focus-visible:ring-offset-0",
              "hover:bg-slate-50/50 hover:border-slate-300 dark:hover:bg-slate-900/50 dark:hover:border-slate-700",
            )}
          />
        </div>

        {/* Khu vực chứa các nút chức năng (Filter, Add, v.v.) */}
        {children && (
          <div className="flex items-center gap-2 flex-wrap md:ml-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
