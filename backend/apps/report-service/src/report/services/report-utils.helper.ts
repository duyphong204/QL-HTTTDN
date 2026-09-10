import { eachDayOfInterval, eachMonthOfInterval, format } from 'date-fns';

export type ReportBucket = 'day' | 'month';

export const getSeriesDates = (
  start: Date,
  end: Date,
  bucket: ReportBucket,
) => {
  return bucket === 'day'
    ? eachDayOfInterval({ start, end })
    : eachMonthOfInterval({ start, end });
};

export const getSeriesKey = (date: Date, bucket: ReportBucket) => {
  return format(date, bucket === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM');
};

export const getSeriesTime = (date: Date, bucket: ReportBucket) => {
  return format(date, bucket === 'day' ? 'dd' : 'MM');
};
