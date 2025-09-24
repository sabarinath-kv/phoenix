import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/api/apis";
import aibgImage from '@/assets/images/aibg.png';
import { Button } from "@/components/ui/button";


export const EndChat = () => {
  const navigate = useNavigate();

  const { user } = useAuth();
 

  return (
    <div className={`flex flex-col mobile-full-screen overflow-hidden transition-all duration-500 ease-in-out`}>
      {/* Background Layer with Flex Positioning */}
      <div className="flex-1 flex flex-col relative">
        {/* Decorative Background Elements */}
        <BackgroundEffects />
         
        {/* Back Button - Only show on main page, not in chat mode */}
        
        {/* Main Content Container */}
        <div className="flex-1 flex flex-col p-4 safe-area-inset relative z-10">
          {/* Main Content Area - Moved to top */}
          <div className="flex flex-col items-center justify-center pt-[120px] space-y-6 flex-shrink-0">
            <div className="relative w-full">
              <div className={`transition-all duration-300s`}>
                <MainContent aiTranscript={`Based on what you told me, I've selected  the some games for ${user.metadata?.voice_assessment?.summary?.child_name ?? "your child"}. `} />
              </div>
            </div>
          </div>

          {/* Spacer to push button to bottom */}
          <div className="flex-1" />

          {/* Bottom Button */}
          <div className="flex justify-center pb-8">
            <Button 
              onClick={() =>    navigate("/game-redirect", {
                state: {
                  gameClass: "ADHD",
                  completedGames: [],
                }
              })}
              className="w-full m-4 rounded-full px-6 py-7 text-white font-semibold text-sm tracking-wider border transition-all duration-300"
              style={{
                backgroundColor: '#0957D0',
                borderColor: '#083376',
                borderWidth: '1px',
                boxShadow: '0px 3px 0px 3px #083376',
                letterSpacing: '2.86%'
              }}
            >LET'S START</Button>
          </div>
        </div>
      </div>
    </div>
  )
};

function MainContent({ aiTranscript }: { aiTranscript: string }) {
  return (
    <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto px-4 mt-[200px]">
      {/* Main Content Container */}
      <div className="flex flex-col items-center space-y-4 text-center">
        {/* Welcome Message */}
        <div className="flex flex-col space-y-4 px-1">
          <h1 className="text-[#393738] text-[29px] text-left font-normal leading-[40px] font-['Replay_Pro']">
          {aiTranscript}
         <div className="h-5" />
          {"It's designed specifically for kids who need movement while learning."}
          </h1>
        </div>
       
      </div>
    </div>
  );
}


function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden m-4 rounded-[24px] border border-[#E0D0BB80] transition-all duration-500 ease-in-out">
     
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out" style={{ backgroundImage: `url(${aibgImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30 backdrop-blur-[2px]" />
        </div>
    </div>
  );
}


export default EndChat;
