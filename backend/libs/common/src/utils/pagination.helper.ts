export function normalizePagination(
  page: number | string | undefined,
  limit: number | string | undefined,
  defaultLimit = 10,
  maxLimit = 100,
): { page: number; limit: number } {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(maxLimit, Math.max(1, Number(limit) || defaultLimit));
  return { page: p, limit: l };
}

export function calculatePaginationSkip(
  page: number | string,
  limit: number | string,
): number {
  const { page: p, limit: l } = normalizePagination(page, limit);
  return (p - 1) * l;
}

export function buildPaginationMeta(
  totalItems: number,
  page: number | string,
  limit: number | string,
) {
  const { page: currentPage, limit: itemsPerPage } = normalizePagination(
    page,
    limit,
  );
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const itemCount = Math.min(
    itemsPerPage,
    Math.max(0, totalItems - (currentPage - 1) * itemsPerPage),
  );

  return {
    totalItems,
    itemCount,
    itemsPerPage,
    totalPages,
    currentPage,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  page: number | string,
  limit: number | string,
) {
  return {
    data,
    meta: buildPaginationMeta(totalItems, page, limit),
  };
}
