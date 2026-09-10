// JWT Configuration Constants
export const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;

// JWT Payload Interface
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}
