
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_CONFIG } from "@/constants";
import type { ApiEnvelope, ApiErrorResponse } from "@/types/common.type";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
    accessToken = token;
};

export const getAccessToken = (): string | null => {
    return accessToken;
};
export const axiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData && config.headers) {
      // Let browser attach multipart boundary automatically.
      delete config.headers["Content-Type"];
    }

        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

interface FailedQueueItem {
    resolve: (value: string | null) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];   
};

axiosInstance.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiEnvelope<unknown> | unknown;

    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      const envelope = payload as ApiEnvelope<unknown>;

      // Keep pagination meta for list endpoints while still unwrapping normal payloads.
      response.data = typeof envelope.meta !== 'undefined'
        ? { data: envelope.data, meta: envelope.meta }
        : envelope.data;
    }

    return response;
  },
  async (error: AxiosError) => {

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const refreshPayload = refreshResponse.data as
          | ApiEnvelope<{ accessToken: string }>
          | { accessToken?: string };

        const newToken = 'data' in refreshPayload
          ? refreshPayload.data.accessToken
          : refreshPayload.accessToken;

        if (!newToken) {
          throw new Error('Không thể làm mới token');
        }
        setAccessToken(newToken);

        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const apiError = error.response?.data as ApiErrorResponse;
    if (apiError?.message) {
      const message = Array.isArray(apiError.message)
        ? apiError.message.join(', ')
        : typeof apiError.message === 'string'
          ? apiError.message
          : apiError.error || 'Lỗi không xác định';
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  }
);