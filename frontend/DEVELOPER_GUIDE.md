# Frontend Architecture - Developer Onboarding Guide

## Welcome! 👋

This guide will help you understand and work with the frontend architecture. Read this first before making changes.

---

## 5-Minute Architecture Overview

Our frontend uses a **4-layer clean architecture** that separates concerns:

```
┌──────────────────────────────┐
│   Components/Pages (.tsx)    │  <- What users see
│   (Render UI with Store data)│
└──────────────┬───────────────┘
               │ (calls via hooks)
┌──────────────▼───────────────┐
│   Store Layer (Zustand)      │  <- How data is managed
│   (State + Side Effects)     │
└──────────────┬───────────────┘
               │ (calls API functions)
┌──────────────▼───────────────┐
│   API Layer (Axios)          │  <- How we fetch data
│   (HTTP calls only)          │
└──────────────┬───────────────┘
               │ (uses types from)
┌──────────────▼───────────────┐
│   Types Layer (TypeScript)   │  <- Data contracts
│   (Interfaces & Types)       │
└──────────────────────────────┘
```

**Golden Rule:** Data flows DOWN. Code at each layer only depends on layers below it.

---

## Layer 1: Types (`/src/types/`)

### What goes here?
TypeScript interfaces for:
- API request/response payloads
- Form inputs (DTOs)
- Enums and constants

### Examples
```typescript
// /src/types/product.type.ts (in warehouse.type.ts)

// Response from API
export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
}

// Input for creating product
export interface CreateProductDto {
  name: string;
  price: number;
  categoryId: string;
}

// Input for updating product
export interface UpdateProductDto {
  name?: string;
  price?: number;
}
```

### Rules
1. Always define types for API responses
2. Use `Dto` suffix for form inputs
3. Import in `/src/types/index.ts` for barrel export (optional but recommended)

---

## Layer 2: API (`/src/api/`)

### What goes here?
Pure HTTP functions that:
- Make requests via `axiosInstance`
- Type all inputs/outputs
- Return data or throw errors

### Structure
```typescript
// /src/api/product.api.ts
import { axiosInstance } from './axios';
import type { Product, CreateProductDto } from '@/types/warehouse.type';

export const productApi = {
  // Fetch list
  getProducts: async (): Promise<Product[]> => {
    const res = await axiosInstance.get<Product[]>('/products');
    return res.data;
  },

  // Fetch one
  getProductById: async (id: string): Promise<Product> => {
    const res = await axiosInstance.get<Product>(`/products/${id}`);
    return res.data;
  },

  // Create
  createProduct: async (data: CreateProductDto): Promise<Product> => {
    const res = await axiosInstance.post<Product>('/products', data);
    return res.data;
  },

  // Update
  updateProduct: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const res = await axiosInstance.patch<Product>(`/products/${id}`, data);
    return res.data;
  },

  // Delete
  deleteProduct: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },
};
```

### Important Notes
- ✅ Use `axiosInstance` (has token + error handling)
- ✅ Type responses with generics: `axiosInstance.get<Product[]>(...)`
- ✅ Return `res.data` (interceptor unwraps envelope)
- ❌ Don't handle errors (let Store handle)
- ❌ Don't show toasts
- ❌ Don't manage state

### FormData Example (File Upload)
```typescript
export const productApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Axios interceptor removes Content-Type for FormData
    const res = await axiosInstance.post<{ url: string }>(
      '/upload', 
      formData
    );
    return res.data.url;
  },
};
```

---

## Layer 3: Store (`/src/store/`)

### What goes here?
Zustand stores that:
- Call API functions
- Manage UI state (loading, error)
- Handle side effects (toasts)
- Cache data

### Structure
```typescript
// /src/store/product.store.ts
import { create } from 'zustand';
import { productApi } from '@/api/warehouse.api';
import { getErrorMessage } from '@/store/store.helpers';
import { toast } from 'sonner';
import type { Product, CreateProductDto } from '@/types/warehouse.type';

// Define state shape
interface ProductState {
  // Data
  products: Product[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductDto) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

// Create store
export const useProductStore = create<ProductState>((set) => ({
  // Initial state
  products: [],
  isLoading: false,
  error: null,

  // Fetch action
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

  // Create action
  createProduct: async (data) => {
    try {
      const product = await productApi.createProduct(data);
      set((state) => ({
        products: [product, ...state.products],
      }));
      toast.success('Tạo sản phẩm thành công');
    } catch (error) {
      const msg = getErrorMessage(error, 'Lỗi tạo sản phẩm');
      toast.error(msg);
      throw error; // Let component handle if needed
    }
  },

  // Delete action
  deleteProduct: async (id) => {
    try {
      await productApi.deleteProduct(id);
      set((state) => ({
        products: state.products.filter(p => p.id !== id),
      }));
      toast.success('Xóa sản phẩm thành công');
    } catch (error) {
      const msg = getErrorMessage(error, 'Lỗi xóa sản phẩm');
      toast.error(msg);
    }
  },
}));
```

### Key Patterns

#### Loading State
```typescript
// Before API call
set({ isLoading: true, error: null });

// After API call (success or error)
set({ isLoading: false });
```

#### Error Handling
```typescript
try {
  const data = await api.fetch();
  set({ data });
} catch (error) {
  // Always use getErrorMessage() to extract message
  const msg = getErrorMessage(error, 'Default message');
  toast.error(msg);
  set({ error: msg });
}
```

#### Updating Collections
```typescript
// Add to list
set((state) => ({
  items: [newItem, ...state.items],
}));

// Update in list
set((state) => ({
  items: state.items.map(item =>
    item.id === id ? updatedItem : item
  ),
}));

// Remove from list
set((state) => ({
  items: state.items.filter(item => item.id !== id),
}));
```

### Helpers in `store.helpers.ts`

#### `getErrorMessage(error, defaultMsg)`
```typescript
const msg = getErrorMessage(error, 'Lỗi không xác định');
```
Extracts readable message from:
- Axios error responses
- Nested message fields
- Error objects

#### `mergeFiltersWithPageReset(currentFilters, newFilters)`
```typescript
setFilters: (newFilters) => {
  set((state) => ({
    filters: mergeFiltersWithPageReset(state.filters, newFilters),
  }));
},
```
Merges filters and resets page to 1 (for search/sort)

#### `loadingState(key, value)`
```typescript
set({ ...loadingState('isLoading', true) });
// Same as: set({ isLoading: true })
```

---

## Layer 4: Components/Pages (`/src/pages/`, `/src/components/`)

### What goes here?
React components that:
- Use Store hooks to get data and actions
- Call Store actions in useEffect and event handlers
- Render UI

### Structure
```typescript
// /src/pages/warehouse/ProductManagement.tsx
import { useEffect, useState } from 'react';
import { useProductStore } from '@/store/product.store';
import type { CreateProductDto } from '@/types/warehouse.type';

export default function ProductManagement() {
  // Get state and actions from Store
  const {
    products,
    isLoading,
    fetchProducts,
    createProduct,
    deleteProduct,
  } = useProductStore();

  const [modalOpen, setModalOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle create
  const handleCreate = async (data: CreateProductDto) => {
    await createProduct(data);
    setModalOpen(false);
    // Toast already shown by Store
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Sure?')) {
      await deleteProduct(id);
      // Toast already shown by Store
    }
  };

  // Render
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>+ Create</button>
      
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <button onClick={() => handleDelete(product.id)}>Delete</button>
        </div>
      ))}
      
      {modalOpen && (
        <Modal onSubmit={handleCreate} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
```

### Rules for Components
1. ✅ **Only** import Store (`useProductStore`)
2. ✅ Get data and actions from Store hooks
3. ✅ Call Store actions in useEffect or handlers
4. ✅ Store handles loading/error/toasts
5. ❌ Never import API functions
6. ❌ Never call axiosInstance directly
7. ❌ Never show toasts in component

### useEffect Tips
```typescript
// Load data when component mounts
useEffect(() => {
  fetchData();
}, [fetchData]);

// Refetch when filters change
useEffect(() => {
  fetchData();
}, [filters, fetchData]);

// Depend on the function from Store
// Store memoizes actions internally
```

---

## Step-by-Step: Adding a Feature

### Step 1: Define Types
```typescript
// /src/types/category.type.ts
export interface Category {
  id: string;
  name: string;
}

export interface CreateCategoryDto {
  name: string;
}
```

### Step 2: Create API Functions
```typescript
// /src/api/warehouse.api.ts (add to existing)
export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosInstance.get<Category[]>('/categories');
    return res.data;
  },
  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const res = await axiosInstance.post<Category>('/categories', data);
    return res.data;
  },
};
```

### Step 3: Create Store
```typescript
// /src/store/category.store.ts
import { create } from 'zustand';
import { categoryApi } from '@/api/warehouse.api';
import type { Category, CreateCategoryDto } from '@/types/warehouse.type';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryDto) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const categories = await categoryApi.getCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      const msg = getErrorMessage(error, 'Lỗi tải danh mục');
      toast.error(msg);
      set({ isLoading: false });
    }
  },

  createCategory: async (data) => {
    try {
      const category = await categoryApi.createCategory(data);
      set((state) => ({
        categories: [...state.categories, category],
      }));
      toast.success('Tạo danh mục thành công');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi tạo danh mục'));
    }
  },
}));
```

### Step 4: Create Component
```typescript
// /src/pages/warehouse/CategoryManagement.tsx
import { useEffect } from 'react';
import { useCategoryStore } from '@/store/category.store';

export default function CategoryManagement() {
  const { categories, isLoading, fetchCategories, createCategory } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Categories</h1>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Common Questions

### Q: Where should I handle pagination?
**A:** In Store state. Example:
```typescript
interface ProductState {
  filters: { page: number; limit: number; search: string };
  setFilters: (f: Partial<ProductState['filters']>) => void;
  fetchProducts: () => Promise<void>;
}

const useProductStore = create<ProductState>((set, get) => ({
  filters: { page: 1, limit: 10, search: '' },
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: mergeFiltersWithPageReset(state.filters, newFilters),
    }));
  },
  
  fetchProducts: async () => {
    const { filters } = get();
    const result = await productApi.getProducts(filters);
    set({ products: result.data });
  },
}));
```

### Q: Should API functions validate input?
**A:** No, validation happens in components before calling Store actions.

### Q: What if API returns error?
**A:** Handled in Store's catch block. Extract message with `getErrorMessage()` and show toast.

### Q: Can component directly access Store action?
**A:** Yes, via hook. Never call Store function directly.
```typescript
// ✅ Correct
const { fetchData } = useStore();
useEffect(() => { fetchData(); }, [fetchData]);

// ❌ Wrong
useStore.getState().fetchData(); // Don't do this in component
```

### Q: Where to put UI state (modal open, tabs, etc.)?
**A:** In component using `useState`. Only shared data goes in Store.

### Q: How to handle network errors?
**A:** Store extracts message and shows toast. Component receives via loading/error state.

---

## Files to Read Next

1. **FRONTEND_ARCHITECTURE.md** - Complete architecture deep dive
2. **STYLE_GUIDE.md** - Code examples and anti-patterns
3. **Existing Store Files** - See real examples in `/src/store/`
4. **Existing API Files** - See real examples in `/src/api/`

---

## Quick Checklist for Code Review

- [ ] Component imports from Store only
- [ ] API functions don't have try-catch
- [ ] Store has error handling and toast in catch
- [ ] Types defined in `/src/types/`
- [ ] All API calls typed with generics
- [ ] useEffect has proper dependency array
- [ ] Loading/error states managed in Store
- [ ] No side effects in API layer
- [ ] No API calls in Components

---

## Git Commit Message Examples

```
feat: add product search filter
- Create searchProducts store action
- Add search input to ProductManagement
- SearchFilter type in common.type.ts

fix: handle 401 token refresh
- Update axios response interceptor
- Queue requests during refresh

test: add ProductStore tests

docs: update FRONTEND_ARCHITECTURE.md
```

---

**Questions?** Check `FRONTEND_ARCHITECTURE.md` or ask on team chat!

Happy coding! 🚀
