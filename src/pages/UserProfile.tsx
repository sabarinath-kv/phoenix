import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";

// Import assets
import profileBgVector from "@/assets/images/profile-bg-vector.png";
import profileAvatar from "@/assets/images/profile-avatar-17b9bf.png";
import patternSpotterIcon from "@/assets/images/pattern-spotter-icon-1d7a30.png";
import makerMindsetIcon from "@/assets/images/maker-mindset-icon-107687.png";
import insightsIcon from "@/assets/images/insights-learning-icon.png";

// Import icons
import calendarIcon from "@/assets/icons/calendar-icon.svg";
import graduationCapIcon from "@/assets/icons/graduation-cap-icon.svg";
import bearSmileIcon from "@/assets/icons/bear-smile-icon.svg";
import speedIcon from "@/assets/icons/speed-icon.svg";
import musicIcon from "@/assets/icons/music-icon.svg";
import arrowDownIcon from "@/assets/icons/arrow-down-icon.svg";
import bounceBackIcon from "@/assets/icons/bounce-back-icon.svg";

interface SuperPower {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
  iconWidth?: string;
  iconHeight?: string;
}

interface InsightCategory {
  id: string;
  title: string;
  count: string;
  icon: string;
  isExpanded: boolean;
}

export const UserProfile = () => {
  const navigate = useNavigate();

  const [expandedInsights, setExpandedInsights] = useState<string[]>([]);
  const [superPowersExpanded, setSuperPowersExpanded] = useState(false);

  const superPowers: SuperPower[] = [
    {
      id: "pattern-spotter",
      name: "Pattern spotter",
      icon: patternSpotterIcon,
      bgColor: "#FBF6E9",
      iconWidth: "w-160",
      iconHeight: "h-160",
    },
    {
      id: "maker-mindset",
      name: "Maker mindset",
      icon: makerMindsetIcon,
      bgColor: "#FBF6E9",
      iconWidth: "w-160",
      iconHeight: "h-160",
    },
    {
      id: "bounce-back",
      name: "Bounce-back",
      icon: bounceBackIcon,
      bgColor: "#F1F1F1",
      iconWidth: "w-110",
      iconHeight: "h-12",
    },
  ];

  const insightCategories: InsightCategory[] = [
    {
      id: "learning-harder",
      title: "Things making learning harder",
      count: "3 insights",
      icon: insightsIcon,
      isExpanded: false,
    },
    {
      id: "feelings-friendships",
      title: "Feelings & friendships",
      count: "5 insights",
      icon: insightsIcon,
      isExpanded: false,
    },
    {
      id: "focus-energy",
      title: "Focus & energy",
      count: "5 insights",
      icon: insightsIcon,
      isExpanded: false,
    },
    {
      id: "reading-numbers",
      title: "Reading numbers",
      count: "5 insights",
      icon: insightsIcon,
      isExpanded: false,
    },
  ];

  const toggleInsight = (id: string) => {
    setExpandedInsights((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {/* Main Container */}
      <div className="px-4 py-4">
        <div className="max-w-md mx-auto bg-[#FAF6F3] rounded-3xl border border-[rgba(224,208,187,0.5)] relative overflow-hidden">
          {/* Background Vector */}
          <div className="absolute top-[-24px] left-[-2px] w-[400px] h-[230px] z-0">
            <img src={profileBgVector} alt="" className="object-cover" />
          </div>

          {/* Background Circles */}
          <div className="absolute top-[167px] left-[-300px] w-[1002px] h-[964px] rounded-full bg-[#F4EDD0] z-0"></div>
          <div className="absolute top-[398px] left-[-300px] w-[1002px] h-[964px] rounded-full bg-white z-0"></div>

          {/* Profile Avatar */}
          <div className="absolute top-[123px] left-1/2 transform -translate-x-1/2 z-10">
            <div className="w-[83px] h-[83px] rounded-full border-[6px] border-white overflow-hidden bg-[#FFA10A]">
              <img
                src={profileAvatar}
                alt="Arjun"
                className="w-[120%] h-[120%] object-cover rounded-full transform scale-110 -translate-x-[1%] -translate-y-[10%]"
              />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 pt-[209px] pb-8">
            {/* Profile Info Section */}
            <div className="flex flex-col items-center gap-3 mb-[83px]">
              <div className="flex flex-col items-center gap-1">
                <h1 className="text-[32px] font-[800] leading-[1.2] text-center text-[#3B3839] font-heading">
                  Arjun
                </h1>

                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <img src={calendarIcon} alt="" className="w-4 h-4" />
                    <span className="text-[16px] font-[500] leading-[1.2] text-[#333333] font-heading">
                      7 years
                    </span>
                  </div>

                  <div className="w-[5px] h-[5px] rounded-full bg-[#333333]"></div>

                  <div className="flex items-center gap-2.5">
                    <img src={graduationCapIcon} alt="" className="w-4 h-4" />
                    <span className="text-[16px] font-[500] leading-[1.2] text-[#333333] font-heading">
                      Class 2
                    </span>
                  </div>
                </div>
              </div>

              {/* Learning Style Tags */}
              <div className="flex flex-col items-center gap-2 px-4">
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="flex items-center gap-2 bg-[#F0DE95] rounded-sm px-3 py-2">
                    <img src={bearSmileIcon} alt="" className="w-4 h-6" />
                    <span className="text-[14px] font-[400] leading-[1.2] text-[#333333] font-dm-sans">
                      Visual learner
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#F0DE95] rounded-sm px-3 py-2">
                    <img src={speedIcon} alt="" className="w-4 h-6" />
                    <span className="text-[14px] font-[400] leading-[1.2] text-[#333333] font-dm-sans">
                      Movement helps
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#F0DE95] rounded-sm px-3 py-2">
                    <img src={musicIcon} alt="" className="w-4 h-6" />
                    <span className="text-[14px] font-[400] leading-[1.2] text-[#333333] font-dm-sans">
                      Better with sound cues
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="flex flex-col gap-6 px-4 mb-8">
              <div className="flex flex-col  gap-4 px-4">
                <h2 className="text-[18px] font-[600] leading-[1.2] text-[#3B3839] font-dm-sans">
                  About
                </h2>

                <div className="bg-[#F9F0CB] rounded-2xl p-3 w-full">
                  <p className="text-[14px] font-[400] leading-[1.4] text-[#3B3839] font-dm-sans italic">
                    "Arjun is a visual, hands-on learner who enjoys figuring out
                    patterns and building things. He's naturally curious and
                    creative. He understands best when you show him first,
                    explain simply"
                  </p>
                </div>
              </div>

              {/* Super Powers Section */}
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-[14px] px-4">
                  <h2 className="text-[18px] font-[600] leading-[1.2] text-[#3B3839] font-dm-sans">
                    Super powers
                  </h2>

                  <div className="flex flex-col items-center w-full relative">
                    {/* Background bars */}
                    <div className="flex justify-center gap-[44px] mb-2 z-10">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-[10px] h-[21px] bg-[#AF7723] rounded"
                        ></div>
                      ))}
                    </div>

                    {/* Super Powers Cards Container */}
                    <div className="w-full h-[180px] flex flex-col relative -mt-6">
                      {/* Main Super Powers Card */}
                      <div className="bg-[#F9F0CB] rounded-t-2xl p-6 pb-3 flex-1 ">
                        <div className="grid grid-cols-3 gap-3 h-full">
                          {superPowers.map((power) => (
                            <div
                              key={power.id}
                              className="flex flex-col items-center gap-2"
                            >
                              <div
                                className="w-full h-[87.67px] rounded-[11.535px] border-4 border-white flex items-center justify-center overflow-hidden"
                                style={{ backgroundColor: power.bgColor }}
                              >
                                {power.icon && (
                                  <img
                                    src={power.icon}
                                    alt={power.name}
                                    className={`${power.iconWidth || "w-160"} ${
                                      power.iconHeight || "h-160"
                                    } object-cover ${
                                      power.id === "pattern-spotter"
                                        ? "mt-6"
                                        : ""
                                    }`}
                                  />
                                )}
                              </div>
                              <span className="text-[12px] font-[600] leading-[1.302] text-center text-[#3D3B3B] font-dm-sans">
                                {power.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expandable indicator */}
                      <div
                        className="bg-[#F5D75A] rounded-b-2xl px-4 py-3 flex items-center justify-center gap-1.5 -mt-1 relative"
                        style={{
                          boxShadow: "0px 6px 0px 0px rgba(221, 164, 57, 1)",
                        }}
                      >
                        <span className="text-[12px] font-[500] leading-[1.2] text-[#333333] font-dm-sans">
                          3/5
                        </span>
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <img
                            src={arrowDownIcon}
                            alt=""
                            className="w-[6.48px] h-[10.61px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insights Section */}
                <div className="flex flex-col gap-5 px-4 py-4">
                  <h2 className="text-[18px] font-[700] leading-[1.2] text-[#3B3839] font-heading">
                    Insights
                  </h2>

                  <div className="flex flex-col gap-3 w-full">
                    {insightCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex flex-col items-center gap-[15px] bg-[#F9F0CB] rounded-2xl p-2 h-[74px]"
                      >
                        <div className="flex items-center gap-3 w-full h-full">
                          <div className="w-[58px] h-full rounded-xl bg-cover bg-center flex-shrink-0">
                            <img
                              src={category.icon}
                              alt=""
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </div>

                          <div className="flex flex-col justify-center gap-2 flex-1">
                            <h3 className="text-[14px] font-[600] leading-[1.3] text-[#3B3839] font-dm-sans">
                              {category.title}
                            </h3>
                            <span className="text-[12px] font-[500] leading-[1.2] text-[#605E5E] font-heading">
                              {category.count}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleInsight(category.id)}
                            className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border-2 border-[#E6C84F]"
                            style={{
                              boxShadow: "0px 3px 0px 0px #F5D75A",
                            }}
                          >
                            <img
                              src={arrowDownIcon}
                              alt=""
                              className={`w-[7.78px] h-[12.73px] transition-transform ${
                                expandedInsights.includes(category.id)
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
