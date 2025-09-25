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

export const ProgressInsights: React.FC = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: 1, text: "Looking at play", completed: true, current: false },
    { id: 2, text: "Comparing with age", completed: false, current: true },
    { id: 3, text: "Noticing strengths", completed: false, current: false },
    { id: 4, text: "Seeing challenges", completed: false, current: false },
    { id: 5, text: "Making a plan", completed: false, current: false },
  ]);

  useEffect(() => {
    // Simulate progress through steps - same pattern as PlayJourney
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
          step.id === 3
            ? { ...step, completed: true, current: false }
            : step.id === 4
            ? { ...step, current: true }
            : step
        )
      );
    }, 4000);

    const timer3 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === 4
            ? { ...step, completed: true, current: false }
            : step.id === 5
            ? { ...step, current: true }
            : step
        )
      );
    }, 6000);

    const timer4 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === 5 ? { ...step, completed: true, current: false } : step
        )
      );
    }, 8000);

    const timer5 = setTimeout(() => {
      // Navigate to next screen after completion
      navigate("/game-insights");
    }, 9500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [navigate]);

  return (
    <>
      {/* Custom styles for gradient and animations */}
      <style>{`
        .font-replay-pro {
          font-family: "Replay Pro", "Manrope", "Inter", system-ui, -apple-system, sans-serif;
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
        
        @keyframes checkmarkAppear {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .checkmark-animation {
          animation: checkmarkAppear 0.5s ease-out forwards;
        }
      `}</style>

      <div
        className="min-h-screen min-h-[100dvh] relative overflow-hidden safe-area-inset"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 pt-16 pb-20">
          {/* Wigloo Image */}
          <div className="text-center mb-8">
            <img
              src={WiglooImg}
              alt="Wigloo"
              className="w-150 h-150 mx-auto float-animation"
            />
          </div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1
              className="font-normal text-gray-800 mb-3 font-replay-pro"
              style={{
                fontFamily: "Replay Pro",
                fontWeight: 400,
                fontSize: "28px",
                lineHeight: "140%",
                letterSpacing: "0px",
                textAlign: "center",
                color: "#393738",
                width: "326px",
                margin: "0 auto",
                textWrap: "balance",
              }}
            >
              We're preparing your <br /> child's{" "}
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
                insights…
              </span>
            </h1>

            <p
              className="font-plus-jakarta text-gray-600"
              style={{
                fontFamily: "Plus Jakarta Sans",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "150%",
                textAlign: "center",
                color: "#878787",
              }}
            >
              Here's what's happening behind the scenes.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="relative w-full max-w-[297px]">
            {/* Vertical Dashed Line */}
            <div
              className="absolute left-3 w-0 border-l-[3px] border-dashed border-[#EBE9E9]"
              style={{
                top: "19.82px",
                height: "276px",
              }}
            />

            {/* Steps */}
            <div className="space-y-7">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  {/* Step Indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    {step.completed ? (
                      <div className="w-6 h-6 bg-[#02873F] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white checkmark-animation" />
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

export default ProgressInsights;
