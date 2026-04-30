import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
} from 'date-fns';

export enum LeaveType {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PERSONAL = 'PERSONAL',
}

export const calculateStandardWorkingDays = (
  month: number,
  year: number,
): number => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));

  const days = eachDayOfInterval({ start, end });

  const workingDays = days.filter((day) => {
    const dayOfWeek = getDay(day);
    return dayOfWeek >= 1 && dayOfWeek <= 5;
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
    if (leave.type !== LeaveType.UNPAID) continue;

    const leaveStart =
      new Date(leave.startDate) > start ? new Date(leave.startDate) : start;
    const leaveEnd =
      new Date(leave.endDate) < end ? new Date(leave.endDate) : end;

    const days = eachDayOfInterval({ start: leaveStart, end: leaveEnd });

    for (const day of days) {
      const dayOfWeek = getDay(day);
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
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
  const dailyRate = baseSalary / standardDays;
  const effectiveDays = standardDays - unpaidDays;
  return Math.round(dailyRate * effectiveDays);
};

export const calculateInsurance = (grossSalary: number): number => {
  const RATE = 0.105;
  return Math.round(grossSalary * RATE);
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
