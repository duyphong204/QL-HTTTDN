import { axiosInstance } from './axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
  timestamp?: string;
}

// Unwrap response data from TransformInterceptor wrapper
const unwrapResponse = <T>(response: any): T => {
  if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
    return response.data as T;
  }
  return response as T;
};

export const apiGet = async <T>(url: string, params?: object): Promise<T> => {
  const res = await axiosInstance.get<ApiResponse<T>>(url, { params });
  return unwrapResponse<T>(res.data);
};

export const apiPost = async <T>(url: string, data?: unknown): Promise<T> => {
  const res = await axiosInstance.post<ApiResponse<T>>(url, data);
  return unwrapResponse<T>(res.data);
};

export const apiPatch = async <T>(url: string, data?: unknown): Promise<T> => {
  const res = await axiosInstance.patch<ApiResponse<T>>(url, data);
  return unwrapResponse<T>(res.data);
};

export const apiDelete = async <T = void>(url: string): Promise<T> => {
  const res = await axiosInstance.delete<ApiResponse<T>>(url);
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
