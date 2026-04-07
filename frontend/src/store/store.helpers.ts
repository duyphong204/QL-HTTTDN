export const getErrorMessage = (error: unknown, fallback = 'Lỗi không xác định'): string => {
  if (typeof error === 'object' && error !== null) {
    const response = error as {
      response?: {
        data?: {
          message?: unknown
        }
        status?: number
      }
    }

    const apiMessage = response.response?.data?.message
    if (apiMessage) {
      // Chỉ lấy và format message từ backend
      if (Array.isArray(apiMessage)) {
        const messages: string[] = []
        for (const item of apiMessage) {
          if (typeof item === 'string') {
            messages.push(item)
          } else if (typeof item === 'object' && item !== null) {
            Object.values(item).forEach(val => {
              if (typeof val === 'string') {
                messages.push(val)
              } else if (Array.isArray(val)) {
                messages.push(...val.filter(v => typeof v === 'string'))
              }
            })
          }
        }
        return messages.length > 0 ? messages.join(', ') : fallback
      }

      if (typeof apiMessage === 'string') {
        return apiMessage
      }
    }

    // Fallback cho status codes nếu không có message
    if (response.response?.status === 401) {
      return 'Phiên đăng nhập đã hết hạn'
    }

    if (response.response?.status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này'
    }

    if (response.response?.status === 404) {
      return 'Không tìm thấy dữ liệu'
    }
  }

  if (error instanceof Error) {
    return error.message
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
