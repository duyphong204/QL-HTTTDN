/** Central API path map — dùng trong services để tránh magic string. */

export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    profile: "/auth/profile",
    logout: "/auth/logout",
  },
  users: {
    root: "/users",
    byId: (id: string) => `/users/${id}`,
  },
  employees: {
    root: "/employees",
    byId: (id: string) => `/employees/${id}`,
    me: "/employees/me",
    hrReport: "/employees/statistics/hr-report",
    jobHistory: (id: string) => `/employees/${id}/job-history`,
    changePosition: (id: string) => `/employees/${id}/position`,
    updateProfile: (id: string) => `/employees/${id}/profile`,
  },
  leaveRequests: {
    root: "/leave-requests",
    me: "/leave-requests/me",
    balance: "/leave-requests/balance",
    status: (id: string) => `/leave-requests/${id}/status`,
    byId: (id: string) => `/leave-requests/${id}`,
  },
  salaries: {
    root: "/salaries",
    byId: (id: string) => `/salaries/${id}`,
    me: "/salaries/me",
    stats: "/salaries/stats",
    calculateAll: "/salaries/calculate-all",
    calculate: "/salaries/calculate",
    status: (id: string) => `/salaries/${id}/status`,
    details: (id: string) => `/salaries/${id}/details`,
  },
  categories: {
    root: "/categories",
    byId: (id: string) => `/categories/${id}`,
  },
  suppliers: {
    root: "/suppliers",
    byId: (id: string) => `/suppliers/${id}`,
  },
  products: {
    root: "/products",
    stats: "/products/stats",
    byId: (id: string) => `/products/${id}`,
  },
  stockIns: {
    root: "/stock-ins",
    byId: (id: string) => `/stock-ins/${id}`,
  },
  stockOuts: {
    root: "/stock-outs",
    byId: (id: string) => `/stock-outs/${id}`,
  },
  orders: {
    root: "/orders",
    my: "/orders/my",
    byId: (id: string) => `/orders/${id}`,
    status: (id: string) => `/orders/${id}/status`,
    cancel: (id: string) => `/orders/${id}/cancel`,
    stats: "/orders/stats",
    period: "/orders/period",
  },
  cart: {
    root: "/cart",
    items: "/cart/items",
    item: (itemId: string) => `/cart/items/${itemId}`,
    clear: "/cart/clear",
  },
  reports: {
    sales: "/reports/sales",
    warehouse: "/reports/warehouse",
    hr: "/reports/hr",
  },
} as const;
