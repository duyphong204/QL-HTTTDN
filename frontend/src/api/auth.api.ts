import { apiGet, apiPost, apiDelete } from "./base";
import { endpoints } from "./endpoints";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth.type";
import type { User } from "@/types/user.type";

export const authApi = {
  login: async (data: LoginRequest) =>
    apiPost<LoginResponse>(endpoints.auth.login, data),
  register: async (data: RegisterRequest) =>
    apiPost<RegisterResponse>(endpoints.auth.register, data),
  refresh: async () =>
    apiPost<{ accessToken: string }>(endpoints.auth.refresh, {}),
  getProfile: async () => apiGet<User>(endpoints.auth.profile),
  logout: async () => apiDelete(endpoints.auth.logout),
};
