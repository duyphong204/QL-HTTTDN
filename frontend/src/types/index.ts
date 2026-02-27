// Common
export type { BaseEntity, Pagination, ApiResponse, PaginatedResponse } from "./common.type"

// Auth
export type { Role, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "./auth.type"

// User
export type {
    User,
    Profile,
    CreateUserDto,
    UpdateUserDto,
    UpdateProfileDto,
} from "./user.type"

// Warehouse
export type {
    Category,
    Supplier,
    Product,
    CreateProductDto,
    UpdateProductDto,
    StockIn,
    StockInDetail,
    StockInDetailInput,
    CreateStockInDto,
    UpdateStockInDto,
} from "./warehouse.type"

// Sales
export type {
    Cart,
    CartItem,
    Order,
    OrderDetail,
    CreateOrderDto,
    UpdateOrderStatusDto,
    CancelOrderDto,
    AddToCartDto,
    UpdateCartItemDto,
} from "./sales.type"

// HR
export type {
    Employee,
    CreateEmployeeDto,
    UpdateEmployeeDto,
    JobHistory,
    CreateJobHistoryDto,
    Salary,
    CreateSalaryDto,
    UpdateSalaryDto,
    LeaveRequest,
    CreateLeaveRequestDto,
    ApproveLeaveRequestDto,
} from "./hr.type"

// Admin
export type {
    SystemLog,
    SalaryReport,
    RevenueReport,
    ProfitReport,
    EmployeeStatistics,
    StockReport,
} from "./admin.type"