import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import type { PaginatedResponse, PaginationMeta } from "@/types/common.types";

interface UseServerPaginationOptions<TFilters extends Record<string, unknown>> {
  /**
   * Hàm gọi API. Nhận page, limit và filters, trả về PaginatedResponse.
   */
  fetchFn: (
    page: number,
    limit: number,
    filters: TFilters,
  ) => Promise<PaginatedResponse<unknown>>;
  /** Số bản ghi mỗi trang mặc định */
  defaultLimit?: number;
  /** Bộ lọc ban đầu (không bao gồm page/limit – hook tự quản lý) */
  defaultFilters?: TFilters;
  /**
   * Nếu true, page và limit sẽ được đồng bộ vào URL query params.
   * Khi F5 hay truy cập link, hệ thống sẽ đọc từ URL để gọi đúng trang.
   */
  syncUrl?: boolean;
}

interface UseServerPaginationReturn<T, TFilters> {
  data: T[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  /** Trang hiện tại (1-based) */
  currentPage: number;
  /** Số bản ghi mỗi trang */
  limit: number;
  /** Bộ lọc hiện tại */
  filters: TFilters;
  /** Chuyển trang. Nếu page ngoài range sẽ bị ignore. */
  goToPage: (page: number) => void;
  /**
   * Cập nhật bộ lọc và **tự động reset page về 1**.
   * Dùng cho: search, filter theo status, filter theo category, v.v.
   */
  setFilters: (patch: Partial<TFilters>) => void;
  /**
   * Thay đổi limit và **tự động reset page về 1**.
   */
  setLimit: (newLimit: number) => void;
  /** Tải lại trang hiện tại */
  refresh: () => void;
}

/**
 * Hook phân trang phía Server (Offset-based) chuẩn chỉnh.
 *
 * ## Luồng xử lý:
 * 1. Đọc `page` và `limit` từ URL (nếu syncUrl=true).
 * 2. Bất cứ khi nào page/limit/filters thay đổi → gọi fetchFn.
 * 3. Khi filter/limit thay đổi → reset page về 1 trước khi fetch.
 * 4. Ghi page/limit ngược lại vào URL sau mỗi lần thay đổi.
 *
 * ## Ví dụ dùng:
 * ```tsx
 * const { data, meta, isLoading, goToPage, setFilters } = useServerPagination({
 *   fetchFn: (page, limit, filters) => orderApi.getOrders({ page, limit, ...filters }),
 *   syncUrl: true,
 * });
 * ```
 */
export function useServerPagination<T, TFilters extends Record<string, unknown>>(
  options: UseServerPaginationOptions<TFilters>,
): UseServerPaginationReturn<T, TFilters> {
  const {
    fetchFn,
    defaultLimit = 10,
    defaultFilters = {} as TFilters,
    syncUrl = false,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  // ──────────────────────────────────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────────────────────────────────
  const initialPage = syncUrl ? Number(searchParams.get("page") || 1) : 1;
  const initialLimit = syncUrl
    ? Number(searchParams.get("limit") || defaultLimit)
    : defaultLimit;

  const [currentPage, setCurrentPage] = useState<number>(
    Math.max(1, initialPage),
  );
  const [limit, setLimitState] = useState<number>(Math.max(1, initialLimit));
  const [filters, setFiltersState] = useState<TFilters>(defaultFilters);
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dùng ref để tránh stale closure trong fetchData
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  // ──────────────────────────────────────────────────────────────────────────
  // Core fetch
  // ──────────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (page: number, lim: number, fil: TFilters) => {
      setIsLoading(true);
      try {
        const response = await fetchRef.current(page, lim, fil);
        setData(response.data as T[]);
        setMeta(response.meta);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Sync URL khi page/limit thay đổi
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!syncUrl) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(currentPage));
        next.set("limit", String(limit));
        return next;
      },
      { replace: true }, // Không tạo history entry mới khi chỉ thay page
    );
  }, [currentPage, limit, syncUrl, setSearchParams]);

  // ──────────────────────────────────────────────────────────────────────────
  // Tự động fetch khi page/limit/filters thay đổi
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    void fetchData(currentPage, limit, filters);
  }, [currentPage, limit, filters, fetchData]);

  // ──────────────────────────────────────────────────────────────────────────
  // Public actions
  // ──────────────────────────────────────────────────────────────────────────

  /** Chuyển đến trang cụ thể. Nút Prev/Next disable sẽ chặn các giá trị ngoài range. */
  const goToPage = useCallback(
    (page: number) => {
      const totalPages = meta?.totalPages ?? 1;
      if (page < 1 || page > totalPages || isLoading) return;
      setCurrentPage(page);
    },
    [meta?.totalPages, isLoading],
  );

  /**
   * Cập nhật filter và reset page về 1.
   * Đây là quy tắc UX quan trọng: khi filter thay đổi, người dùng
   * cần bắt đầu từ trang 1 để không bị confused.
   */
  const setFilters = useCallback((patch: Partial<TFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
    setCurrentPage(1); // ← BẮT BUỘC reset page về 1
  }, []);

  /**
   * Thay đổi limit và reset page về 1.
   * Tổng số trang sẽ thay đổi → phải về trang 1 để tránh trang hiện tại
   * vượt quá totalPages mới.
   */
  const setLimit = useCallback((newLimit: number) => {
    setLimitState(Math.max(1, newLimit));
    setCurrentPage(1); // ← BẮT BUỘC reset page về 1
  }, []);

  const refresh = useCallback(() => {
    void fetchData(currentPage, limit, filters);
  }, [currentPage, limit, filters, fetchData]);

  return {
    data,
    meta,
    isLoading,
    currentPage,
    limit,
    filters,
    goToPage,
    setFilters,
    setLimit,
    refresh,
  };
}
