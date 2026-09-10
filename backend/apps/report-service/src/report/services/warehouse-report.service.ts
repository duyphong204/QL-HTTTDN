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

interface TopProductRow {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface TopCategoryRow {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
}

interface TopSupplierRow {
  supplierId: string;
  supplierName: string;
  totalQuantity: number;
  totalRevenue: number;
}

@Injectable()
export class WarehouseReportService {
  constructor(private readonly prisma: PrismaService) {}

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

    throw new BadRequestException(
      'Warehouse report supports month or year only',
    );
  }

  private fillWarehouseBreakdown(
    rows: WarehouseBreakdownRow[],
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
        import: Number(row?.importAmount ?? 0),
        export: Number(row?.exportAmount ?? 0),
      };
    });
  }

  async getWarehouseReport(query: ReportQueryDto) {
    const { start, end, bucket } = this.resolveWarehousePeriod(query);
    const bucketUnit = bucket === 'day' ? 'day' : 'month';
    const bucketInterval = bucket === 'day' ? '1 day' : '1 month';

    const [
      summaryRows,
      breakdownRows,
      topProducts,
      topCategories,
      topSuppliers,
    ] = await Promise.all([
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
        ),
        order_exports AS (
          SELECT o.id, o."totalAmount", o."createdAt"
          FROM "Order" o
          WHERE o."createdAt" BETWEEN ${start} AND ${end}
            AND o.status <> 'PENDING'
            AND NOT EXISTS (
              SELECT 1 FROM "StockOut" so
              WHERE so."orderId" = o.id AND so.status = 'COMPLETED'
            )
        )
        SELECT
          COALESCE((SELECT SUM("totalAmount") FROM filtered_stock_in), 0)::double precision AS "totalImportAmount",
          COALESCE((SELECT SUM(sid.quantity)
            FROM filtered_stock_in si
            INNER JOIN "StockInDetail" sid ON sid."stockInId" = si.id
          ), 0)::double precision AS "totalImportQuantity",
          (COALESCE((SELECT SUM("totalAmount") FROM filtered_stock_out), 0) +
           COALESCE((SELECT SUM("totalAmount") FROM order_exports), 0))::double precision AS "totalExportAmount",
          (COALESCE((SELECT SUM(sod.quantity)
            FROM filtered_stock_out so
            INNER JOIN "StockOutDetail" sod ON sod."stockOutId" = so.id
          ), 0) +
           COALESCE((SELECT SUM(od.quantity)
            FROM order_exports oe
            INNER JOIN "OrderDetail" od ON od."orderId" = oe.id
          ), 0))::double precision AS "totalExportQuantity",
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
        order_exports AS (
          SELECT o.id, o."totalAmount", o."createdAt"
          FROM "Order" o
          WHERE o."createdAt" BETWEEN ${start} AND ${end}
            AND o.status <> 'PENDING'
            AND NOT EXISTS (
              SELECT 1 FROM "StockOut" so
              WHERE so."orderId" = o.id AND so.status = 'COMPLETED'
            )
        ),
        import_breakdown AS (
          SELECT
            date_trunc(${bucketUnit}, si.date) AS bucket_start,
            SUM(si."totalAmount")::double precision AS "importAmount"
          FROM filtered_stock_in si
          GROUP BY 1
        ),
        stock_out_export AS (
          SELECT
            date_trunc(${bucketUnit}, so."createdAt") AS bucket_start,
            SUM(so."totalAmount")::double precision AS "exportAmount"
          FROM filtered_stock_out so
          GROUP BY 1
        ),
        order_export_agg AS (
          SELECT
            date_trunc(${bucketUnit}, oe."createdAt") AS bucket_start,
            SUM(oe."totalAmount")::double precision AS "exportAmount"
          FROM order_exports oe
          GROUP BY 1
        ),
        combined_export AS (
          SELECT bucket_start, SUM("exportAmount") AS "exportAmount"
          FROM (SELECT * FROM stock_out_export UNION ALL SELECT * FROM order_export_agg) e
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
          COALESCE(combined_export."exportAmount", 0)::double precision AS "exportAmount"
        FROM series
        LEFT JOIN import_breakdown USING (bucket_start)
        LEFT JOIN combined_export USING (bucket_start)
        ORDER BY series.bucket_start
      `),
      this.prisma.$queryRaw<TopProductRow[]>(Prisma.sql`
        WITH order_sales AS (
          SELECT od."productId", od.quantity, od.price
          FROM "OrderDetail" od
          INNER JOIN "Order" o ON o.id = od."orderId"
          WHERE o."createdAt" BETWEEN ${start} AND ${end}
            AND o.status NOT IN ('PENDING', 'CANCELLED')
        ),
        manual_sales AS (
          SELECT sod."productId", sod.quantity, sod.price
          FROM "StockOutDetail" sod
          INNER JOIN "StockOut" so ON so.id = sod."stockOutId"
          WHERE so."createdAt" BETWEEN ${start} AND ${end}
            AND so.status = 'COMPLETED'
            AND so.type = 'SALE'
        ),
        combined AS (
          SELECT * FROM order_sales UNION ALL SELECT * FROM manual_sales
        )
        SELECT
          p.id AS "productId",
          p.name AS "productName",
          SUM(c.quantity)::double precision AS "totalQuantity",
          SUM(c.quantity * c.price)::double precision AS "totalRevenue"
        FROM combined c
        INNER JOIN "Product" p ON p.id = c."productId"
        GROUP BY p.id, p.name
        ORDER BY SUM(c.quantity) DESC
        LIMIT 10
      `),
      this.prisma.$queryRaw<TopCategoryRow[]>(Prisma.sql`
        WITH order_sales AS (
          SELECT od."productId", od.quantity
          FROM "OrderDetail" od
          INNER JOIN "Order" o ON o.id = od."orderId"
          WHERE o."createdAt" BETWEEN ${start} AND ${end}
            AND o.status NOT IN ('PENDING', 'CANCELLED')
        ),
        manual_sales AS (
          SELECT sod."productId", sod.quantity
          FROM "StockOutDetail" sod
          INNER JOIN "StockOut" so ON so.id = sod."stockOutId"
          WHERE so."createdAt" BETWEEN ${start} AND ${end}
            AND so.status = 'COMPLETED'
            AND so.type = 'SALE'
        ),
        combined AS (
          SELECT * FROM order_sales UNION ALL SELECT * FROM manual_sales
        )
        SELECT
          cat.id AS "categoryId",
          cat.name AS "categoryName",
          SUM(c.quantity)::double precision AS "totalQuantity"
        FROM combined c
        INNER JOIN "Product" p ON p.id = c."productId"
        INNER JOIN "Category" cat ON cat.id = p."categoryId"
        GROUP BY cat.id, cat.name
        ORDER BY SUM(c.quantity) DESC
        LIMIT 10
      `),
      this.prisma.$queryRaw<TopSupplierRow[]>(Prisma.sql`
        WITH order_sales AS (
          SELECT od."productId", od.quantity, od.price
          FROM "OrderDetail" od
          INNER JOIN "Order" o ON o.id = od."orderId"
          WHERE o."createdAt" BETWEEN ${start} AND ${end}
            AND o.status NOT IN ('PENDING', 'CANCELLED')
        ),
        manual_sales AS (
          SELECT sod."productId", sod.quantity, sod.price
          FROM "StockOutDetail" sod
          INNER JOIN "StockOut" so ON so.id = sod."stockOutId"
          WHERE so."createdAt" BETWEEN ${start} AND ${end}
            AND so.status = 'COMPLETED'
            AND so.type = 'SALE'
        ),
        combined AS (
          SELECT * FROM order_sales UNION ALL SELECT * FROM manual_sales
        )
        SELECT
          sup.id AS "supplierId",
          sup.name AS "supplierName",
          SUM(c.quantity)::double precision AS "totalQuantity",
          SUM(c.quantity * c.price)::double precision AS "totalRevenue"
        FROM combined c
        INNER JOIN "Product" p ON p.id = c."productId"
        INNER JOIN "Supplier" sup ON sup.id = p."supplierId"
        GROUP BY sup.id, sup.name
        ORDER BY SUM(c.quantity) DESC
        LIMIT 10
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
      topProducts: topProducts.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        totalQuantity: Number(r.totalQuantity),
        totalRevenue: Number(r.totalRevenue),
      })),
      topCategories: topCategories.map((r) => ({
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        totalQuantity: Number(r.totalQuantity),
      })),
      topSuppliers: topSuppliers.map((r) => ({
        supplierId: r.supplierId,
        supplierName: r.supplierName,
        totalQuantity: Number(r.totalQuantity),
        totalRevenue: Number(r.totalRevenue),
      })),
    };
  }
}
