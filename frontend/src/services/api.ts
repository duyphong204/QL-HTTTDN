import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_CONFIG, STORAGE_KEYS } from "./constants";

// Create axios instance with default config
export const axiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true, // CRITICAL: Send cookies automatically
    headers: {
        "Content-Type": "application/json",
    },
});

// In-memory token storage (more secure than localStorage for access token)
let accessToken: string | null = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

/**
 * Update access token in memory and localStorage
 */
export const setAccessToken = (token: string | null): void => {
    accessToken = token;
    if (token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
};

/**
 * Clear all tokens and redirect to login
 */
const clearTokensAndRedirect = (): void => {
    setAccessToken(null);
    // No need to clear refresh token - it's in httpOnly cookie
    window.location.href = "/login";
};

// Request interceptor - Attach access token to requests
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Token refresh state management
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * Refresh access token using httpOnly cookie
 */
const refreshAccessToken = async (): Promise<string> => {
    try {
        // No need to send refresh token - it's automatically sent via cookie
        const { data } = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            {}, // Empty body
            { withCredentials: true } // Send cookies
        );

        // Update access token (refresh token is updated in cookie by backend)
        setAccessToken(data.accessToken);

        return data.accessToken;
    } catch (error) {
        // Refresh failed, clear everything
        clearTokensAndRedirect();
        throw error;
    }
};

// Response interceptor - Handle 401 errors and auto-refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only handle 401 errors for non-refresh endpoints
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/login")
        ) {
            originalRequest._retry = true;

            // If not already refreshing, start refresh process
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshAccessToken().finally(() => {
                    isRefreshing = false;
                    refreshPromise = null;
                });
            }

            try {
                // Wait for refresh to complete
                const newToken = await refreshPromise;

                // Retry original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                clearTokensAndRedirect();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
