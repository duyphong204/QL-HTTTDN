/** Central API path map — dùng trong services để tránh magic string. */

export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    logout: '/auth/logout',
  },
  users: {
    root: '/users',
    byId: (id: string) => `/users/${id}`,
    role: (id: string) => `/users/${id}/role`,
  },
  admin: {
    dashboardReport: '/admin/dashboard-report',
  },
  employees: {
    root: '/employees',
    byId: (id: string) => `/employees/${id}`,
    me: '/employees/me',
    hrReport: '/employees/statistics/hr-report',
  },
  leaveRequests: {
    root: '/leave-requests',
    me: '/leave-requests/me',
    approve: (id: string) => `/leave-requests/${id}/approve`,
    reject: (id: string) => `/leave-requests/${id}/reject`,
    byId: (id: string) => `/leave-requests/${id}`,
  },
  salaries: {
    root: '/salaries',
    byId: (id: string) => `/salaries/${id}`,
    me: '/salaries/me',
    report: '/salaries/report',
    calculateAll: '/salaries/calculate-all',
    calculate: '/salaries/calculate',
  },
  categories: {
    root: '/categories',
    byId: (id: string) => `/categories/${id}`,
  },
  suppliers: {
    root: '/suppliers',
    byId: (id: string) => `/suppliers/${id}`,
  },
  products: {
    root: '/products',
    byId: (id: string) => `/products/${id}`,
  },
  stockIns: {
    root: '/stock-ins',
    byId: (id: string) => `/stock-ins/${id}`,
  },
  warehouse: {
    report: '/warehouse/report',
  },
  orders: {
    root: '/orders',
    my: '/orders/my',
    byId: (id: string) => `/orders/${id}`,
    status: (id: string) => `/orders/${id}/status`,
    cancel: (id: string) => `/orders/${id}/cancel`,
    stats: '/orders/stats',
    period: '/orders/period',
  },
  cart: {
    root: '/cart',
    items: '/cart/items',
    item: (itemId: string) => `/cart/items/${itemId}`,
    clear: '/cart/clear',
  },
} as const
