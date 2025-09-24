import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff, Mail } from "lucide-react";
import LoginBanner from "@/assets/images/login.svg";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!user) return;
    if (user.metadata["isOnboarded"]) {
      navigate("/game-redirect", {
        state: {
          gameClass: "ADHD",
          completedGames: [],
        },
      });
    } else {
      navigate("/voice-chat");
    }
  }, [user]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);

      // // Redirect to the page user was trying to access, or home page
      // const from = location.state?.from?.pathname || "/";
      // navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Custom styles to remove all focus outlines */}
      <style>{`
        input:focus,
        input:focus-visible,
        input:active {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }
      `}</style>

      <div
        className="min-h-screen min-h-[100dvh] relative overflow-hidden safe-area-inset"
        style={{ backgroundColor: "#FFD934" }}
      >
        {/* Main Content */}
        <div className="h-screen h-[100dvh] flex flex-col relative z-10 overflow-hidden">
          {/* Login Banner - Responsive positioning */}
          <div className="flex-shrink-0 md:px-12 ">
            <img
              src={LoginBanner}
              alt="Wingloo Login Banner"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Login Form Container - Responsive design */}
          <div className="flex-1 flex items-end relative">
            {/* Background shape - hidden on mobile, visible on larger screens */}
            <div className="hidden md:block absolute -top-32 -left-80 w-[1002px] h-[500px] rounded-full bg-white" />

            {/* Form content */}
            <div className="relative z-10 md:bg-transparent p-4 md:p-0 w-full h-full">
              {/* Oval/Ellipse background for mobile */}
              <div
                className="absolute inset-0 bg-white md:hidden"
                style={{
                  borderTopLeftRadius: "50% 40px",
                  borderTopRightRadius: "50% 40px",
                }}
              />

              {/* Content wrapper */}
              <div className="relative z-10">
                <div className="w-full max-w-sm mx-auto md:ml-20 lg:ml-32">
                  {/* Header */}
                  <div className="text-center md:text-left mb-4 md:mb-8">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-3">
                      Welcome to Wingloo!
                    </h1>
                    <p className="text-gray-600 text-sm md:text-lg">
                      Helping every child thrive through play
                    </p>
                  </div>

                  {/* Login Form */}
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-3 md:space-y-4"
                  >
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Email Input */}
                    <div className="relative">
                      <div className="bg-white border-2 border-gray-300 rounded-full px-6 py-1 shadow-lg hover:shadow-xl transition-all duration-200 focus-within:border-orange-400 focus-within:shadow-xl">
                        <div className="flex items-center gap-4">
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...register("email")}
                            className="border-0 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium p-0 flex-1"
                          />
                        </div>
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-2 ml-6">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <div className="bg-white border-2 border-gray-300 rounded-full px-6 py-1 shadow-lg hover:shadow-xl transition-all duration-200 focus-within:border-orange-400 focus-within:shadow-xl">
                        <div className="flex items-center gap-4">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...register("password")}
                            className="border-0 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium p-0 flex-1"
                          />
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500 mt-2 ml-6">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0 py-3 md:py-4 text-base md:text-lg font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl mt-3 md:mt-6"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          SIGNING IN...
                        </>
                      ) : (
                        "SIGN IN"
                      )}
                    </Button>
                  </form>

                  {/* Footer */}
                  <div className="mt-4 md:mt-8 text-center md:text-left pb-4 md:pb-0">
                    <p className="text-gray-600 text-sm md:text-base">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="font-bold text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        Create one
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
