import React from "react";
import plan from '@/assets/images/plan.png';
import { PreloadedImage } from "@/components/LazyImage";
import { useNavigate } from "react-router-dom";

const TutorialIntro = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <PreloadedImage src={plan} alt="plan" className="w-full h-full" />
      <button
        onClick={() => {
          navigate('/new-homepage')
        }}
        className="w-full py-4 mt-20 rounded-full text-[#333333] font-bold text-lg shadow-lg hover:shadow-xl transition-shadow bg-[#FFD934]"
        style={{
          boxShadow: '0px 6px 0px 4px #FAAD61'
        }}
      >
        CONTINUE
      </button>
    </div>
  );
};

export default TutorialIntro;
