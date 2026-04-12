import { FileX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon = <FileX className="h-12 w-12 text-muted-foreground" />,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {icon}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};
