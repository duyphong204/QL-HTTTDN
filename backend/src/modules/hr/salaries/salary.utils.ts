import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns';

export const calculateStandardWorkingDays = (
  month: number,
  year: number,
): number => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));

  const days = eachDayOfInterval({ start, end });

  const workingDays = days.filter((day) => {
    const dayOfWeek = getDay(day);
    return dayOfWeek >= 1 && dayOfWeek <= 5; // T2–T6 (Mon–Fri)
  });

  return workingDays.length;
};

export const calculateUnpaidLeaveDays = (
  leaveRequests: { startDate: Date; endDate: Date; type: string }[],
  month: number,
  year: number,
): number => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));

  let unpaidDays = 0;

  for (const leave of leaveRequests) {
    if (leave.type !== 'UNPAID') continue;

    const leaveStart =
      new Date(leave.startDate) > start ? new Date(leave.startDate) : start;
    const leaveEnd =
      new Date(leave.endDate) < end ? new Date(leave.endDate) : end;

    const days = eachDayOfInterval({ start: leaveStart, end: leaveEnd });

    for (const day of days) {
      const dow = getDay(day);
      if (dow >= 1 && dow <= 5) { // T2–T6 (Mon–Fri)
        unpaidDays++;
      }
    }
  }

  return unpaidDays;
};

export const calculateGrossSalary = (
  baseSalary: number,
  standardDays: number,
  unpaidDays: number,
): number => {
  if (standardDays <= 0) return 0;
  const effectiveDays = Math.max(0, standardDays - unpaidDays);
  return Math.round((baseSalary / standardDays) * effectiveDays);
};

/** Đếm số ngày làm việc T2–T6 trong khoảng [start, end] */
export const countWeekdays = (start: Date, end: Date): number => {
  if (end < start) return 0;
  return eachDayOfInterval({ start, end }).filter((d) => {
    const dow = getDay(d);
    return dow >= 1 && dow <= 5; // T2–T6 (Mon–Fri)
  }).length;
};

export const calculateInsurance = (grossSalary: number): number => {
  const RATE = 0.105;
  return Math.round(grossSalary * RATE);
};

const TAX_BRACKETS = [
  { limit: 5_000_000, rate: 0.05 },
  { limit: 10_000_000, rate: 0.1 },
  { limit: 18_000_000, rate: 0.15 },
  { limit: 32_000_000, rate: 0.2 },
  { limit: 52_000_000, rate: 0.25 },
  { limit: 80_000_000, rate: 0.3 },
  { limit: Infinity, rate: 0.35 },
];

export const calculateProgressiveTax = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const { limit, rate } of TAX_BRACKETS) {
    if (taxableIncome <= prev) break;
    tax += Math.min(taxableIncome - prev, limit - prev) * rate;
    prev = limit;
  }
  return Math.round(tax);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN');
};

export const getMonthDateRange = (month: number, year: number) => {
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};
