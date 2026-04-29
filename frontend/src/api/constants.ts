export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL ??
    "http://localhost:3000",
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT ?? 30000),
};
