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
