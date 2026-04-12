export const formatCurrency = (amount?: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0)

export const formatNumber = (num?: number): string =>
  (num ?? 0).toLocaleString('vi-VN')

export const formatDate = (date?: string | Date): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}
