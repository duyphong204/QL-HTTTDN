import { axiosInstance } from './axios';

export const apiGet = async <T>(url: string, params?: object): Promise<T> => {
  const res = await axiosInstance.get<T>(url, { params });
  return res.data;
};

export const apiPost = async <T>(url: string, data?: unknown): Promise<T> => {
  const res = await axiosInstance.post<T>(url, data);
  return res.data;
};

export const apiPatch = async <T>(url: string, data?: unknown): Promise<T> => {
  const res = await axiosInstance.patch<T>(url, data);
  return res.data;
};

export const apiDelete = async <T = void>(url: string): Promise<T> => {
  const res = await axiosInstance.delete<T>(url);
  return res.data;
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
