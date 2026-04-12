import type { BaseEntity } from "./common.type"
import type { User } from "./user.type"

export interface SystemLog extends BaseEntity {
    userId?: string
    user?: User
    action: string
    details?: string
}

// Report types
export interface SalaryReport {
    employeeId: string
    employeeName: string
    month: number
    year: number
    baseSalary: number
    bonus: number
    deduction: number
    totalSalary: number
    status: "PAID" | "PENDING"
}

export interface RevenueReport {
    period: string  
    totalRevenue: number
    totalOrders: number
    totalItems: number
    averageOrderValue: number
}

export interface ProfitReport {
    period: string
    totalRevenue: number
    totalCost: number
    totalProfit: number
    profitMargin: number  
}

export interface EmployeeStatistics {
    period: string
    totalEmployees: number
    newHires: number
    resignations: number
    totalSalaryExpense: number
    averageSalary: number
}

export interface StockReport {
    period: string
    totalStockIn: number
    totalProducts: number
    lowStockProducts: number  
    totalValue: number
}

export interface AdminDashboardReport {
    period: {
        month?: number
        year: number
    }
    generatedAt: string
    sales: {
        totalOrders: number
        totalItemsSold: number
        totalRevenue: number
        totalProfit: number
    }
    warehouse: {
        totalStockIns: number
        totalImportValue: number
        totalImportQuantity: number
        totalProductTypes: number
        totalStockQuantity: number
        lowStockProducts: {
            id: string
            name: string
            stockQuantity: number
            minStock: number
        }[]
    }
    hr: {
        totalEmployees: number
        totalResigned: number
        headcount: number
        totalSalaryPaid: number
        totalBonus: number
    }
}
