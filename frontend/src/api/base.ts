import { axiosInstance } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
  timestamp?: string;
}

type CachedGetEntry = {
  expiresAt: number;
  data: unknown;
};

const GET_CACHE_TTL_MS = 30_000;
const getResponseCache = new Map<string, CachedGetEntry>();
const inFlightGetRequests = new Map<string, Promise<unknown>>();

const invalidateGetCache = (): void => {
  getResponseCache.clear();
  inFlightGetRequests.clear();
};

const buildGetCacheKey = (url: string, params?: object): string => {
  if (!params) {
    return url;
  }

  const normalizedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  return `${url}?${JSON.stringify(normalizedParams)}`;
};

// Unwrap response data from TransformInterceptor wrapper
const unwrapResponse = <T>(response: any): T => {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    "success" in response
  ) {
    // Preserve paginated shape expected by frontend stores: { data, meta }
    if (response.meta !== undefined) {
      return {
        data: response.data,
        meta: response.meta,
      } as T;
    }

    return response.data as T;
  }
  return response as T;
};

export const apiGet = async <T>(url: string, params?: object): Promise<T> => {
  const cacheKey = buildGetCacheKey(url, params);
  const now = Date.now();

  const cachedEntry = getResponseCache.get(cacheKey);
  if (cachedEntry && cachedEntry.expiresAt > now) {
    return cachedEntry.data as T;
  }

  const inFlightRequest = inFlightGetRequests.get(cacheKey);
  if (inFlightRequest) {
    return inFlightRequest as Promise<T>;
  }

  const requestPromise = axiosInstance
    .get<ApiResponse<T>>(url, { params })
    .then((res) => {
      const unwrapped = unwrapResponse<T>(res.data);
      getResponseCache.set(cacheKey, {
        data: unwrapped,
        expiresAt: now + GET_CACHE_TTL_MS,
      });
      return unwrapped;
    })
    .finally(() => {
      inFlightGetRequests.delete(cacheKey);
    });

  inFlightGetRequests.set(cacheKey, requestPromise as Promise<unknown>);
  return requestPromise;
};

export const apiPost = async <T>(url: string, data?: unknown): Promise<T> => {
  const res = await axiosInstance.post<ApiResponse<T>>(url, data);
  invalidateGetCache();
  return unwrapResponse<T>(res.data);
};

export const apiPatch = async <T>(url: string, data?: unknown): Promise<T> => {
  const res = await axiosInstance.patch<ApiResponse<T>>(url, data);
  invalidateGetCache();
  return unwrapResponse<T>(res.data);
};

export const apiDelete = async <T = void>(url: string): Promise<T> => {
  const res = await axiosInstance.delete<ApiResponse<T>>(url);
  invalidateGetCache();
  return unwrapResponse<T>(res.data);
};

export const toFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }
    formData.append(key, String(value));
  });

  return formData;
};
