import { useMemo, useState } from "react";
import type { PaginationMeta } from "@/types/common.types";

interface UseClientTableOptions<T> {
  data: T[];
  pageSize?: number;
  searchFn: (item: T, keyword: string) => boolean;
}

/**
 * Hook phân trang phía client.
 * Dùng cho các trang có dữ liệu nhỏ (<500 bản ghi) không cần server pagination.
 * Với dữ liệu lớn hơn, hãy dùng useServerPagination.
 */
export function useClientTable<T>({
  data,
  pageSize = 10,
  searchFn,
}: UseClientTableOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return data;
    return data.filter((item) => searchFn(item, keyword));
  }, [data, searchFn, searchTerm]);

  // Build meta theo field names mới (khớp với PaginationMeta chuẩn)
  const meta = useMemo<PaginationMeta>(() => {
    const totalItems = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * pageSize;
    const itemCount = Math.min(pageSize, Math.max(0, totalItems - skip));

    return {
      totalItems,
      itemCount,
      itemsPerPage: pageSize,
      totalPages,
      currentPage,
    };
  }, [filteredData.length, page, pageSize]);

  // Reset về trang 1 khi search thay đổi hoặc trang hiện tại vượt quá totalPages
  const [prevSearchTerm, setPrevSearchTerm] = useState("");
  if (searchTerm !== prevSearchTerm) {
    setPrevSearchTerm(searchTerm);
    setPage(1);
  } else if (meta.totalPages > 0 && page > meta.totalPages) {
    setPage(meta.totalPages);
  }

  const pagedData = useMemo(() => {
    const start = (meta.currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, meta.currentPage, pageSize]);

  return {
    searchTerm,
    setSearchTerm,
    page: meta.currentPage,
    setPage,
    pagedData,
    meta,
  };
}
