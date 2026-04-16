export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1)

export const getCurrentYear = (): number => new Date().getFullYear()

export const getRecentYears = (count = 3, startYear = getCurrentYear()): number[] =>
  Array.from({ length: count }, (_, index) => startYear - index)
