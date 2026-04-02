export const getErrorMessage = (error: unknown, fallback = 'Loi khong xac dinh'): string =>
  error instanceof Error ? error.message : fallback

export const mergeFiltersWithPageReset = <T extends { page?: number }>(
  current: T,
  incoming: Partial<T>,
): T => {
  const isPageChange = Object.prototype.hasOwnProperty.call(incoming, 'page')

  return {
    ...current,
    ...incoming,
    page: isPageChange ? (incoming.page ?? 1) : 1,
  }
}

export const loadingState = <K extends string>(key: K, value: boolean): Record<K, boolean> =>
  ({ [key]: value } as Record<K, boolean>)
