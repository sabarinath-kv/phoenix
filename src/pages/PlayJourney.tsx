import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import WiglooImg from "@/assets/images/wigloo-image.png";

interface ProgressStep {
  id: number;
  text: string;
  completed: boolean;
  current: boolean;
}

export const PlayJourney: React.FC = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: 1, text: "Analysing conversation", completed: true, current: false },
    { id: 2, text: "Selecting perfect games", completed: false, current: true },
    {
      id: 3,
      text: "Personalising experience",
      completed: false,
      current: false,
    },
  ]);

  useEffect(() => {
    // Simulate progress through steps
    const timer1 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === 2
            ? { ...step, completed: true, current: false }
            : step.id === 3
            ? { ...step, current: true }
            : step
        )
      );
    }, 2000);

    const timer2 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === 3 ? { ...step, completed: true, current: false } : step
        )
      );
    }, 4000);

    const timer3 = setTimeout(() => {
      // Navigate to next screen after completion
      navigate("/game-redirect", {
        state: {
          gameClass: "ADHD",
          completedGames: [],
        },
      });
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <>
      {/* Custom styles for gradient and animations */}
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
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          {/* Wigloo Image and Text - Always Visible */}
          <div className="text-center mb-12">
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
              Creating your child’s play{" "}
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
                journey...
              </span>
            </h1>
          </div>

          {/* Progress Steps - Figma Design */}
          <div className="relative w-full max-w-[297px]">
            {/* Vertical Dashed Line */}
            <div className="absolute left-3 top-6 bottom-6 w-0.5 border-l-[3px] border-dashed border-[#EBE9E9]"></div>

            {/* Steps */}
            <div className="space-y-7">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  {/* Step Indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    {step.completed ? (
                      <div className="w-6 h-6 bg-[#02873F] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : step.current ? (
                      <div className="w-6 h-6 bg-[#FDD201] border-[3px] border-[#FD4C1D] rounded-full"></div>
                    ) : (
                      <div className="w-6 h-6 bg-white border-[3px] border-[#A9A6A2] rounded-full"></div>
                    )}
                  </div>

                  {/* Step Text Container */}
                  <div className="flex-1 bg-[#FAF6F3] rounded-xl px-4 py-2.5">
                    <p
                      className="font-plus-jakarta text-black"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: "1.5em",
                        letterSpacing: "0.025em",
                        textAlign: "left",
                      }}
                    >
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayJourney;
