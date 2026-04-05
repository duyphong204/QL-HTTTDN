export const API_CONFIG = {
    BASE_URL: (import.meta.env.VITE_API_URL || 'http://localhost:3000'),
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
} as const;

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
} as const;
