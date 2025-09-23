import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import axios, { apiHelpers } from "./axios";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

export type LivekitTokenResponse = {
  url: string;
  access_token: string;
};

export type GameSessionResponse = {
  id: number;
  user_id: number;
  game_id: number;
  started_at: string;
  ended_at: string;
  points: number;
  duration_seconds: number;
  success: boolean;
  raw_data: {
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
};

export type CreateGameSessionRequest = {
  user_id: number;
  game_id: number;
  started_at: string;
  success: boolean;
  points: number;
  duration_seconds: number;
  raw_data: {
    [key: string]: any;
  };
};

export interface UpdateUserRequest {
  password_hash?: string;
  full_name?: string;
  phone?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
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

export const createRoomAndToken = async (
  token: string
): Promise<LivekitTokenResponse> => {
  try {
    const response = await apiHelpers.post<LivekitTokenResponse>(
      API_ENDPOINTS.LIVEKIT_TOKEN,
      null,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as LivekitTokenResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
    throw new Error("Network error occurred");
  }
};

export const createGameSession = async (
  request: CreateGameSessionRequest
): Promise<GameSessionResponse> => {
  try {
    const response = await apiHelpers.post<GameSessionResponse>(
      API_ENDPOINTS.CREATE_GAME_SESSION,
      request
    );
    return response.data as GameSessionResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Create game session failed"
      );
    }
    throw new Error("Network error occurred");
  }
};

export const updateUser = async (
  userId: number,
  data: UpdateUserRequest
): Promise<User> => {
  try {
    const response = await apiHelpers.patch<User>(
      `${API_ENDPOINTS.UPDATE_USER}/${userId}`,
      data
    );
    return response.data as User;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Update user failed");
    }
    throw new Error("Network error occurred");
  }
};
