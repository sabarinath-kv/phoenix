import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { PreloadedImage } from "@/components/LazyImage";

// Import game insights image
import gameInsightsImage from "@/assets/images/game-insights.png";
import result1Image from "@/assets/images/result1.png";
import { useAuth } from "@/contexts/AuthContext";
import { generateReport, getProfileSummary } from "@/api/apis";

export const GameInsights = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prevProgress + 2; // Increment by 2% every 100ms (5 seconds total)
      });
    }, 100);

    // Show content after 5 seconds with smooth transition
    const loadingTimer = setTimeout(() => {
      // Add a small delay after progress completes for smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // 500ms delay after progress completes
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(loadingTimer);
    };
  }, []);





  return (
    <>
      {/* Custom styles for progress bar */}
      <style>{`
        .progress-bar-blue [data-state="complete"] {
          background-color: #0957D0 !important;
        }
        .progress-bar-blue .bg-primary {
          background-color: #0957D0 !important;
        }
        .progress-bar-blue [role="progressbar"] > div {
          background-color: #0957D0 !important;
        }
      `}</style>

      <div className="min-h-screen w-full bg-gradient-to-br from-yellow-100 to-green-100">
        {/* Container with margin */}
        <div className="p-4">
          {/* Game Insights Background Container */}
          <div
            className="w-full overflow-hidden relative"
            style={{
              borderRadius: "24px",
              backgroundImage: `url(${result1Image})`,
              backgroundSize: "contain",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
              minHeight: "calc(100vh - 32px)", // Full height minus padding
            }}
          >
            {/* Result1 Image - Absolute positioned */}
            <PreloadedImage
              src={gameInsightsImage}
              alt="Result 1"
              className="absolute w-full h-full"
              style={{ zIndex: 10 }}
            />

            {/* Conditional Content */}
            <div
              className={`absolute px-6 w-full text-center transition-all duration-700 ease-in-out ${
                isLoading ? "opacity-100" : "opacity-0"
              }`}
              style={{
                top: "55%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
              }}
            >
              {isLoading && (
                /* Loading State */
                <div className="space-y-8">
                  <div className="max-w-sm mx-auto relative flex flex-col items-center justify-center">
                    <Progress
                      value={progress}
                      className="h-5 w-[300px] bg-gray-200/50 rounded-full overflow-hidden progress-bar-blue border-2 border-white/40 shadow-lg"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                        boxShadow:
                          "0 4px 12px rgba(9, 87, 208, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
                      }}
                    />
                    {/* Percentage text centered in the progressing part */}
                    <div
                      className="absolute top-0 left-0 h-full flex items-center justify-center text-white text-xs font-semibold overflow-hidden"
                      style={{
                        width: `${progress}%`,
                        fontSize: "12px",
                        fontWeight: 600,
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        opacity: progress > 20 ? 1 : 0,
                        transition: "opacity 0.3s ease-in-out",
                      }}
                    >
                      {Math.round(progress)}%
                    </div>
                  </div>
                  <div
                    className="text-black"
                    style={{
                      fontFamily: "Replay Pro",
                      fontSize: "34px",
                      lineHeight: "100%",
                      letterSpacing: "0px",
                      fontWeight: 400,
                    }}
                  >
                    <span style={{ fontStyle: "italic" }}>Arjun's </span>
                    <span>story is being </span>
                    <span style={{ fontStyle: "italic" }}>created</span>
                    <span>...</span>
                    <div
                      className="text-center"
                      style={{
                        marginTop: "20px",
                        fontFamily: "DM Sans",
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "140%",
                        letterSpacing: "0px",
                        textTransform: "capitalize",
                        maxWidth: "240px",
                        color: "#605E5E",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "20px auto 0 auto",
                        textAlign: "center",
                      }}
                    >
                      This usually takes between 1-2 minutes on a good day. Hang
                      Tight!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Final Content */}
            <div
              className={`absolute px-6 w-full text-center transition-all duration-700 ease-in-out ${
                !isLoading ? "opacity-100" : "opacity-0"
              }`}
              style={{
                top: "55%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
              }}
            >
              {!isLoading && (
                /* Final Story Text */
                <div
                  className="text-black"
                  style={{
                    fontFamily: "Replay Pro",
                    fontSize: "34px",
                    lineHeight: "100%",
                    letterSpacing: "0px",
                    fontWeight: 400,
                  }}
                >
                  <span style={{ fontStyle: "italic" }}>Arjun </span>
                  <span>gave his </span>
                  <span style={{ fontStyle: "italic" }}>best </span>
                  <span>to complete the games</span>
                </div>
              )}
            </div>

            {/* Empty content div to maintain height */}
            <div
              className="w-full h-full"
              style={{ minHeight: "calc(100vh - 32px)" }}
            >
              {/* Content can be added here if needed */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
