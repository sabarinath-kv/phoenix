import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  authService,
  type User as ApiUser,
  type SignupRequest,
} from "@/api/auth";
import { createRoomAndToken, LivekitTokenResponse, ProfileSummary } from "@/api/apis";

type User = ApiUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  livekitTokenResponse: LivekitTokenResponse | null;
  refreshLivekitTokenResponse: () => Promise<void>;
  getLivekitTokenResponse: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  insights: ProfileSummary[] | null;
  setInsights: (insights: ProfileSummary[]) => void;
}

type SignupData = SignupRequest;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [livekitTokenResponse, setLivekitTokenResponse] = useState<LivekitTokenResponse | null>(null);
  const [insights, setInsights] = useState<ProfileSummary[] | null>(null);  

  const isAuthenticated = !!user;
  console.log(livekitTokenResponse)
  // Check for existing auth token on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        // You might want to validate the token with the server here
        // For now, we'll just check if it exists
        const userData = localStorage.getItem("userData");
        // const livekitTokenResponse = localStorage.getItem("livekitTokenResponse");
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            localStorage.removeItem("livekitTokenResponse");
          }
        }
        if (livekitTokenResponse) {
          try {
            // setLivekitTokenResponse(JSON.parse(livekitTokenResponse));
          } catch (error) {
            localStorage.removeItem("livekitTokenResponse");
          }
        }
        console.log("livekitTokenResponse", livekitTokenResponse);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
      const response = await authService.login({ email, password });

      // Store auth token and user data
      localStorage.setItem("authToken", response.access_token);
      localStorage.setItem("userData", JSON.stringify(response.user));
      setUser(response.user);
  };

  const signup = async (userData: SignupData): Promise<void> => {
      await authService.signup(userData);
      // Signup successful, user should now login
   
  };

  const getLivekitTokenResponse = async () => {
    const access_token = localStorage.getItem("authToken");
    if (!access_token) {
      throw new Error("No auth token found");
    }
    const livekitTokenResponse = await createRoomAndToken(access_token);
    console.log(livekitTokenResponse)
    // localStorage.setItem("livekitTokenResponse", JSON.stringify(livekitTokenResponse));
    setLivekitTokenResponse(livekitTokenResponse);
  }

  const refreshLivekitTokenResponse = async () => {
    setLivekitTokenResponse(null);
  }

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("livekitTokenResponse");
    setLivekitTokenResponse(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,

    livekitTokenResponse,
    getLivekitTokenResponse,
    insights,
    setInsights,
    isLoading,
    login,
    signup,
    logout,
    setUser,
    refreshLivekitTokenResponse
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
