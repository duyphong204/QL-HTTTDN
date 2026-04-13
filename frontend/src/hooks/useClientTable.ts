import { useEffect, useMemo, useState } from "react";
import type { PaginationMeta } from "@/types/common.types";

interface UseClientTableOptions<T> {
  data: T[];
  pageSize?: number;
  searchFn: (item: T, keyword: string) => boolean;
}

export function useClientTable<T>({
  data,
  pageSize = 10,
  searchFn,
}: UseClientTableOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return data;
    }

    return data.filter((item) => searchFn(item, keyword));
  }, [data, searchFn, searchTerm]);

  const meta = useMemo<PaginationMeta>(() => {
    const total = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      page,
      limit: pageSize,
      total,
      totalPages,
    };
  }, [filteredData.length, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta.totalPages, page]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  return {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pagedData,
    meta,
  };
}
