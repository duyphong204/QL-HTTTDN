# Frontend Code Style & Architecture Quick Reference

## Directory Structure Overview

```
frontend/src/
├── api/                     # HTTP layer
│   ├── axios.ts            # Configured axios instance + interceptors
│   ├── auth.api.ts         # Auth API functions
│   ├── user.api.ts         # User API functions
│   ├── warehouse.api.ts    # Product, Category, Supplier APIs
│   ├── hr.api.ts           # Employee, Leave, Salary APIs
│   ├── order.api.ts        # Order, Cart APIs
│   └── constants.ts        # API config
│
├── types/                   # TypeScript interfaces
│   ├── auth.type.ts        # Auth types
│   ├── user.type.ts        # User types
│   ├── warehouse.type.ts   # Product/Category/Supplier types
│   ├── hr.type.ts          # Employee/Leave/Salary types
│   ├── sales.type.ts       # Order/Cart types
│   ├── common.type.ts      # Shared types
│   └── index.ts            # Barrel export
│
├── store/                   # State management (Zustand)
│   ├── auth.store.ts       # Auth state
│   ├── user.store.ts       # User list state
│   ├── product.store.ts    # Product state
│   ├── hr.store.ts         # HR state
│   ├── sales.store.ts      # Sales/Order state
│   └── store.helpers.ts    # Shared utilities
│
├── pages/                   # Page components
│   ├── auth/               # Login, Register pages
│   ├── admin/              # Admin pages
│   ├── warehouse/          # Warehouse pages
│   ├── hr/                 # HR pages
│   └── sales/              # Sales pages
│
├── components/              # Reusable UI components
│   ├── common/             # DataTable, Pagination, etc.
│   └── ui/                 # Button, Input, Card, etc.
│
└── hooks/                   # Custom React hooks
```

---

## Data Flow Rules

### ✅ CORRECT Pattern

```
┌─────────────────────────────────┐
│  MyComponent.tsx                │
│  const { data, fetchData }      │
│    = useMyStore()               │
│  useEffect(() => {              │
│    fetchData()                  │
│  }, [fetchData])                │
└─────────────────────────────────┘
         uses hook from
             ↓
┌─────────────────────────────────┐
│  /src/store/myDomain.store.ts   │
│  fetchData: async () => {       │
│    const result =               │
│      await myApi.getData()      │
│    set({ data: result })        │
│  }                              │
└─────────────────────────────────┘
         calls API from
             ↓
┌─────────────────────────────────┐
│  /src/api/myDomain.api.ts       │
│  getData: async () => {         │
│    const res = await            │
│      axiosInstance.get(...)     │
│    return res.data              │
│  }                              │
└─────────────────────────────────┘
```

### ❌ WRONG Pattern

```
// ❌ Direct API call from Component
const MyComponent = () => {
  useEffect(() => {
    axiosInstance.get('/data') // WRONG! No interceptors, no error handling
  }, [])
}

// ❌ Skipping Store layer
import { authApi } from '@/api/auth.api' // WRONG! Should use Store
const MyComponent = () => {
  const user = await authApi.getProfile() // WRONG!
}

// ❌ Calling API from Store without proper error handling
const useMyStore = create(
  fetchData: async () => {
    const res = await myApi.getData() // WRONG! No error handling or loading state
    set({ data: res })
  }
)
```

---

## Common Patterns

### Pattern 1: Simple Fetch in Component

```typescript
// ✅ CORRECT
import { useProductStore } from '@/store/product.store';

export default function ProductList() {
  const { products, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

### Pattern 2: API Function

```typescript
// ✅ CORRECT
import { axiosInstance } from './axios';
import type { Product } from '@/types/warehouse.type';

export const productApi = {
  getProducts: async (): Promise<Product[]> => {
    const res = await axiosInstance.get<Product[]>('/products');
    return res.data;
  },
};
```

### Pattern 3: Store Action

```typescript
// ✅ CORRECT
import { productApi } from '@/api/warehouse.api';
import { getErrorMessage } from '@/store/store.helpers';
import { toast } from 'sonner';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await productApi.getProducts();
      set({ products, isLoading: false });
    } catch (error) {
      const msg = getErrorMessage(error, 'Lỗi tải danh sách');
      toast.error(msg);
      set({ error: msg, isLoading: false });
    }
  },
}));
```

---

## Type Naming Conventions

| Type | Example | Usage |
|------|---------|-------|
| Entity | `Product`, `User` | Response from API |
| Create DTO | `CreateProductDto` | Form input for creation |
| Update DTO | `UpdateProductDto` | Form input for update |
| Request | `LoginRequest` | API request payload |
| Response | `LoginResponse` | API response payload |
| Enum | `OrderStatus`, `Role` | Fixed values |
| Interface | `PaginatedResponse<T>` | Data containers |

---

## Store Helpers

### `getErrorMessage(error, defaultMsg)`
Extract readable error from Axios response.

```typescript
catch (error) {
  const msg = getErrorMessage(error, 'Lỗi không xác định');
  toast.error(msg);
  set({ error: msg });
}
```

### `loadingState(key, value)`
Set loading state property.

```typescript
set({ ...loadingState('isLoading', true) });
// Equivalent: set({ isLoading: true })
```

### `mergeFiltersWithPageReset(current, incoming)`
Merge filters and reset page to 1.

```typescript
setFilters: (newFilters) => {
  set((state) => ({
    filters: mergeFiltersWithPageReset(state.filters, newFilters),
  }));
},
```

---

## API Interceptor Details

### Request Interceptor
1. Adds `Authorization: Bearer {accessToken}` if token exists
2. Handles FormData (removes Content-Type header)

### Response Interceptor
1. Unwraps envelope: `{ success, data }` → `data`
2. On 401: 
   - Queues failed request
   - Calls `/auth/refresh`
   - Retries with new token
   - Resumes queued requests
3. On other errors: Pass to catch block

---

## File Naming & Organization

| File Type | Location | Naming | Example |
|-----------|----------|--------|---------|
| API | `/src/api/` | `{domain}.api.ts` | `product.api.ts` |
| Store | `/src/store/` | `{domain}.store.ts` | `product.store.ts` |
| Type | `/src/types/` | `{domain}.type.ts` | `product.type.ts` |
| Page | `/src/pages/{domain}/` | `{Entity}Page.tsx` | `ProductManagementPage.tsx` |
| Component | `/src/components/` | `{Entity}{Purpose}.tsx` | `ProductForm.tsx` |
| Hook | `/src/hooks/` | `use{Entity}.ts` | `useProductTable.ts` |

---

## Checklist for New Features

- [ ] Create types in `/src/types/{domain}.type.ts`
- [ ] Create API functions in `/src/api/{domain}.api.ts`
- [ ] Create Store in `/src/store/{domain}.store.ts`
- [ ] Create Page/Component in `/src/pages/{domain}/`
- [ ] Use types from `/src/types` in all files
- [ ] All API calls wrapped in try-catch with getErrorMessage()
- [ ] All Store actions handle loading/error states
- [ ] Components only import from Store, not API
- [ ] useEffect with dependency array when calling Store actions

---

## Anti-Patterns ❌

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `import authApi from '@/api/auth.api'` in Component | `const { login } = useAuthStore()` |
| `axiosInstance.get()` in Component | Store action → `productApi.getProducts()` |
| Error handling in Component | Error handling in Store |
| Toast in Component's catch | Toast in Store's catch |
| `e.response?.data?.message` parsing | Use `getErrorMessage(error)` |
| `set({ isLoading: true, error: null })` | Use `loadingState('isLoading', true)` |
| Multiple loading flags confused | Clear naming: `isLoading`, `isLoadingDetail`, `isLoadingReport` |

---

## Development Workflow

1. **Define Types** → `/src/types/{domain}.type.ts`
2. **Create API Functions** → `/src/api/{domain}.api.ts`
3. **Create Store** → `/src/store/{domain}.store.ts`
4. **Create Component** → `/src/pages/{domain}/{Component}.tsx`
5. **Test Flow** → Call Store hook → See action execute → Verify loading/error

---

## Debugging Tips

### Problem: Component shows old data
**Solution:** Check if useEffect has proper dependency array

```typescript
// ❌ WRONG - runs every render
useEffect(() => { fetchData(); }, []);

// ✅ CORRECT
useEffect(() => { fetchData(); }, [fetchData]);
// or if fetchData changes frequently:
useEffect(() => { fetchData(); }, []);
// with proper memoization in Store
```

### Problem: API call bypasses interceptors
**Solution:** Ensure using axiosInstance, not axios

```typescript
// ❌ WRONG
import axios from 'axios';
const res = await axios.get('/api/data');

// ✅ CORRECT
import { axiosInstance } from './axios';
const res = await axiosInstance.get('/api/data');
```

### Problem: Error message shows "Lỗi không xác định"
**Solution:** Check API response format or add console.log in getErrorMessage()

```typescript
// Ensure API returns message as string or array
{ message: "Specific error" }  // ✅
{ message: ["Error 1", "Error 2"] }  // ✅
```

---

## Summary

**Remember the layers:**
- 🔵 **Types** - Define contract
- 🟢 **API** - Make HTTP call
- 🟡 **Store** - Manage state
- 🔴 **Component** - Render UI

**Data flows DOWN, never back UP!**
