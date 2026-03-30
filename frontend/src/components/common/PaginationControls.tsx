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

  return (
    <div className="p-4 flex items-center justify-between border-t border-gray-50">
      <span className="text-sm text-gray-500">{totalLabel}: {total}</span>

      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
        >
          Trước
        </button>

        <span className="text-sm text-gray-600">Trang {page}/{totalPages}</span>

        <button
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
        >
          Tiếp
        </button>
      </div>
    </div>
  );
}
