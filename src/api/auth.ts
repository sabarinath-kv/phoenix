import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  email: string;
  full_name: string;
  phone: string;
  is_active: boolean;
  metadata: Record<string, any>;
  id: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: User;
}

// Create axios instance with base configuration
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await authApi.post<SignupResponse>(
        API_ENDPOINTS.AUTH_SIGNUP,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Signup failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await authApi.post<LoginResponse>(
        API_ENDPOINTS.AUTH_LOGIN,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Login failed");
      }
      throw new Error("Network error occurred");
    }
  },
};
