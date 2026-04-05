# Frontend Architecture - Troubleshooting & FAQ

## Common Issues & Solutions

### Issue 1: Component shows old/stale data

**Symptom:** Data doesn't update after API call

**Check 1: useEffect dependency array**
```typescript
// ❌ WRONG - only runs once
useEffect(() => {
  fetchData();
}, []); // Missing dependency

// ✅ CORRECT - runs when fetchData changes
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ ALSO CORRECT - re-fetch when ID changes
useEffect(() => {
  if (id) fetchData(id);
}, [id, fetchData]);
```

**Check 2: Store not updating state**
```typescript
fetchData: async () => {
  // ❌ WRONG - forgot to set state
  const data = await api.getData();
  
  // ✅ CORRECT
  const data = await api.getData();
  set({ data, isLoading: false });
}
```

**Check 3: Hook dependency**
```typescript
// ✅ CORRECT - hook includes fetchData
const { data, fetchData } = useStore();
useEffect(() => {
  fetchData(); // Now has correct dependency
}, [fetchData]);

// ❌ WRONG - using hardcoded value
useEffect(() => {
  store.fetchData(); // Missing dependency
}, []);
```

---

### Issue 2: "Cannot find module" error

**Symptom:** `Cannot find module '@/api/...'` or similar

**Solutions:**

1. **Check import path**
   ```typescript
   // ❌ WRONG
   import { authApi } from './api/auth.api';
   import { authApi } from '../api/auth.api';
   
   // ✅ CORRECT - use @ alias
   import { authApi } from '@/api/auth.api';
   ```

2. **Check file name**
   ```typescript
   // Files are named with .api.ts or .store.ts
   // ❌ authAPI.ts (wrong case)
   // ✅ auth.api.ts
   ```

3. **Check if function is exported**
   ```typescript
   // In auth.api.ts
   // ❌ WRONG
   const authApi = { ... };
   
   // ✅ CORRECT
   export const authApi = { ... };
   ```

4. **Check barrel exports**
   ```typescript
   // /src/api/index.ts
   export * from './auth.api';
   export * from './user.api';
   
   // Then you can import as
   import { authApi } from '@/api';
   ```

---

### Issue 3: "Unhandled Promise rejection"

**Symptom:** Error showing in console but not handled

**Solution: Add try-catch in Store action**
```typescript
// ❌ WRONG - Promise rejects
fetchData: async () => {
  const data = await api.getData(); // If this fails...
  set({ data }); // This code doesn't run
}

// ✅ CORRECT - catch error
fetchData: async () => {
  try {
    const data = await api.getData();
    set({ data });
  } catch (error) {
    const msg = getErrorMessage(error);
    toast.error(msg); // Now error is handled
    set({ error: msg });
  }
}
```

**In Component:**
```typescript
const handleCreate = async () => {
  try {
    await createData(formData); // Store already handles errors
  } catch (error) {
    // Store shows toast, but we can still catch if needed
  }
};
```

---

### Issue 4: "TypeError: Cannot read property 'data' of undefined"

**Symptom:** Response data is undefined

**Check 1: Ensure axiosInstance is used**
```typescript
// ❌ WRONG - axios instead of axiosInstance
import axios from 'axios';
const res = await axios.get('/data'); // No interceptor!

// ✅ CORRECT
import { axiosInstance } from './axios';
const res = await axiosInstance.get('/data'); // Has interceptor
```

**Check 2: API returns data properly**
```typescript
// ✅ CORRECT - extracts data from res.data
export const authApi = {
  login: async (data) => {
    const res = await axiosInstance.post('/auth/login', data);
    return res.data; // This should be { user, accessToken }
  }
}
```

**Check 3: Type mismatch**
```typescript
// ❌ WRONG - expects array but gets object
const res = await axiosInstance.get<User[]>('/auth/profile');
// API returns user object, not array!

// ✅ CORRECT - type matches API
const res = await axiosInstance.get<User>('/auth/profile');
```

---

### Issue 5: Loading state never changes to false

**Symptom:** Component stuck on "Loading..."

**Check 1: set({ isLoading: false }) is called**
```typescript
// ❌ WRONG - isLoading never set to false
fetchData: async () => {
  set({ isLoading: true });
  try {
    const data = await api.getData();
    set({ data }); // Forgot isLoading: false
  } catch (error) {
    set({ error: getErrorMessage(error) });
    // Forgot isLoading: false
  }
}

// ✅ CORRECT - set isLoading in finally
fetchData: async () => {
  set({ isLoading: true });
  try {
    const data = await api.getData();
    set({ data });
  } catch (error) {
    const msg = getErrorMessage(error);
    set({ error: msg });
  } finally {
    set({ isLoading: false }); // Always runs
  }
}
```

**Check 2: async function returns and waits**
```typescript
const handleCreate = async () => {
  // ✅ CORRECT - wait for async
  await createData(formData);
  // Component will see isLoading change
};

// ❌ WRONG - don't await
const handleCreate = () => {
  createData(formData); // Missing await!
  // Component renders before loading finishes
};
```

---

### Issue 6: Form data not being submitted as FormData

**Symptom:** File upload fails, API receives wrong format

**Solution: Create FormData in API function**
```typescript
// In Store - pass plain object
createProduct: async (data: CreateProductDto) => {
  try {
    const product = await productApi.createProduct(data);
    set({ products: [...state.products, product] });
  } catch (error) { ... }
}

// In API - convert to FormData
createProduct: async (data: CreateProductDto) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', String(data.price));
  
  if (data.image instanceof File) {
    formData.append('image', data.image);
  }
  
  // Don't set Content-Type header - let browser do it
  const res = await axiosInstance.post<Product>('/products', formData);
  return res.data;
}

// Interceptor will remove Content-Type automatically
```

---

### Issue 7: Token not being sent with requests

**Symptom:** API returns 401 Unauthorized

**Check: Token is set after login**
```typescript
// In auth.api.ts
login: async (data: LoginRequest) => {
  const res = await axiosInstance.post('/auth/login', data);
  // Need to called setAccessToken() somewhere!
  return res.data;
}

// In auth.store.ts
login: async (data: LoginRequest) => {
  try {
    const res = await authApi.login(data);
    // ✅ CORRECT - set token in Store
    setAccessToken(res.accessToken);
    set({ user: res.user, isAuthenticated: true });
  } catch (error) { ... }
}

// Now AuthService has token for all future requests
```

**Check: setAccessToken is imported**
```typescript
// ❌ WRONG
import { authApi } from '@/api/auth.api';

// ✅ CORRECT
import { authApi } from '@/api/auth.api';
import { setAccessToken } from '@/api/axios'; // Don't forget!
```

---

### Issue 8: Error message shows "Lỗi không xác định"

**Symptom:** Generic error instead of specific message

**Check 1: API returns proper error format**
```typescript
// Backend should return one of these:
{ message: "User not found" }        // ✅ Works
{ message: ["Error 1", "Error 2"] }  // ✅ Works (array)
{ error: "Not found" }               // ✅ Works

// ❌ Returns nothing useful
{ success: false }
{}
```

**Check 2: getErrorMessage handles it**
```typescript
// In store.helpers.ts, getErrorMessage checks:
// 1. error.response?.data?.message (string or array)
// 2. error.response?.data?.error
// 3. error.message
// 4. Returns fallback if nothing found

// Test it:
const msg = getErrorMessage(error, 'Custom fallback message');
console.log(msg); // Should show actual message
```

**Check 3: Pass proper fallback**
```typescript
// ❌ WRONG - fallback too generic
const msg = getErrorMessage(error, 'Lỗi');

// ✅ CORRECT - specific fallback
const msg = getErrorMessage(error, 'Lỗi tạo sản phẩm');
```

---

### Issue 9: "Cannot use Hook... outside of function component"

**Symptom:** Using Store hook outside of React component

**Check: Call hooks only in function components**
```typescript
// ❌ WRONG - called at top level of module
const { data } = useStore();
const SomeComponent = () => <div>{data}</div>;

// ❌ WRONG - called in non-component function
const fetcherFn = () => {
  const { data } = useStore(); // Hook not in component!
};

// ✅ CORRECT - hook in component
const SomeComponent = () => {
  const { data } = useStore();
  return <div>{data}</div>;
};

// ✅ CORRECT - hook in custom hook
const useData = () => {
  const { data } = useStore();
  useEffect(() => { ... }, []);
  return data;
};
```

---

### Issue 10: Filters not working (search, sort, etc.)

**Symptom:** Changing search doesn't update list

**Check 1: setFilters calls fetchData**
```typescript
// ❌ WRONG - renders with old data
setFilters: (newFilters) => {
  set({ filters: newFilters });
  // Forgot to fetch!
}

// ✅ CORRECT - fetch with new filters
setFilters: (newFilters) => {
  set((state) => ({
    filters: mergeFiltersWithPageReset(state.filters, newFilters),
  }));
}
// Then useEffect watches filters and calls fetchData
```

**Check 2: useEffect watches filters**
```typescript
// In Component
const { filters, fetchData } = useStore();

useEffect(() => {
  fetchData();
}, [filters, fetchData]); // Must depend on filters!
```

**Check 3: Store passes filters to API**
```typescript
// In Store
fetchData: async () => {
  const { filters } = get();
  // Pass filters to API
  const result = await api.getData(filters);
  set({ data: result.data });
}
```

---

## Performance Issues

### Issue: Component re-renders too often

**Solution: Check Store dependencies**
```typescript
// ✅ CORRECT - component only re-renders when needed
const { data, isLoading, fetchData } = useStore();

useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData is stable reference (Zustand memoizes)

// Data/isLoading changes trigger re-render
// fetchData doesn't change (stable)
```

---

## Network Issues

### Issue: Request timeout

**Check API_CONFIG timeout**
```typescript
// /src/api/constants.ts
export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_URL,
  TIMEOUT: 30000, // 30 seconds
}

// 30s usually works, increase if needed for slow API
TIMEOUT: 60000, // 60 seconds
```

---

## TypeScript Issues

### Issue: "Type 'unknown' is not assignable to type 'X'"

**Solution: Properly type error in catch**
```typescript
// ❌ WRONG
catch (error) {
  const msg = getErrorMessage(error); // error is unknown
}

// ✅ CORRECT
catch (error: unknown) {
  const msg = getErrorMessage(error);
}
```

---

## Checklist for Debugging

Before asking for help, check:

- [ ] `useEffect` has correct dependencies
- [ ] `set({ isLoading: false })` is called
- [ ] Component uses `await` when calling async action
- [ ] API uses `axiosInstance`, not `axios`
- [ ] Token is set after login (check `setAccessToken()`)
- [ ] `getErrorMessage()` used in all catches
- [ ] Component imports from Store, not API
- [ ] Types match API response format
- [ ] Filters are properly passed to API
- [ ] `finally` block sets `isLoading: false`

---

## Still Stuck?

1. **Check the examples**
   - `/src/store/auth.store.ts` - Auth pattern
   - `/src/store/user.store.ts` - List with pagination
   - `/src/pages/admin/UserManagement.tsx` - Component pattern

2. **Read the docs**
   - `FRONTEND_ARCHITECTURE.md` - Deep dive
   - `DEVELOPER_GUIDE.md` - Step-by-step guide
   - `STYLE_GUIDE.md` - Code patterns

3. **Debug step by step**
   - Add `console.log` in API function
   - Add `console.log` in Store action
   - Check Network tab in DevTools
   - Check Redux DevTools for Store state

---

**Remember:** If something is unclear, check the pattern in an existing, working Store file!
