export const getErrorMessage = (error: unknown, fallback = 'Lỗi không xác định'): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const response = error as {
      response?: {
        data?: {
          message?: string | string[] | Record<string, string | string[]>
          error?: string
        }
        status?: number
      }
      message?: string
    }

    const apiMessage = response.response?.data?.message
    if (Array.isArray(apiMessage)) {
      return apiMessage.join(', ')
    }

    if (typeof apiMessage === 'string') {
      return apiMessage
    }

    if (response.response?.data?.error) {
      return response.response.data.error
    }

    if (response.response?.status === 401) {
      return 'Phiên đăng nhập đã hết hạn'
    }

    if (response.response?.status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này'
    }

    if (response.response?.status === 404) {
      return 'Không tìm thấy dữ liệu'
    }

    if (typeof response.message === 'string') {
      return response.message
    }
  }

  return fallback
}

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
