import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { ReportQueryParams, RechartsSeriesResponse } from './report.types';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly palette = {
    revenue: '#2563eb',
    profit: '#16a34a',
    quantity: '#f97316',
    salary: '#0ea5e9',
    bonus: '#22c55e',
    deduction: '#ef4444',
    stock: '#0891b2',
    inbound: '#22c55e',
    outbound: '#f97316',
  };

  private toNumber(value: number | null | undefined): number {
    return Number(value ?? 0);
  }

  private getYear(value?: number): number {
    return value || new Date().getFullYear();
  }

  private monthKey(date: Date): number {
    return date.getMonth() + 1;
  }

  private dayKey(date: Date): number {
    return date.getDate();
  }

  private monthLabels(year: number): string[] {
    return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  }

  private quarterMonths(quarter: number): number[] {
    const start = (quarter - 1) * 3 + 1;
    return [start, start + 1, start + 2];
  }

  private toChart(labels: string[], datasets: RechartsSeriesResponse['datasets']): RechartsSeriesResponse {
    return { labels, datasets };
  }

  async getAdminDashboard(params: ReportQueryParams = {}) {
    const year = this.getYear(params.year);
    const month = params.month;

    const periodStart = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
    const periodEnd = month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(year, 11, 31, 23, 59, 59);

    const [completedOrders, products, employees, salaries, logs] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: periodStart, lte: periodEnd },
        },
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
          details: {
            select: {
              quantity: true,
              price: true,
              costPrice: true,
              productId: true,
              product: { select: { name: true, category: { select: { name: true } } } },
            },
          },
        },
      }),
      this.prisma.product.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          minStock: true,
          category: { select: { name: true } },
        },
      }),
      this.prisma.employee.count({ where: { resignDate: null } }),
      this.prisma.salary.aggregate({
        where: {
          ...(month ? { month } : {}),
          year,
        },
        _sum: { amount: true, bonus: true },
      }),
      this.prisma.systemLog.findMany({
        where: { createdAt: { gte: periodStart, lte: periodEnd } },
        select: { userId: true },
      }),
    ]);

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalItemsSold = 0;

    const revenueByMonth = new Map<number, { revenue: number; profit: number }>();
    const productAgg = new Map<string, { name: string; quantity: number; revenue: number }>();
    const revenueByCategory = new Map<string, number>();

    for (const order of completedOrders) {
      const monthBucket = this.monthKey(order.createdAt);
      const monthRow = revenueByMonth.get(monthBucket) || { revenue: 0, profit: 0 };
      monthRow.revenue += this.toNumber(order.totalAmount);
      revenueByMonth.set(monthBucket, monthRow);

      totalRevenue += this.toNumber(order.totalAmount);

      for (const detail of order.details) {
        const lineRevenue = detail.quantity * this.toNumber(detail.price);
        const lineProfit = detail.quantity * (this.toNumber(detail.price) - this.toNumber(detail.costPrice));

        totalItemsSold += detail.quantity;
        totalProfit += lineProfit;

        monthRow.profit += lineProfit;

        const key = detail.productId;
        const existing = productAgg.get(key) || {
          name: detail.product?.name || 'N/A',
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += detail.quantity;
        existing.revenue += lineRevenue;
        productAgg.set(key, existing);

        const categoryName = detail.product?.category?.name || 'Khác';
        revenueByCategory.set(categoryName, (revenueByCategory.get(categoryName) || 0) + lineRevenue);
      }

      revenueByMonth.set(monthBucket, monthRow);
    }

    const labels = month
      ? [`${year}-${String(month).padStart(2, '0')}`]
      : this.monthLabels(year);

    const revenueTrend = labels.map((_, idx) => {
      const monthIndex = month ? month : idx + 1;
      return revenueByMonth.get(monthIndex)?.revenue || 0;
    });

    const profitTrend = labels.map((_, idx) => {
      const monthIndex = month ? month : idx + 1;
      return revenueByMonth.get(monthIndex)?.profit || 0;
    });

    const topProducts = [...productAgg.entries()]
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const lowStockProducts = products
      .filter((p) => p.stockQuantity <= p.minStock)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stockQuantity: p.stockQuantity,
        minStock: p.minStock,
      }));

    const topProductChart = this.toChart(
      topProducts.map((p) => p.name),
      [
        {
          name: 'Số lượng bán',
          data: topProducts.map((p) => p.quantity),
          color: this.palette.quantity,
        },
      ],
    );

    const categoryRows = [...revenueByCategory.entries()].sort((a, b) => b[1] - a[1]);

    const categoryPie = this.toChart(
      categoryRows.map(([name]) => name),
      [
        {
          name: 'Doanh thu theo danh mục',
          data: categoryRows.map(([, value]) => value),
          color: this.palette.revenue,
        },
      ],
    );

    const activeUsers = new Set(logs.map((log) => log.userId).filter(Boolean));

    return {
      period: { year, month },
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue,
        totalProfit,
        totalItemsSold,
        totalOrders: completedOrders.length,
        totalEmployees: employees,
        totalSalaryPaid: this.toNumber(salaries._sum.amount),
        totalBonus: this.toNumber(salaries._sum.bonus),
        userActivity: {
          totalActions: logs.length,
          uniqueUsers: activeUsers.size,
        },
      },
      charts: {
        trend: this.toChart(labels, [
          { name: 'Doanh thu', data: revenueTrend, color: this.palette.revenue },
          { name: 'Lợi nhuận', data: profitTrend, color: this.palette.profit },
        ]),
        topProducts: topProductChart,
        categoryDistribution: categoryPie,
      },
      topProducts,
      lowStockProducts,
    };
  }

  async getAdminDashboardLegacy(params: ReportQueryParams = {}) {
    const admin = await this.getAdminDashboard(params);

    const year = this.getYear(params.year);
    const month = params.month;

    const [warehouseStockIns, productStats, totalResigned] = await Promise.all([
      this.prisma.stockIn.aggregate({
        where: {
          date: {
            gte: month ? new Date(year, month - 1, 1) : new Date(year, 0, 1),
            lte: month ? new Date(year, month, 0, 23, 59, 59) : new Date(year, 11, 31, 23, 59, 59),
          },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      this.prisma.product.aggregate({
        where: { deletedAt: null },
        _sum: { stockQuantity: true },
        _count: { id: true },
      }),
      this.prisma.employee.count({ where: { resignDate: { not: null } } }),
    ]);

    return {
      period: { month, year },
      generatedAt: admin.generatedAt,
      sales: {
        totalOrders: admin.summary.totalOrders,
        totalItemsSold: admin.summary.totalItemsSold,
        totalRevenue: admin.summary.totalRevenue,
        totalProfit: admin.summary.totalProfit,
      },
      warehouse: {
        totalStockIns: warehouseStockIns._count.id,
        totalImportValue: this.toNumber(warehouseStockIns._sum.totalAmount),
        totalImportQuantity: 0,
        totalProductTypes: productStats._count.id,
        totalStockQuantity: this.toNumber(productStats._sum.stockQuantity),
        lowStockProducts: admin.lowStockProducts,
      },
      hr: {
        totalEmployees: admin.summary.totalEmployees,
        totalResigned,
        headcount: admin.summary.totalEmployees,
        totalSalaryPaid: admin.summary.totalSalaryPaid,
        totalBonus: admin.summary.totalBonus,
      },
    };
  }

  async getHrManagerReport(params: ReportQueryParams = {}) {
    const year = this.getYear(params.year);
    const month = params.month || new Date().getMonth() + 1;

    const [monthSalaries, allSalariesInYear, employees, leaves] = await Promise.all([
      this.prisma.salary.findMany({
        where: { month, year },
        select: {
          amount: true,
          bonus: true,
          deduction: true,
          employee: { select: { department: true } },
        },
      }),
      this.prisma.salary.findMany({
        where: { year },
        select: { month: true, amount: true, bonus: true },
      }),
      this.prisma.employee.findMany({
        select: { joinDate: true, resignDate: true },
      }),
      this.prisma.leaveRequest.findMany({
        where: {
          startDate: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31, 23, 59, 59),
          },
          status: 'APPROVED',
        },
        select: { type: true },
      }),
    ]);

    const byDepartment = new Map<string, number>();
    let totalSalary = 0;
    let totalBonus = 0;

    for (const row of monthSalaries) {
      const dept = row.employee?.department || 'Chưa phân phòng ban';
      byDepartment.set(dept, (byDepartment.get(dept) || 0) + this.toNumber(row.amount));
      totalSalary += this.toNumber(row.amount);
      totalBonus += this.toNumber(row.bonus);
    }

    const salaryByMonth = Array.from({ length: 12 }, () => ({ salary: 0, bonus: 0 }));
    for (const row of allSalariesInYear) {
      salaryByMonth[row.month - 1].salary += this.toNumber(row.amount);
      salaryByMonth[row.month - 1].bonus += this.toNumber(row.bonus);
    }

    const activeHeadcountByMonth = Array.from({ length: 12 }, (_, idx) => {
      const checkpoint = new Date(year, idx + 1, 0, 23, 59, 59);
      return employees.filter((e) => e.joinDate <= checkpoint && (!e.resignDate || e.resignDate > checkpoint)).length;
    });

    const leaveByType = new Map<string, number>();
    for (const leave of leaves) {
      leaveByType.set(leave.type, (leaveByType.get(leave.type) || 0) + 1);
    }

    const salaryByDepartmentChart = this.toChart(
      [...byDepartment.keys()],
      [
        {
          name: 'Tổng lương theo phòng ban',
          data: [...byDepartment.values()],
          color: this.palette.salary,
        },
      ],
    );

    const headcountGrowth = this.toChart(
      this.monthLabels(year),
      [
        {
          name: 'Tăng trưởng nhân sự',
          data: activeHeadcountByMonth,
          color: this.palette.revenue,
        },
      ],
    );

    const leaveRatio = this.toChart(
      [...leaveByType.keys()],
      [
        {
          name: 'Tỷ lệ nghỉ phép',
          data: [...leaveByType.values()],
          color: this.palette.quantity,
        },
      ],
    );

    const monthlySalarySummary = this.toChart(
      this.monthLabels(year),
      [
        {
          name: 'Lương thực trả',
          data: salaryByMonth.map((m) => m.salary),
          color: this.palette.salary,
        },
        {
          name: 'Thưởng',
          data: salaryByMonth.map((m) => m.bonus),
          color: this.palette.bonus,
        },
      ],
    );

    return {
      period: { year, month },
      summary: {
        totalEmployeesCurrent: activeHeadcountByMonth[month - 1] || 0,
        totalSalary,
        totalBonus,
        totalBudget: totalSalary + totalBonus,
        totalApprovedLeaves: leaves.length,
      },
      charts: {
        salaryByDepartment: salaryByDepartmentChart,
        headcountGrowth,
        leaveRatio,
        monthlySalarySummary,
      },
    };
  }

  async getWarehouseManagerReport(params: ReportQueryParams = {}) {
    const year = this.getYear(params.year);
    const month = params.month;

    const periodStart = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
    const periodEnd = month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(year, 11, 31, 23, 59, 59);

    const [products, stockIns, stockOuts] = await Promise.all([
      this.prisma.product.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          minStock: true,
          category: { select: { name: true } },
        },
      }),
      this.prisma.stockIn.findMany({
        where: { date: { gte: periodStart, lte: periodEnd } },
        select: {
          date: true,
          totalAmount: true,
          details: { select: { quantity: true } },
        },
      }),
      this.prisma.stockOut.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: periodStart, lte: periodEnd },
        },
        select: {
          createdAt: true,
          details: { select: { quantity: true } },
        },
      }),
    ]);

    const byCategory = new Map<string, number>();
    for (const product of products) {
      const key = product.category?.name || 'Khác';
      byCategory.set(key, (byCategory.get(key) || 0) + product.stockQuantity);
    }

    const lowStockProducts = products
      .filter((p) => p.stockQuantity <= p.minStock)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stockQuantity: p.stockQuantity,
        minStock: p.minStock,
        alert: p.stockQuantity <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      }));

    const movementByMonth = Array.from({ length: 12 }, () => ({ inbound: 0, outbound: 0 }));

    let totalImportValue = 0;
    let totalInboundQty = 0;

    for (const stockIn of stockIns) {
      const m = this.monthKey(stockIn.date) - 1;
      const qty = stockIn.details.reduce((sum, d) => sum + d.quantity, 0);
      movementByMonth[m].inbound += qty;
      totalInboundQty += qty;
      totalImportValue += this.toNumber(stockIn.totalAmount);
    }

    let totalOutboundQty = 0;
    for (const stockOut of stockOuts) {
      const m = this.monthKey(stockOut.createdAt) - 1;
      const qty = stockOut.details.reduce((sum, d) => sum + d.quantity, 0);
      movementByMonth[m].outbound += qty;
      totalOutboundQty += qty;
    }

    return {
      period: { year, month },
      summary: {
        totalStockIns: stockIns.length,
        totalStockQuantity: products.reduce((sum, p) => sum + p.stockQuantity, 0),
        totalProductTypes: products.length,
        totalImportValue,
        totalInboundQty,
        totalOutboundQty,
        lowStockCount: lowStockProducts.length,
      },
      charts: {
        stockByCategory: this.toChart(
          [...byCategory.keys()],
          [
            {
              name: 'Tồn kho',
              data: [...byCategory.values()],
              color: this.palette.stock,
            },
          ],
        ),
        movementTrend: this.toChart(
          this.monthLabels(year),
          [
            {
              name: 'Nhập kho',
              data: movementByMonth.map((m) => m.inbound),
              color: this.palette.inbound,
            },
            {
              name: 'Xuất kho',
              data: movementByMonth.map((m) => m.outbound),
              color: this.palette.outbound,
            },
          ],
        ),
      },
      lowStockProducts,
    };
  }

  async getWarehouseLegacyReport(params: ReportQueryParams = {}) {
    const report = await this.getWarehouseManagerReport(params);
    return {
      period: report.period,
      totalStockIns: report.summary.totalStockIns,
      totalImportValue: report.summary.totalImportValue,
      totalImportQuantity: report.summary.totalInboundQty,
      totalProductTypes: report.summary.totalProductTypes,
      totalStockQuantity: report.summary.totalStockQuantity,
      lowStockProducts: report.lowStockProducts.map((item) => ({
        id: item.id,
        name: item.name,
        stockQuantity: item.stockQuantity,
        minStock: item.minStock,
      })),
    };
  }

  async getSalesManagerReport(params: ReportQueryParams = {}) {
    const year = this.getYear(params.year);
    const period = params.period || 'year';
    const month = params.month || new Date().getMonth() + 1;
    const quarter = params.quarter || 1;

    let labels: string[] = [];
    let rangeStart: Date;
    let rangeEnd: Date;

    if (period === 'month') {
      const daysInMonth = new Date(year, month, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);
      rangeStart = new Date(year, month - 1, 1);
      rangeEnd = new Date(year, month, 0, 23, 59, 59);
    } else if (period === 'quarter') {
      const months = this.quarterMonths(quarter);
      labels = months.map((m) => `${year}-${String(m).padStart(2, '0')}`);
      rangeStart = new Date(year, months[0] - 1, 1);
      rangeEnd = new Date(year, months[2], 0, 23, 59, 59);
    } else {
      labels = this.monthLabels(year);
      rangeStart = new Date(year, 0, 1);
      rangeEnd = new Date(year, 11, 31, 23, 59, 59);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: rangeStart, lte: rangeEnd },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        details: {
          select: {
            quantity: true,
            price: true,
            costPrice: true,
            productId: true,
            product: { select: { name: true } },
          },
        },
      },
    });

    const revenueBuckets = Array.from({ length: labels.length }, () => ({ revenue: 0, profit: 0 }));
    const topProducts = new Map<string, { name: string; quantity: number }>();

    let totalQuantity = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    for (const order of orders) {
      let bucketIndex = 0;

      if (period === 'month') {
        bucketIndex = this.dayKey(order.createdAt) - 1;
      } else if (period === 'quarter') {
        const qMonths = this.quarterMonths(quarter);
        bucketIndex = qMonths.indexOf(this.monthKey(order.createdAt));
      } else {
        bucketIndex = this.monthKey(order.createdAt) - 1;
      }

      if (bucketIndex < 0 || bucketIndex >= revenueBuckets.length) {
        continue;
      }

      revenueBuckets[bucketIndex].revenue += this.toNumber(order.totalAmount);
      totalRevenue += this.toNumber(order.totalAmount);

      for (const detail of order.details) {
        const detailProfit = detail.quantity * (this.toNumber(detail.price) - this.toNumber(detail.costPrice));
        revenueBuckets[bucketIndex].profit += detailProfit;
        totalProfit += detailProfit;
        totalQuantity += detail.quantity;

        const agg = topProducts.get(detail.productId) || {
          name: detail.product?.name || 'N/A',
          quantity: 0,
        };
        agg.quantity += detail.quantity;
        topProducts.set(detail.productId, agg);
      }
    }

    const topRows = [...topProducts.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    return {
      period: { year, period, month: period === 'month' ? month : undefined, quarter: period === 'quarter' ? quarter : undefined },
      summary: {
        totalOrders: orders.length,
        totalQuantity,
        totalRevenue,
        totalProfit,
      },
      charts: {
        profitTrend: this.toChart(labels, [
          {
            name: 'Lợi nhuận',
            data: revenueBuckets.map((b) => b.profit),
            color: this.palette.profit,
          },
        ]),
        quantityByProduct: this.toChart(
          topRows.map((r) => r.name),
          [
            {
              name: 'Số lượng đã xuất',
              data: topRows.map((r) => r.quantity),
              color: this.palette.quantity,
            },
          ],
        ),
        revenueProfitComposed: this.toChart(labels, [
          {
            name: 'Doanh thu',
            data: revenueBuckets.map((b) => b.revenue),
            color: this.palette.revenue,
          },
          {
            name: 'Lợi nhuận',
            data: revenueBuckets.map((b) => b.profit),
            color: this.palette.profit,
          },
        ]),
      },
    };
  }

  async getEmployeeSalaryReport(userId: string, params: ReportQueryParams = {}) {
    const year = this.getYear(params.year);
    const month = params.month;

    const salaries = await this.prisma.salary.findMany({
      where: {
        employee: { userId },
        year,
        ...(month ? { month } : {}),
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      include: {
        employee: {
          select: {
            baseSalary: true,
            user: { select: { profile: { select: { fullName: true } } } },
          },
        },
      },
    });

    const labels = salaries.map((s) => `${s.year}-${String(s.month).padStart(2, '0')}`);

    const baseSalaryData = salaries.map((s) => this.toNumber(s.employee?.baseSalary));
    const bonusData = salaries.map((s) => this.toNumber(s.bonus));
    const deductionData = salaries.map((s) => this.toNumber(s.deduction));
    const netData = salaries.map((s) => this.toNumber(s.amount));

    const summary = {
      totalRecords: salaries.length,
      totalNetSalary: netData.reduce((sum, value) => sum + value, 0),
      totalBonus: bonusData.reduce((sum, value) => sum + value, 0),
      totalDeduction: deductionData.reduce((sum, value) => sum + value, 0),
    };

    return {
      period: { year, month },
      summary,
      charts: {
        salaryBreakdown: this.toChart(labels, [
          { name: 'Lương cơ bản', data: baseSalaryData, color: this.palette.salary },
          { name: 'Thưởng', data: bonusData, color: this.palette.bonus },
          { name: 'Khấu trừ', data: deductionData, color: this.palette.deduction },
          { name: 'Thực lĩnh', data: netData, color: this.palette.revenue },
        ]),
      },
      salaryHistory: salaries.map((s) => ({
        id: s.id,
        month: s.month,
        year: s.year,
        baseSalary: this.toNumber(s.employee?.baseSalary),
        bonus: this.toNumber(s.bonus),
        deduction: this.toNumber(s.deduction),
        totalSalary: this.toNumber(s.amount),
        status: s.status,
        employeeName: s.employee?.user?.profile?.fullName || '',
      })),
    };
  }
}
