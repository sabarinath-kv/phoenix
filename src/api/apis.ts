import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import axios, { apiHelpers } from "./axios";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  export type LivekitTokenResponse = {
    url: string;
    access_token: string;
  };

export const createRoomAndToken = async (token: string): Promise<LivekitTokenResponse> => {
    try {
      const response = await apiHelpers.post<LivekitTokenResponse>(
        API_ENDPOINTS.LIVEKIT_TOKEN,null, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      return response.data as LivekitTokenResponse;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response?.data?.message || "Token creation failed");
      }
      throw new Error("Network error occurred");
    }
  }