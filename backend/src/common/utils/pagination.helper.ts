/**
 * Calculate pagination skip value
 * @param page Current page (1-based)
 * @param limit Items per page
 * @returns Skip value for database query
 */
export function calculatePaginationSkip(
  page: number | string,
  limit: number | string,
): number {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  return (pageNum - 1) * limitNum;
}

/**
 * Build pagination metadata response
 * @param total Total count of items
 * @param page Current page (1-based)
 * @param limit Items per page
 * @returns Pagination metadata
 */
export function buildPaginationMeta(
  total: number,
  page: number | string,
  limit: number | string,
) {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
}

/**
 * Generic paginated response builder
 * @param data Result data array
 * @param total Total count of items
 * @param page Current page (1-based)
 * @param limit Items per page
 * @returns Paginated response object
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number | string,
  limit: number | string,
) {
  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
  };
}
