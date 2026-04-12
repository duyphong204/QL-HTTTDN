import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage = ({ message, className }: ErrorMessageProps) => {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-red-600", className)}>
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
};
