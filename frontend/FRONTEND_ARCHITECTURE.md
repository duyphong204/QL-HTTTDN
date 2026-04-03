# Frontend Architecture Guide

## Overview

The frontend follows a **clean layered architecture** that separates concerns into 4 distinct layers. Data flows unidirectionally from the API layer through the Store to Components.

```
┌─────────────────────────────────────────────────────┐
│              Pages & Components                      │
│       (Only read data & call Store actions)         │
└────────────────────┬────────────────────────────────┘
                     │
                     │ useHook() / dispatch
                     ▼
┌─────────────────────────────────────────────────────┐
│         Store Layer (Zustand)                        │
│  - State management (data, loading, error)          │
│  - Side effects (toast notifications, logging)      │
│  - Calls API functions                             │
└────────────────────┬────────────────────────────────┘
                     │
                     │ Direct calls
                     ▼
┌─────────────────────────────────────────────────────┐
│          API Layer (/src/api)                        │
│  - HTTP calls via axiosInstance                      │
│  - No state management                               │
│  - Domain-organized API functions                    │
└────────────────────┬────────────────────────────────┘
                     │
                     │ axios interceptors
                     ▼
┌─────────────────────────────────────────────────────┐
│    Types Layer (/src/types)                          │
│  - TypeScript interfaces for all data               │
│  - API request/response types                       │
│  - Store state types                                │
└─────────────────────────────────────────────────────┘
```

---

## 1. Types Layer (`/src/types/`)

### Purpose
Define all TypeScript interfaces and types for:
- API request/response payloads
- Store state structures
- Component-specific types

### Files Structure
- `auth.type.ts` - Authentication types (LoginRequest, RegisterResponse, etc.)
- `user.type.ts` - User-related types
- `warehouse.type.ts` - Product, Category, Supplier types
- `hr.type.ts` - Employee, Leave, Salary types
- `sales.type.ts` - Order, Cart types
- `common.type.ts` - Shared types (PaginatedResponse, BaseFilters, etc.)
- `admin.type.ts` - Admin-specific types
- `employee.type.ts` - Employee-view types
- `index.ts` - Barrel exports

### Naming Conventions
- **Request types**: `{Entity}Request` (e.g., `CreateProductDto`)
- **Response types**: `{Entity}Response` or just `{Entity}`
- **Enums**: PascalCase (e.g., `Role`, `OrderStatus`)
- **DTO types**: `{Entity}Dto` (e.g., `CreateProductDto`)

### Example
```typescript
// /src/types/product.type.ts (in warehouse.type.ts)
export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  stockQuantity: number;
  createdAt: Date;
}

export interface CreateProductDto {
  name: string;
  price: number;
  categoryId: string;
}
```

---

## 2. API Layer (`/src/api/`)

### Purpose
Make HTTP requests to the backend using axiosInstance.
Handle request/response serialization and basic error propagation.

### Files Structure
- `axios.ts` - Central axios configuration
  - axiosInstance initialization
  - Request interceptors (attach Access Token)
  - Response interceptors (unwrap envelope, auto-refresh logic)
  - Error handling
- `auth.api.ts` - Login, Register, Logout, RefreshToken
- `user.api.ts` - User CRUD operations
- `warehouse.api.ts` - Product, Category, Supplier, StockIn operations
- `hr.api.ts` - Employee, LeaveRequest, Salary operations
- `order.api.ts` - Order and Cart operations
- `constants.ts` - API configuration (BASE_URL, TIMEOUT, etc.)

### Key Rules
1. ✅ **Only make HTTP calls** - No state management
2. ✅ **Use axiosInstance** - All requests go through the configured instance
3. ✅ **Type all responses** - Use types from `/src/types/`
4. ✅ **Handle FormData** - For file uploads, create FormData objects
5. ❌ **No error handling** - Pass errors up the chain to Store
6. ❌ **No side effects** - No toasts, redirects, or logging

### Example
```typescript
// /src/api/auth.api.ts
import type { LoginRequest, LoginResponse } from "@/types/auth.type";
import { axiosInstance } from "./axios";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await axiosInstance.post("/auth/login", data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },
};
```

---

## 3. Store Layer (`/src/store/`)

### Purpose
Manage application state using Zustand.
Call API functions, handle loading/error states, and side effects.

### Files Structure
- `auth.store.ts` - Authentication state (user, isAuthenticated, login action, etc.)
- `user.store.ts` - User CRUD state
- `product.store.ts` - Product, Category, Supplier state
- `employee.store.ts` - Employee management state
- `hr.store.ts` - HR operations state
- `sales.store.ts` - Sales orders state
- `supplier.store.ts` - Supplier state
- `admin.store.ts` - Admin dashboard state
- `stockIn.store.ts` - Stock-In operations state
- `store.helpers.ts` - Shared utilities for error handling, loading states

### State Structure
Every store should have:
```typescript
interface XxxState {
  // Data state
  data: Entity[];
  meta: PaginationMeta | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Filters/pagination
  filters: Filters;
  
  // Actions
  fetchData: () => Promise<void>;
  createData: (data: CreateDto) => Promise<void>;
  updateData: (id: string, data: UpdateDto) => Promise<void>;
  deleteData: (id: string) => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
}
```

### Key Rules
1. ✅ **Call API functions** - Never make HTTP calls directly
2. ✅ **Manage loading/error states** - For UI feedback
3. ✅ **Handle side effects** - Toast notifications, redirects, logging
4. ✅ **Type everything** - Use types from `/src/types/`
5. ✅ **Use store.helpers** - Leverage getErrorMessage(), loadingState()
6. ❌ **No direct axios calls** - Always use API layer
7. ❌ **No component-specific logic** - Keep it general

### Example
```typescript
// /src/store/product.store.ts
import { create } from 'zustand';
import { productApi } from '@/api/warehouse.api';
import type { Product, CreateProductDto } from '@/types/warehouse.type';
import { getErrorMessage } from '@/store/store.helpers';
import { toast } from 'sonner';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductDto) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await productApi.getProducts();
      set({ products, error: null });
    } catch (error) {
      const msg = getErrorMessage(error, "Lỗi tải danh sách");
      toast.error(msg);
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  createProduct: async (data) => {
    try {
      const product = await productApi.createProduct(data);
      set((state) => ({
        products: [...state.products, product],
      }));
      toast.success("Tạo sản phẩm thành công");
    } catch (error) {
      const msg = getErrorMessage(error, "Lỗi tạo sản phẩm");
      toast.error(msg);
      throw error;
    }
  },
}));
```

---

## 4. Pages & Components Layer (`/src/pages/`, `/src/components/`)

### Purpose
Render UI using data from Store.
Dispatch Store actions in useEffect and event handlers.

### Key Rules
1. ✅ **Never import API functions** - Always use Store
2. ✅ **Use useHook from Store** - Access state and actions
3. ✅ **Fetch in useEffect** - Initialize data on mount
4. ✅ **Handle store state** - Show loading, error, empty states
5. ❌ **No API calls** - No `axiosInstance.get()` etc.
6. ❌ **No side effects** - No direct toasts, redirects (Store handles them)

### Example
```typescript
// /src/pages/warehouse/ProductManagement.tsx
import { useEffect } from 'react';
import { useProductStore } from '@/store/product.store';

export default function ProductManagement() {
  const {
    products,
    isLoading,
    fetchProducts,
    createProduct,
  } = useProductStore();

  // Fetch data on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreate = async (data: CreateProductDto) => {
    await createProduct(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

---

## Store Helpers (`/src/store/store.helpers.ts`)

### Utilities

#### `getErrorMessage(error: unknown, defaultMsg: string): string`
Extract readable error message from API errors.

```typescript
try {
  await api.doSomething();
} catch (error) {
  const msg = getErrorMessage(error, "Lỗi không xác định");
  toast.error(msg);
}
```

#### `loadingState<T>(isLoading: boolean, data: T, fallback?: T): T`
Manage loading state elegantly.

```typescript
const safePaginatedProducts = loadingState(
  isLoading,
  meta,
  { page: 0, totalPages: 0 }
);
```

#### `mergeFiltersWithPageReset(currentFilters, newFilters): Filters`
Merge filter updates and reset pagination.

```typescript
setFilters: (newFilters) => {
  set((state) => ({
    filters: mergeFiltersWithPageReset(state.filters, newFilters),
  }));
},
```

---

## API Interceptors (`/src/api/axios.ts`)

### Request Interceptor
- Attaches `Authorization: Bearer {accessToken}` header
- Handles FormData (removes Content-Type for multipart)

### Response Interceptor
- Unwraps API envelope: `{ success, data, message }` → `data`
- Auto-refreshes token on 401 (except login/refresh endpoints)
- Queues failed requests during refresh, retries after

### Error Handling
- Returns Promise.reject(error) to be caught in Store

---

## Data Flow Examples

### Example 1: Fetch Product List

```
1. Component mounts
   ↓
2. useEffect calls fetchProducts() from Store
   ↓
3. Store: set({ isLoading: true })
   ↓
4. Store calls: productApi.getProducts()
   ↓
5. API Layer: axiosInstance.get('/products')
   ↓
6. Axios Interceptor: Adds Authorization header
   ↓
7. Backend responds with { success: true, data: [...] }
   ↓
8. Response Interceptor: Unwraps to [...]
   ↓
9. Store: set({ products, isLoading: false })
   ↓
10. Component re-renders with products
```

### Example 2: Create Product with Error

```
1. User clicks "Create" button
   ↓
2. handleCreate calls store.createProduct(data)
   ↓
3. Store: productApi.createProduct(data)
   ↓
4. API: axiosInstance.post('/products', data)
   ↓
5. Backend returns 400 error: { message: "Invalid product name" }
   ↓
6. Response Interceptor: Passes error to catch block
   ↓
7. Store catch: getErrorMessage() → "Invalid product name"
   ↓
8. Store: toast.error("Invalid product name")
   ↓
9. Component displays error via Sonner toast
```

---

## Best Practices

### ✅ DO
- Type everything strictly
- Keep API functions pure (no side effects)
- Handle loading/error in Store, not Component
- Use barrel exports (/src/api/index.ts, /src/store/index.ts)
- Keep components focused on UI rendering
- Centralize error messages in Store

### ❌ DON'T
- Call API directly from Component
- Use async directly in component render
- Duplicate error handling logic
- Mix concerns in one file
- Create API calls without types
- Handle side effects in API layer

---

## Migration Checklist (for New Features)

- [ ] Create types in `/src/types/{domain}.type.ts`
- [ ] Create API functions in `/src/api/{domain}.api.ts`
- [ ] Create Store in `/src/store/{domain}.store.ts`
- [ ] Create Pages/Components in `/src/pages/{domain}/`
- [ ] Components only use hooks from Store
- [ ] All data flows from API → Store → Component
- [ ] Error handling in Store only
- [ ] Side effects in Store only

---

## File Organization

```
frontend/
├── src/
│   ├── types/                 # TypeScript types & interfaces
│   │   ├── auth.type.ts
│   │   ├── user.type.ts
│   │   ├── warehouse.type.ts
│   │   ├── common.type.ts
│   │   └── index.ts           # Barrel export
│   │
│   ├── api/                   # HTTP requests (axiosInstance)
│   │   ├── axios.ts           # Instance + interceptors
│   │   ├── auth.api.ts
│   │   ├── user.api.ts
│   │   ├── warehouse.api.ts
│   │   ├── constants.ts       # API_CONFIG
│   │   └── index.ts           # Barrel export (optional)
│   │
│   ├── store/                 # State management (Zustand)
│   │   ├── auth.store.ts
│   │   ├── user.store.ts
│   │   ├── product.store.ts
│   │   ├── store.helpers.ts   # Utilities
│   │   └── index.ts           # Barrel export (optional)
│   │
│   ├── pages/                 # Page components
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── warehouse/
│   │   └── ...
│   │
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Navbar, Sidebar, etc.
│   │   └── ui/                # Button, Input, etc.
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── usePaginatedList.ts
│   │   └── useClientTable.ts
│   │
│   ├── lib/                   # Utilities
│   │   ├── utils.ts
│   │   └── cloudinary.ts
│   │
│   ├── App.tsx
│   └── main.tsx
```

---

## Common Patterns

### Pagination with Filtering
```typescript
// Store
interface State {
  filters: Filters;
  meta: PaginationMeta;
  setFilters: (f: Partial<Filters>) => void;
  fetchItems: () => Promise<void>;
}

// Component
const { filters, setFilters, fetchItems } = useStore();
useEffect(() => { fetchItems(); }, [filters]);
```

### Loading with Fallback
```typescript
const safeData = loadingState(isLoading, data, []);
items.map(item => <Item key={item.id} {...item} />)
```

### Error Messages
```typescript
try {
  await api.call();
} catch (error) {
  const msg = getErrorMessage(error, "Mặc định");
  toast.error(msg);
  set({ error: msg });
}
```

---

## TypeScript Strict Mode

All files must follow strict TypeScript:
- Enable `strict: true` in tsconfig.json
- Avoid `any` - use proper types
- Use `unknown` only when unavoidable
- Export types from `/src/types/`

---

## Summary

```
Types (Contracts)
    ↓
API (HTTP calls)
    ↓
Store (State + Side Effects)
    ↓
Components (UI)
```

**Every layer depends only on the layer below. Never skip layers.**
