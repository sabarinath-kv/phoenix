/* eslint-disable @typescript-eslint/no-explicit-any */
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


export type ProfileSummaryItem = {
  title: string;
  value: string;
  sub_label: string;
  message: string;
  icon: string;
  index: number;
}

export type ProfileSummaryResponse = {
  strength_spotlight: ProfileSummaryItem
  attention_focus: ProfileSummaryItem
  response_style: ProfileSummaryItem
  working_style: ProfileSummaryItem
  adhd_risk: ProfileSummaryItem
  summary_profile: ProfileSummaryItem
  rhythm_consistency: ProfileSummaryItem
  visual_tracking: ProfileSummaryItem
  anxiety_signals: ProfileSummaryItem
}

export enum Summary {
  strength_spotlight = "strength_spotlight",
  attention_focus = "attention_focus",
  response_style = "response_style",
  working_style = "working_style",
  adhd_risk = "adhd_risk",
  summary_profile = "summary_profile",
  rhythm_consistency = "rhythm_consistency"     ,
  visual_tracking = "visual_tracking",
  anxiety_signals = "anxiety_signals",
}

export type ProfileSummary = {
  title: string;
  value: string;
  sub_label: string;
  message: string;
  icon: string;
  index: number;
  summaryName: Summary
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



export const generateReport = async (userId: number)=> {
   return apiHelpers.get(
      `${API_ENDPOINTS.GENERATE_REPORT(userId)}`
    );
  }


export type ProfileSummaries = ProfileSummary[]


  export const getProfileSummary = async (userId: number): Promise<ProfileSummaries> => {
    try {
      const response = await apiHelpers.get<ProfileSummaryResponse>(
        `${API_ENDPOINTS.GET_PROFILE_SUMMARY(userId)}`
      );

      const profileData = response.data as ProfileSummaryResponse;
      
      // Transform the response object into an array with summaryName keys
      const profileSummaries: ProfileSummary[] = Object.entries(profileData).map(([key, item]) => ({
        ...item,
        summaryName: key as Summary
      }));

      // Sort by index to maintain proper order
      return profileSummaries.sort((a, b) => a.index - b.index);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Get profile summary failed"
        );
      }
      throw new Error("Network error occurred");
    }
  }




