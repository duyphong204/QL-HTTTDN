import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationMeta } from '@/types/common.type';

interface PaginationControlsProps {
  meta?: PaginationMeta | null;
  currentPage?: number;
  isLoading?: boolean;
  totalLabel?: string;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  meta,
  currentPage,
  isLoading = false,
  totalLabel = 'Tổng',
  onPageChange,
}: PaginationControlsProps) {
  const page = meta?.page ?? currentPage ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;

  // Hàm hỗ trợ ngăn click khi đang load hoặc disable
  const handlePageChange = (targetPage: number) => {
    if (isLoading || targetPage < 1 || targetPage > totalPages) return;
    onPageChange(targetPage);
  };

  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-blue-50 bg-white/50 backdrop-blur-sm">
      {/* Thông tin tổng số bên trái */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        <p className="text-sm font-medium text-slate-500">
          {totalLabel}: <span className="text-blue-600 font-bold">{total.toLocaleString()}</span>
        </p>
      </div>

      {/* Điều hướng Shadcn bên phải */}
      <Pagination className="w-auto mx-0">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
              className={`hover:bg-blue-50 hover:text-blue-700 border-blue-100 ${page <= 1 || isLoading ? 'pointer-events-none opacity-40' : 'cursor-pointer'}`}
            />
          </PaginationItem>

          {/* Hiển thị trang hiện tại kiểu Badge */}
          <PaginationItem>
            <div className="px-3 py-1 text-sm font-semibold bg-blue-600 text-white rounded-md shadow-sm shadow-blue-200">
              {page} / {totalPages}
            </div>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
              className={`hover:bg-blue-50 hover:text-blue-700 border-blue-100 ${page >= totalPages || isLoading ? 'pointer-events-none opacity-40' : 'cursor-pointer'}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
