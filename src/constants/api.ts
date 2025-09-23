export const API_BASE_URL = "https://phoenix-be-j9yt.onrender.com/api/v1";

export const API_ENDPOINTS = {
  USERS: "/users",
  UPDATE_USER: "/users", // Base path, user_id will be appended
  SESSIONS: "/sessions",
  EMOTIONS: "/emotions",
  AUTH_SIGNUP: "/auth/signup",
  AUTH_LOGIN: "/auth/token",
  LIVEKIT_TOKEN: "/livekit/rooms",
  CREATE_GAME_SESSION: "/sessions",
} as const;

export const DEFAULT_TIMEOUT = 10000;
