import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const Loading = ({ className, size = "md", text }: LoadingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

interface PageLoadingProps {
  text?: string;
  className?: string;
}

export const PageLoading = ({
  text = "Đang tải dữ liệu...",
  className,
}: PageLoadingProps) => {
  return (
    <div
      className={cn(
        "flex min-h-80 items-center justify-center rounded-2xl border border-slate-100 bg-white",
        className,
      )}
    >
      <Loading size="lg" text={text} className="text-slate-500" />
    </div>
  );
};

interface OverlayLoadingProps {
  text?: string;
  className?: string;
}

export const OverlayLoading = ({
  text = "Đang tải dữ liệu...",
  className,
}: OverlayLoadingProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center bg-white/65 backdrop-blur-[1px]",
        className,
      )}
    >
      <Loading size="lg" text={text} className="text-slate-500" />
    </div>
  );
};

interface TableLoadingRowProps {
  colSpan: number;
  text?: string;
}

export const TableLoadingRow = ({
  colSpan,
  text = "Đang tải dữ liệu...",
}: TableLoadingRowProps) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center">
        <Loading text={text} className="text-slate-500" />
      </td>
    </tr>
  );
};

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export const InlineLoading = ({
  text = "Đang tải dữ liệu...",
  className,
}: InlineLoadingProps) => {
  return (
    <Loading
      text={text}
      className={cn("justify-center text-sm text-slate-400", className)}
    />
  );
};
