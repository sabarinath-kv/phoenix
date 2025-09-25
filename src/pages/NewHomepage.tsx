import ArticleIcon from "@/assets/icons/article.svg";
import GlobeIcon from "@/assets/icons/globe.svg";
import MenuIcon from "@/assets/icons/menu.svg";
import ChartIcon from "@/assets/icons/pie_chart.svg";
import TalkToWiglooImg from "@/assets/images/talk-to-wigloo.png";
import React from "react";
import { useNavigate } from "react-router-dom";
import HeadIcon from "@/assets/icons/head.svg";
import HomeIcon from "@/assets/icons/home.svg";

export const NewHomepage: React.FC = () => {
  const navigate = useNavigate();

  const handleTalkToWigloo = () => {
    navigate("/voice-chat");
  };

  return (
    <>
      {/* Custom styles */}
      <style>{`
        .font-replay-pro {
          font-family: "Replay Pro", "Manrope", "Inter", system-ui, -apple-system, sans-serif;
        }
        
        .font-ibm-plex {
          font-family: "IBM Plex Serif", "Georgia", serif;
        }
        
        .font-roboto {
          font-family: "Roboto", "Inter", system-ui, -apple-system, sans-serif;
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
        
        .float-1 {
          animation: float 4s ease-in-out infinite;
        }
        
        .float-2 {
          animation: float 5s ease-in-out infinite 1s;
        }
        
        .float-3 {
          animation: float 6s ease-in-out infinite 2s;
        }
        
        .float-4 {
          animation: float 4.5s ease-in-out infinite 0.5s;
        }
      `}</style>

      <div
        className="min-h-screen min-h-[100dvh] relative overflow-x-hidden"
        style={{ backgroundColor: "#F9F0CB" }}
      >
        {/* App Bar */}
        <div className="absolute top-0 left-0 right-0 bg-[#F9F0CB] flex items-center gap-2 px-6 py-2 w-full">
          {/* Menu Button */}
          <div
            className="flex justify-center items-center gap-2 w-10 h-10 bg-white border border-[#F2E5B1] rounded-full p-2 shadow-sm"
            style={{
              boxShadow:
                "2.13px 2.84px 7.81px 0px rgba(160, 158, 158, 0.1), 8.52px 11.36px 14.2px 0px rgba(160, 158, 158, 0.09)",
              marginTop: "10px",
            }}
          >
            <img src={MenuIcon} alt="Menu" className="w-4 h-4 text-[#1C1B1F]" />
          </div>

          {/* Search/Content Area */}
          <div className="flex-1 flex items-center gap-2 bg-transparent rounded-lg px-2 py-2 "></div>
        </div>

        {/* Main Content */}
        <div className="pt-10">
          <div className="w-full items-start mt-8 pt-4 ml-6 pb-[-4]">
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans",
                fontWeight: 700,
                fontStyle: "normal",
                fontSize: "22px",
                lineHeight: "24px",
                letterSpacing: "0px",
              }}
            >
              Good Morning!
            </h2>
          </div>
          <div className="flex justify-center">
            <img
              src={TalkToWiglooImg}
              alt="Talk to Wigloo"
              className="max-w-full max-h-full object-contain"
              style={{
                width: "90%",
                height: "100%",
                margin: "0 auto",
                paddingTop: "18px",
              }}
            />
          </div>

          {/* Figma sections below hero */}
          <div className="w-full flex justify-center mt-4 pb-28">
            <div className="w-full  px-6 flex flex-col items-center gap-5">
              <img
                src="/figma/section-1.png"
                alt="Section 1"
                className="w-full h-auto overflow-y-scroll"
              />
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 w-full bg-transparent px-9 py-6 rounded-t-3xl shadow-lg z-50">
          <div
            className="flex items-center justify-between px-2"
            style={{
              boxShadow:
                "-3px 3px 10px 0px rgba(0, 0, 0, 0.05), -13px 12px 18px 0px rgba(0, 0, 0, 0.04)",
              backgroundColor: "#ffffff",
              borderRadius: "24px",
            }}
          >
            {/* Home */}
            <div className="flex flex-col items-center py-3 px-0 min-w-[60px]">
              <img src={HomeIcon} alt="Home" className="w-6 h-6 mb-0.5" />
            </div>

            {/* Brain/Psychology */}
            <div className="flex flex-col items-center py-3 px-5 min-w-[60px]">
              <div className="w-8 h-8 bg-transparent rounded-2xl flex items-center justify-center">
                <img
                  src={HeadIcon}
                  alt="Brain"
                  className="w-6 h-6"
                  onClick={() => navigate("/expert-listing")}
                />
              </div>
            </div>

            {/* Charts */}
            <div className="flex flex-col items-center py-3 px-0 min-w-[60px]">
              <img
                src={ChartIcon}
                alt="Chart"
                className="w-6 h-6 text-[#0D0D0D]"
              />
            </div>

            {/* Article */}
            <div className="flex flex-col items-center py-3 px-5 min-w-[60px]">
              <div className="w-8 h-8 bg-transparent rounded-2xl flex items-center justify-center">
                <img
                  src={ArticleIcon}
                  alt="Article"
                  className="w-6 h-6 text-[#1C1B1F] "
                  onClick={() => {
                    navigate("/upload");
                  }}
                />
              </div>
            </div>

            {/* Globe */}
            <div className="flex flex-col items-center py-3 px-0 min-w-[60px]">
              <img
                src={GlobeIcon}
                alt="Globe"
                className="w-6 h-6 text-[#0D0D0D]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewHomepage;
