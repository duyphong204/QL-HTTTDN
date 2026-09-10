import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
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

@Injectable()
export class SalesReportService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

  private fillSalesBreakdown(
    rows: SalesBreakdownRow[],
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
        revenue: Number(row?.revenue ?? 0),
        profit: Number(row?.totalSell ?? 0) - Number(row?.totalCost ?? 0),
        quantity: Number(row?.quantity ?? 0),
      };
    });
  }

  async getSalesReport(query: ReportQueryDto) {
    const cacheKey = `sales_report_${JSON.stringify(query)}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { start, end, bucket } = this.resolveSalesPeriod(query);
    const bucketUnit = bucket === 'day' ? 'day' : 'month';
    const bucketInterval = bucket === 'day' ? '1 day' : '1 month';

    const [summaryRows, breakdownRows] = await Promise.all([
      this.prisma.$queryRaw<SalesSummaryRow[]>(Prisma.sql`
        WITH filtered_orders AS (
          SELECT id, "totalAmount"
          FROM "Order"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
            AND status NOT IN ('PENDING', 'CANCELLED')
        ),
        filtered_order_details AS (
          SELECT od.price, od.quantity, od."costPrice"
          FROM "OrderDetail" od
          INNER JOIN filtered_orders fo ON fo.id = od."orderId"
        ),
        manual_sales AS (
          SELECT id
          FROM "StockOut"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
            AND status = 'COMPLETED'
            AND type = 'SALE'
            AND "orderId" IS NULL
        ),
        manual_sales_details AS (
          SELECT sod.price, sod.quantity, sod."costPrice"
          FROM "StockOutDetail" sod
          INNER JOIN manual_sales ms ON ms.id = sod."stockOutId"
        )
        SELECT
          (COALESCE((SELECT SUM("totalAmount") FROM filtered_orders), 0) +
           COALESCE((SELECT SUM(price * quantity) FROM manual_sales_details), 0))::double precision AS revenue,
          (COALESCE((SELECT SUM(price * quantity) FROM filtered_order_details), 0) +
           COALESCE((SELECT SUM(price * quantity) FROM manual_sales_details), 0))::double precision AS "totalSell",
          (COALESCE((SELECT SUM("costPrice" * quantity) FROM filtered_order_details), 0) +
           COALESCE((SELECT SUM("costPrice" * quantity) FROM manual_sales_details), 0))::double precision AS "totalCost",
          (COALESCE((SELECT SUM(quantity) FROM filtered_order_details), 0) +
           COALESCE((SELECT SUM(quantity) FROM manual_sales_details), 0))::double precision AS "totalQuantity"
      `),
      this.prisma.$queryRaw<SalesBreakdownRow[]>(Prisma.sql`
        WITH filtered_orders AS (
          SELECT id, "totalAmount", "createdAt"
          FROM "Order"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
            AND status NOT IN ('PENDING', 'CANCELLED')
        ),
        manual_sales AS (
          SELECT id, "totalAmount", "createdAt"
          FROM "StockOut"
          WHERE "createdAt" BETWEEN ${start} AND ${end}
            AND status = 'COMPLETED'
            AND type = 'SALE'
            AND "orderId" IS NULL
        ),
        order_revenue AS (
          SELECT
            date_trunc(${bucketUnit}, fo."createdAt") AS bucket_start,
            SUM(fo."totalAmount")::double precision AS revenue
          FROM filtered_orders fo
          GROUP BY 1
        ),
        manual_revenue AS (
          SELECT
            date_trunc(${bucketUnit}, ms."createdAt") AS bucket_start,
            SUM(ms."totalAmount")::double precision AS revenue
          FROM manual_sales ms
          GROUP BY 1
        ),
        order_detail_agg AS (
          SELECT
            date_trunc(${bucketUnit}, fo."createdAt") AS bucket_start,
            SUM(od.price * od.quantity)::double precision AS "totalSell",
            SUM(od."costPrice" * od.quantity)::double precision AS "totalCost",
            SUM(od.quantity)::double precision AS quantity
          FROM filtered_orders fo
          INNER JOIN "OrderDetail" od ON od."orderId" = fo.id
          GROUP BY 1
        ),
        manual_detail_agg AS (
          SELECT
            date_trunc(${bucketUnit}, ms."createdAt") AS bucket_start,
            SUM(sod.price * sod.quantity)::double precision AS "totalSell",
            SUM(sod."costPrice" * sod.quantity)::double precision AS "totalCost",
            SUM(sod.quantity)::double precision AS quantity
          FROM manual_sales ms
          INNER JOIN "StockOutDetail" sod ON sod."stockOutId" = ms.id
          GROUP BY 1
        ),
        combined_revenue AS (
          SELECT bucket_start, SUM(revenue) AS revenue
          FROM (SELECT * FROM order_revenue UNION ALL SELECT * FROM manual_revenue) r
          GROUP BY 1
        ),
        combined_detail AS (
          SELECT bucket_start,
            SUM("totalSell") AS "totalSell",
            SUM("totalCost") AS "totalCost",
            SUM(quantity) AS quantity
          FROM (SELECT * FROM order_detail_agg UNION ALL SELECT * FROM manual_detail_agg) d
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
          COALESCE(combined_revenue.revenue, 0)::double precision AS revenue,
          COALESCE(combined_detail."totalSell", 0)::double precision AS "totalSell",
          COALESCE(combined_detail."totalCost", 0)::double precision AS "totalCost",
          COALESCE(combined_detail.quantity, 0)::double precision AS quantity
        FROM series
        LEFT JOIN combined_revenue USING (bucket_start)
        LEFT JOIN combined_detail USING (bucket_start)
        ORDER BY series.bucket_start
      `),
    ]);

    const summary = summaryRows[0] ?? {
      revenue: 0,
      totalSell: 0,
      totalCost: 0,
      totalQuantity: 0,
    };

    const result = {
      summary: {
        revenue: Number(summary.revenue),
        profit: Number(summary.totalSell) - Number(summary.totalCost),
        totalSoldQuantity: Number(summary.totalQuantity),
      },
      breakdown: this.fillSalesBreakdown(breakdownRows, start, end, bucket),
    };

    await this.cacheManager.set(cacheKey, result, 3600000); // Cache 1 hour
    return result;
  }
}

