export const API_BASE_URL = "https://api.example.com/api/v1";

export const API_ENDPOINTS = {
  USERS: "/users",
  SESSIONS: "/sessions",
  EMOTIONS: "/emotions",
  AUTH_SIGNUP: "/auth/signup",
  AUTH_LOGIN: "/auth/token",
} as const;

export const DEFAULT_TIMEOUT = 10000;
