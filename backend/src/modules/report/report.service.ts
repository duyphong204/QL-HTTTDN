import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportQueryDto, ReportType } from './dto/report.dto';

type ReportBucket = 'day' | 'month';

interface SalesSummaryRow {
  revenue: number;
  totalSell: number;
  totalCost: number;
  totalQuantity: number;
}

interface SalesBreakdownRow {
  bucketStart: Date;
  revenue: number;
  totalSell: number;
  totalCost: number;
  quantity: number;
}

interface WarehouseSummaryRow {
  totalImportAmount: number;
  totalImportQuantity: number;
  totalExportAmount: number;
  totalExportQuantity: number;
  totalInventory: number;
}

interface WarehouseBreakdownRow {
  bucketStart: Date;
  importAmount: number;
  exportAmount: number;
}

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
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveSalesPeriod(query: ReportQueryDto) {
    const { type, year, month, quarter } = query;

    if (type === ReportType.MONTH) {
      if (!month) throw new BadRequestException('Month is required');
      if (month < 1 || month > 12) {
        throw new BadRequestException('Month must be between 1 and 12');
      }

      const start = startOfMonth(new Date(year, month - 1, 1));
      const end = endOfMonth(start);

      return { start, end, bucket: 'day' as const };
    }

    if (type === ReportType.QUARTER) {
      if (!quarter) throw new BadRequestException('Quarter is required');
      if (quarter < 1 || quarter > 4) {
        throw new BadRequestException('Quarter must be between 1 and 4');
      }

      const startMonth = (quarter - 1) * 3;
      const start = startOfMonth(new Date(year, startMonth, 1));
      const end = endOfMonth(new Date(year, startMonth + 2, 1));

      return { start, end, bucket: 'month' as const };
    }

    if (type === ReportType.YEAR) {
      const start = startOfYear(new Date(year, 0, 1));
      const end = endOfYear(new Date(year, 0, 1));

      return { start, end, bucket: 'month' as const };
    }

    throw new BadRequestException('Invalid report type');
  }

  private resolveWarehousePeriod(query: ReportQueryDto) {
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

    throw new BadRequestException('Warehouse report supports month or year only');
  }

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

  private getSeriesDates(start: Date, end: Date, bucket: ReportBucket) {
    return bucket === 'day'
      ? eachDayOfInterval({ start, end })
      : eachMonthOfInterval({ start, end });
  }

  private getSeriesKey(date: Date, bucket: ReportBucket) {
    return format(date, bucket === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM');
  }

  private getSeriesTime(date: Date, bucket: ReportBucket) {
    return format(date, bucket === 'day' ? 'dd' : 'MM');
  }

  private fillSalesBreakdown(
    rows: SalesBreakdownRow[],
    start: Date,
    end: Date,
    bucket: ReportBucket,
  ) {
    const rowMap = new Map(
      rows.map((row) => [this.getSeriesKey(row.bucketStart, bucket), row]),
    );

    return this.getSeriesDates(start, end, bucket).map((date) => {
      const row = rowMap.get(this.getSeriesKey(date, bucket));
      return {
        time: this.getSeriesTime(date, bucket),
        revenue: Number(row?.revenue ?? 0),
        profit: Number(row?.totalSell ?? 0) - Number(row?.totalCost ?? 0),
        quantity: Number(row?.quantity ?? 0),
      };
    });
  }

  private fillWarehouseBreakdown(
    rows: WarehouseBreakdownRow[],
    start: Date,
    end: Date,
    bucket: ReportBucket,
  ) {
    const rowMap = new Map(
      rows.map((row) => [this.getSeriesKey(row.bucketStart, bucket), row]),
    );

    return this.getSeriesDates(start, end, bucket).map((date) => {
      const row = rowMap.get(this.getSeriesKey(date, bucket));
      return {
        time: this.getSeriesTime(date, bucket),
        import: Number(row?.importAmount ?? 0),
        export: Number(row?.exportAmount ?? 0),
      };
    });
  }

  private fillHrBreakdown(
    rows: HrBreakdownRow[],
    start: Date,
    end: Date,
    bucket: ReportBucket,
  ) {
    const rowMap = new Map(
      rows.map((row) => [this.getSeriesKey(row.bucketStart, bucket), row]),
    );

    return this.getSeriesDates(start, end, bucket).map((date) => {
      const row = rowMap.get(this.getSeriesKey(date, bucket));
      return {
        time: this.getSeriesTime(date, bucket),
        salary: Number(row?.salary ?? 0),
        bonus: Number(row?.bonus ?? 0),
        deduction: Number(row?.deduction ?? 0),
      };
    });
  }

  async getSalesReport(query: ReportQueryDto) {
    const { start, end, bucket } = this.resolveSalesPeriod(query);
    const bucketUnit = bucket === 'day' ? 'day' : 'month';
    const bucketInterval = bucket === 'day' ? '1 day' : '1 month';

    const [summaryRows, breakdownRows] = await Promise.all([
      this.prisma.$queryRaw<SalesSummaryRow[]>(Prisma.sql`
        WITH filtered_orders AS (
          SELECT id, "totalAmount"
          FROM "Order"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
            AND status <> 'PENDING'
        ),
        filtered_details AS (
          SELECT od.price, od.quantity, od."costPrice"
          FROM "OrderDetail" od
          INNER JOIN filtered_orders fo ON fo.id = od."orderId"
        )
        SELECT
          COALESCE((SELECT SUM("totalAmount") FROM filtered_orders), 0)::double precision AS revenue,
          COALESCE((SELECT SUM(price * quantity) FROM filtered_details), 0)::double precision AS "totalSell",
          COALESCE((SELECT SUM("costPrice" * quantity) FROM filtered_details), 0)::double precision AS "totalCost",
          COALESCE((SELECT SUM(quantity) FROM filtered_details), 0)::double precision AS "totalQuantity"
      `),
      this.prisma.$queryRaw<SalesBreakdownRow[]>(Prisma.sql`
        WITH filtered_orders AS (
          SELECT id, "totalAmount", "createdAt"
          FROM "Order"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
            AND status <> 'PENDING'
        ),
        order_breakdown AS (
          SELECT
            date_trunc(${bucketUnit}, fo."createdAt") AS bucket_start,
            SUM(fo."totalAmount")::double precision AS revenue
          FROM filtered_orders fo
          GROUP BY 1
        ),
        detail_breakdown AS (
          SELECT
            date_trunc(${bucketUnit}, fo."createdAt") AS bucket_start,
            SUM(od.price * od.quantity)::double precision AS "totalSell",
            SUM(od."costPrice" * od.quantity)::double precision AS "totalCost",
            SUM(od.quantity)::double precision AS quantity
          FROM filtered_orders fo
          INNER JOIN "OrderDetail" od ON od."orderId" = fo.id
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
          COALESCE(order_breakdown.revenue, 0)::double precision AS revenue,
          COALESCE(detail_breakdown."totalSell", 0)::double precision AS "totalSell",
          COALESCE(detail_breakdown."totalCost", 0)::double precision AS "totalCost",
          COALESCE(detail_breakdown.quantity, 0)::double precision AS quantity
        FROM series
        LEFT JOIN order_breakdown USING (bucket_start)
        LEFT JOIN detail_breakdown USING (bucket_start)
        ORDER BY series.bucket_start
      `),
    ]);

    const summary = summaryRows[0] ?? {
      revenue: 0,
      totalSell: 0,
      totalCost: 0,
      totalQuantity: 0,
    };

    return {
      summary: {
        revenue: Number(summary.revenue),
        profit: Number(summary.totalSell) - Number(summary.totalCost),
        totalSoldQuantity: Number(summary.totalQuantity),
      },
      breakdown: this.fillSalesBreakdown(breakdownRows, start, end, bucket),
    };
  }

  async getWarehouseReport(query: ReportQueryDto) {
    const { start, end, bucket } = this.resolveWarehousePeriod(query);
    const bucketUnit = bucket === 'day' ? 'day' : 'month';
    const bucketInterval = bucket === 'day' ? '1 day' : '1 month';

    const [summaryRows, breakdownRows] = await Promise.all([
      this.prisma.$queryRaw<WarehouseSummaryRow[]>(Prisma.sql`
        WITH filtered_stock_in AS (
          SELECT id, "totalAmount", date
          FROM "StockIn"
          WHERE date BETWEEN ${start} AND ${end}
            AND status = 'COMPLETED'
        ),
        filtered_stock_out AS (
          SELECT id, "totalAmount", "createdAt"
          FROM "StockOut"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
            AND status = 'COMPLETED'
        )
        SELECT
          COALESCE((SELECT SUM("totalAmount") FROM filtered_stock_in), 0)::double precision AS "totalImportAmount",
          COALESCE((SELECT SUM(sid.quantity)
            FROM filtered_stock_in si
            INNER JOIN "StockInDetail" sid ON sid."stockInId" = si.id
          ), 0)::double precision AS "totalImportQuantity",
          COALESCE((SELECT SUM("totalAmount") FROM filtered_stock_out), 0)::double precision AS "totalExportAmount",
          COALESCE((SELECT SUM(sod.quantity)
            FROM filtered_stock_out so
            INNER JOIN "StockOutDetail" sod ON sod."stockOutId" = so.id
          ), 0)::double precision AS "totalExportQuantity",
          COALESCE((SELECT SUM("stockQuantity") FROM "Product"), 0)::double precision AS "totalInventory"
      `),
      this.prisma.$queryRaw<WarehouseBreakdownRow[]>(Prisma.sql`
        WITH filtered_stock_in AS (
          SELECT id, "totalAmount", date
          FROM "StockIn"
          WHERE date BETWEEN ${start} AND ${end}
            AND status = 'COMPLETED'
        ),
        filtered_stock_out AS (
          SELECT id, "totalAmount", "createdAt"
          FROM "StockOut"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
            AND status = 'COMPLETED'
        ),
        import_breakdown AS (
          SELECT
            date_trunc(${bucketUnit}, si.date) AS bucket_start,
            SUM(si."totalAmount")::double precision AS "importAmount"
          FROM filtered_stock_in si
          GROUP BY 1
        ),
        export_breakdown AS (
          SELECT
            date_trunc(${bucketUnit}, so."createdAt") AS bucket_start,
            SUM(so."totalAmount")::double precision AS "exportAmount"
          FROM filtered_stock_out so
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
          COALESCE(import_breakdown."importAmount", 0)::double precision AS "importAmount",
          COALESCE(export_breakdown."exportAmount", 0)::double precision AS "exportAmount"
        FROM series
        LEFT JOIN import_breakdown USING (bucket_start)
        LEFT JOIN export_breakdown USING (bucket_start)
        ORDER BY series.bucket_start
      `),
    ]);

    const summary = summaryRows[0] ?? {
      totalImportAmount: 0,
      totalImportQuantity: 0,
      totalExportAmount: 0,
      totalExportQuantity: 0,
      totalInventory: 0,
    };

    return {
      summary: {
        totalImportAmount: Number(summary.totalImportAmount),
        totalExportAmount: Number(summary.totalExportAmount),
        totalInventory: Number(summary.totalInventory),
        totalImportQuantity: Number(summary.totalImportQuantity),
        totalExportQuantity: Number(summary.totalExportQuantity),
      },
      breakdown: this.fillWarehouseBreakdown(breakdownRows, start, end, bucket),
    };
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
