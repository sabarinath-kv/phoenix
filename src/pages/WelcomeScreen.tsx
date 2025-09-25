import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, Sparkles, Heart, Users } from "lucide-react";
import WiglooImg from "@/assets/images/wigloo-image.png";

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleGetStarted = () => {
    if (user?.metadata["isOnboarded"]) {
      navigate("/game-redirect", {
        state: {
          gameClass: "ADHD",
          completedGames: [],
        },
      });
    } else {
      navigate("/voice-chat");
    }
  };

  const handleSkip = () => {
    navigate("/game-selection");
  };

  return (
    <>
      {/* Custom font styles - fonts are already imported in index.css */}
      <style>{`
        .font-replay-pro {
          font-family: "Replay Pro", "Manrope", "Inter", system-ui, -apple-system, sans-serif;
        }
        
        .font-dm-sans {
          font-family: "DM Sans", "Inter", system-ui, -apple-system, sans-serif;
        }
        
        .font-plus-jakarta {
          font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div
        className="min-h-screen min-h-[100dvh] relative overflow-hidden safe-area-inset"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Main Content */}
        <div className="h-screen h-[100dvh] flex flex-col relative z-10">
          {/* Header with Wigloo branding */}
          <div className="flex-shrink-0 pt-16 pb-8 px-6 text-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-8"
              }`}
            >
              <img
                src={WiglooImg}
                alt="Wigloo"
                className="w-150 h-150 mx-auto mb-6 float-animation"
              />

              <h1
                className="font-bold text-gray-800 mb-3 font-replay-pro"
                style={{
                  fontFamily: "Replay Pro",
                  fontWeight: 400,
                  fontSize: "28px",
                  lineHeight: "140%",
                  letterSpacing: "0px",
                  textAlign: "center",
                  color: "#303130",
                  width: "326px",
                  height: "78px",
                  transform: "rotate(0deg)",
                  opacity: 1,
                  textWrap: "balance",
                  margin: "0 auto",
                }}
              >
                Meet Wigloo, your{" "}
                <span
                  style={{
                    fontFamily: "Replay Pro",
                    fontWeight: 400,
                    fontStyle: "italic",
                    fontSize: "28px",
                    lineHeight: "140%",
                    letterSpacing: "0px",
                    textAlign: "center",
                  }}
                >
                  AI companion
                </span>
              </h1>

              <p
                className="font-plus-jakarta"
                style={{
                  fontFamily: "Plus Jakarta Sans",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "150%",
                  letterSpacing: "0px",
                  textAlign: "center",
                  color: "#878787",
                  width: "326px",
                  height: "42px",
                  transform: "rotate(0deg)",
                  opacity: 1,
                  margin: "0 auto",
                }}
              >
                I'll ask a few quick questions to help pick the right playful
                games for your child.
              </p>
            </div>
          </div>

          {/* Bottom action area */}
          <div className="flex-shrink-0 p-6">
            <div
              className={`transition-all duration-1000 delay-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* Get Started Button */}
              <div className="flex justify-center pb-8">
                <Button
                  onClick={() => navigate("/voice-chat")}
                  className="w-full m-4 rounded-full px-6 py-7 text-black border transition-all duration-300 font-plus-jakarta"
                  style={{
                    backgroundColor: "#FFD934",
                    borderColor: "#FAAD61",
                    borderWidth: "1px",
                    boxShadow: "0px 3px 0px 3px #FAAD61",
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 700,
                    fontSize: "16px",
                    lineHeight: "24px",
                    letterSpacing: "0.4px",
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  Start voice chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
