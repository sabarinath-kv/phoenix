import React from "react";
import Avatar1 from "@/assets/images/avatar1.png";
import Avatar2 from "@/assets/images/avatar2.png";
import Avatar3 from "@/assets/images/avatar3.png";
import MenuIcon from "@/assets/icons/menu.svg";
import HomeIcon from "@/assets/icons/home-black.svg";
import BrainIcon from "@/assets/icons/head-orange.svg";
import ChartIcon from "@/assets/icons/pie_chart.svg";
import ArticleIcon from "@/assets/icons/article.svg";
import GlobeIcon from "@/assets/icons/globe.svg";
import { useNavigate } from "react-router-dom";

interface Expert {
  id: string;
  name: string;
  title: string;
  experienceYears: number;
  rateInr: number;
  languages: string[];
  modes: string[];
  nextSlot: string;
  avatar: string;
}

const experts: Expert[] = [
  {
    id: "1",
    name: "Sharika Pramod",
    title: "Consultant Psychologist",
    experienceYears: 2,
    rateInr: 1000,
    languages: ["English", "Malayalam"],
    modes: ["Video", "Voice"],
    nextSlot: "Tomorrow, 12:00 AM",
    avatar: Avatar1,
  },
  {
    id: "2",
    name: "Fathima Shirin",
    title: "Consultant Psychologist",
    experienceYears: 2,
    rateInr: 1000,
    languages: ["English", "Malayalam"],
    modes: ["Video", "Voice"],
    nextSlot: "Tomorrow, 5:45 AM",
    avatar: Avatar2,
  },
  {
    id: "3",
    name: "Merin Susan",
    title: "Consultant Psychologist",
    experienceYears: 3,
    rateInr: 1200,
    languages: ["English", "Malayalam"],
    modes: ["Video", "Voice"],
    nextSlot: "Today, 7:15 PM",
    avatar: Avatar3,
  },
];

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <span
    className="px-2 py-1 rounded-full text-[11px]"
    style={{
      background: "#FFF3E1",
      color: "#7A4C00",
      fontFamily: "Plus Jakarta Sans",
      lineHeight: "14px",
      border: "1px solid #F1E2C7",
    }}
  >
    {label}
  </span>
);

const Card: React.FC<{ expert: Expert }> = ({ expert }) => {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid #F1E2C7",
        boxShadow:
          "-3px 3px 10px 0px rgba(0, 0, 0, 0.05), -13px 12px 18px 0px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-14 h-14 rounded-xl overflow-hidden bg-white border"
            style={{ borderColor: "#F1E2C7" }}
          >
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div
              className="text-[#0D0D0D]"
              style={{
                fontFamily: "Plus Jakarta Sans",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
              }}
            >
              {expert.name}
            </div>
            <div
              className="text-[#6F6F6F] mt-0.5"
              style={{
                fontFamily: "Plus Jakarta Sans",
                fontSize: "12px",
                lineHeight: "16px",
              }}
            >
              {expert.title}
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className="text-[#0D0D0D] opacity-80"
                style={{
                  fontFamily: "Plus Jakarta Sans",
                  fontSize: "12px",
                  lineHeight: "16px",
                }}
              >
                {expert.experienceYears}+ Years experience
              </span>
              <span
                className="text-[#0D0D0D]"
                style={{
                  fontFamily: "Plus Jakarta Sans",
                  fontSize: "12px",
                  lineHeight: "16px",
                }}
              >
                • Starts at{" "}
                <span style={{ color: "#FAAD61", fontWeight: 700 }}>
                  ₹{expert.rateInr}
                </span>{" "}
                per session
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {expert.languages.map((l) => (
                <Chip key={l} label={l} />
              ))}
              {expert.modes.map((m) => (
                <Chip key={m} label={m} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "#FFF9EE", borderTop: "1px solid #F1E2C7" }}
      >
        <div
          className=""
          style={{
            fontFamily: "Plus Jakarta Sans",
            fontSize: "12px",
            lineHeight: "16px",
            color: "#7A4C00",
          }}
        >
          <div className="opacity-80">Next available slot</div>
          <div className="font-semibold" style={{ color: "#0D0D0D" }}>
            {expert.nextSlot}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-full font-medium"
            style={{
              background: "#FAAD61",
              color: "#0D0D0D",
              fontFamily: "Plus Jakarta Sans",
              fontSize: "12px",
              boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
            }}
          >
            Book
          </button>
          <button
            className="px-4 py-2 rounded-full font-medium border"
            style={{
              borderColor: "#F1E2C7",
              background: "#FFFFFF",
              color: "#0D0D0D",
              fontFamily: "Plus Jakarta Sans",
              fontSize: "12px",
            }}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const Experts: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen min-h-[100dvh] relative overflow-x-hidden"
      style={{ background: "#F9F0CB" }}
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
        {/* Spacer / Title area (optional) */}
        <div className="flex-1 flex items-center gap-2 bg-transparent rounded-lg px-2 py-2 ">
          <h1
            style={{
              fontFamily: "Plus Jakarta Sans",
              fontWeight: 700,
              fontStyle: "normal",
              fontSize: "20px",
              lineHeight: "24px",
              letterSpacing: "0px",
              margin: 0,
              width: "100%",
              textAlign: "center",
              color: "#0D0D0D",
              marginRight: "20px",
              paddingRight: "10px",
            }}
          >
            Experts
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-28 px-4 max-w-md mx-auto">
        <div className="space-y-5">
          {experts.map((e) => (
            <Card key={e.id} expert={e} />
          ))}
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
            <img
              src={HomeIcon}
              alt="Home"
              className="w-6 h-6 text-[#0D0D0D] mb-0.5"
              onClick={() => navigate("/new-homepage")}
            />
          </div>

          {/* Brain/Psychology - active */}
          <div className="flex flex-col items-center py-3 px-5 min-w-[60px]">
            <div className="w-8 h-8 bg-transparent rounded-2xl flex items-center justify-center">
              <img
                src={BrainIcon}
                alt="Brain"
                className="w-6 h-6 text-[#FAAD61]"
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
                className="w-6 h-6 text-[#1C1B1F]"
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
  );
};

export default Experts;
