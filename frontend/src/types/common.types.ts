export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOrder = "asc" | "desc";

/**
 * Metadata phân trang chuẩn – khớp với backend buildPaginationMeta()
 * Dùng thống nhất ở tất cả các store và component.
 */
export interface PaginationMeta {
  totalItems: number;   // Tổng số bản ghi trong DB
  itemCount: number;    // Số bản ghi trang hiện tại
  itemsPerPage: number; // Số bản ghi mỗi trang (limit)
  totalPages: number;   // Tổng số trang
  currentPage: number;  // Trang hiện tại
}

/**
 * Alias ngắn dùng được ở store cũ (backward compat).
 * Dần thay thế bằng PaginationMeta.
 */
export type Pagination = PaginationMeta;

export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: PaginationMeta | null;
  message?: string | string[];
  timestamp?: string;
}

export interface ApiErrorResponse {
  success?: false;
  statusCode: number;
  error?: string;
  message?: string | string[] | Record<string, string | string[]>;
  path?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
