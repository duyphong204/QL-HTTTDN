import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { endpoints } from "@/api/endpoints";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
interface FailedQueueItem {
  resolve: (value: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    const payload = response.data as any;
    // Chỉ unwrap nếu dữ liệu đúng cấu trúc Envelope và chưa bị unwrap trước đó
    if (payload && payload.success && "data" in payload) {
      return {
        ...response,
        data: payload.meta
          ? { data: payload.data, meta: payload.meta }
          : payload.data,
      };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Tránh lặp vô hạn tại các trang login/refresh
      if (
        originalRequest.url?.includes(endpoints.auth.refresh) ||
        originalRequest.url?.includes(endpoints.auth.login)
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Sửa lỗi baseURL ở đây
        const refreshResponse = await axios.post(
          `${BASE_URL}${endpoints.auth.refresh}`,
          {},
          { withCredentials: true },
        );

        const data = refreshResponse.data;
        const newToken = data?.data?.accessToken || data?.accessToken;

        if (!newToken) throw new Error("No token received");

        setAccessToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        // window.location.href = "/login"; // Cân nhắc dùng navigate của router thay vì reload trang
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
