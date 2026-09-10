import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { endOfMonth, endOfYear, startOfMonth, startOfYear } from 'date-fns';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { ReportQueryDto, ReportType } from '../dto/report.dto';
import {
  ReportBucket,
  getSeriesDates,
  getSeriesKey,
  getSeriesTime,
} from './report-utils.helper';

interface HrSummaryRow {
  totalSalary: number;
  totalBonus: number;
  totalDeduction: number;
  activeEmployees: number;
  resignedEmployees: number;
}

interface HrBreakdownRow {
  bucketStart: Date;
  salary: number;
  bonus: number;
  deduction: number;
}

@Injectable()
export class HrReportService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveHrPeriod(query: ReportQueryDto) {
    const { type, year, month } = query;

    if (type === ReportType.MONTH) {
      if (!month) throw new BadRequestException('Month is required');
      if (month < 1 || month > 12) {
        throw new BadRequestException('Month must be between 1 and 12');
      }

      const start = startOfMonth(new Date(year, month - 1, 1));
      const end = endOfMonth(start);

      return { start, end, bucket: 'day' as const };
    }

    if (type === ReportType.YEAR) {
      const start = startOfYear(new Date(year, 0, 1));
      const end = endOfYear(new Date(year, 0, 1));

      return { start, end, bucket: 'month' as const };
    }

    throw new BadRequestException('HR report supports month or year only');
  }

  private fillHrBreakdown(
    rows: HrBreakdownRow[],
    start: Date,
    end: Date,
    bucket: ReportBucket,
  ) {
    const rowMap = new Map(
      rows.map((row) => [getSeriesKey(row.bucketStart, bucket), row]),
    );

    return getSeriesDates(start, end, bucket).map((date) => {
      const row = rowMap.get(getSeriesKey(date, bucket));
      return {
        time: getSeriesTime(date, bucket),
        salary: Number(row?.salary ?? 0),
        bonus: Number(row?.bonus ?? 0),
        deduction: Number(row?.deduction ?? 0),
      };
    });
  }

  async getHrReport(query: ReportQueryDto) {
    const { start, end, bucket } = this.resolveHrPeriod(query);
    const bucketUnit = bucket === 'day' ? 'day' : 'month';
    const bucketInterval = bucket === 'day' ? '1 day' : '1 month';

    const [summaryRows, breakdownRows] = await Promise.all([
      this.prisma.$queryRaw<HrSummaryRow[]>(Prisma.sql`
        WITH filtered_salary AS (
          SELECT "netSalary", "totalBonus", "totalDeduction"
          FROM "Salary"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
        )
        SELECT
          COALESCE((SELECT SUM("netSalary") FROM filtered_salary), 0)::double precision AS "totalSalary",
          COALESCE((SELECT SUM("totalBonus") FROM filtered_salary), 0)::double precision AS "totalBonus",
          COALESCE((SELECT SUM("totalDeduction") FROM filtered_salary), 0)::double precision AS "totalDeduction",
          (SELECT COUNT(*) FROM "Employee" WHERE "resignDate" IS NULL)::int AS "activeEmployees",
          (SELECT COUNT(*) FROM "Employee" WHERE "resignDate" IS NOT NULL)::int AS "resignedEmployees"
      `),
      this.prisma.$queryRaw<HrBreakdownRow[]>(Prisma.sql`
        WITH filtered_salary AS (
          SELECT "netSalary", "totalBonus", "totalDeduction", "createdAt"
          FROM "Salary"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
        ),
        salary_breakdown AS (
          SELECT
            date_trunc(${bucketUnit}, fs."createdAt") AS bucket_start,
            SUM(fs."netSalary")::double precision AS salary,
            SUM(fs."totalBonus")::double precision AS bonus,
            SUM(fs."totalDeduction")::double precision AS deduction
          FROM filtered_salary fs
          GROUP BY 1
        ),
        series AS (
          SELECT generate_series(
            ${start}::timestamp,
            ${end}::timestamp,
            ${bucketInterval}::interval
          ) AS bucket_start
        )
        SELECT
          series.bucket_start AS "bucketStart",
          COALESCE(salary_breakdown.salary, 0)::double precision AS salary,
          COALESCE(salary_breakdown.bonus, 0)::double precision AS bonus,
          COALESCE(salary_breakdown.deduction, 0)::double precision AS deduction
        FROM series
        LEFT JOIN salary_breakdown USING (bucket_start)
        ORDER BY series.bucket_start
      `),
    ]);

    const summary = summaryRows[0] ?? {
      totalSalary: 0,
      totalBonus: 0,
      totalDeduction: 0,
      activeEmployees: 0,
      resignedEmployees: 0,
    };

    return {
      summary: {
        totalSalary: Number(summary.totalSalary),
        totalBonus: Number(summary.totalBonus),
        totalDeduction: Number(summary.totalDeduction),
        activeEmployees: Number(summary.activeEmployees),
        resignedEmployees: Number(summary.resignedEmployees),
      },
      breakdown: this.fillHrBreakdown(breakdownRows, start, end, bucket),
    };
  }
}

