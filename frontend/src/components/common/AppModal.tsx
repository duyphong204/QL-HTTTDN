import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidthClassName?: string;
  children: ReactNode;
};

export function AppModal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidthClassName = "sm:max-w-[525px]",
  children,
}: AppModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "p-0 gap-0 border-none outline-none sm:rounded-xl overflow-hidden shadow-2xl bg-background",
          maxWidthClassName
        )}
      >
        {(title || subtitle) && (
          <DialogHeader className="px-6 pt-6 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-foreground">
              {title}
            </DialogTitle>
            {subtitle && (
              <DialogDescription className="text-sm text-muted-foreground pt-2">
                {subtitle}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Nội dung bên trong: Tăng padding-top một chút để cân đối */}
        <div className="p-6 pt-4 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}