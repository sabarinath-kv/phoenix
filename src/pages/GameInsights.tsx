import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Import game insights image
import gameInsightsImage from "@/assets/images/game-insights.png";
import result1Image from "@/assets/images/result1.png";

export const GameInsights = () => {

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#F0F0F0' }}>

      {/* Container with margin */}
      <div className="p-4">
        {/* Game Insights Background Container */}
        <div 
          className="w-full overflow-hidden relative"
          style={{ 
            borderRadius: '24px',
            backgroundImage: `url(${result1Image})`,
            backgroundSize: 'contain',
            backgroundPosition: 'top',
            backgroundRepeat: 'no-repeat',
            minHeight: 'calc(100vh - 32px)' // Full height minus padding
          }}
        >
          {/* Result1 Image - Absolute positioned */}
          <img 
            src={gameInsightsImage} 
            alt="Result 1"
            className="absolute w-full h-full"
            style={{ zIndex: 10 }}
          />

          {/* Centered text */}
          <div className="absolute px-6 w-full text-center" style={{ 
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            fontFamily: 'Replay Pro',
            fontSize: '34px',
            lineHeight: '100%',
            letterSpacing: '0px'
          }}>
            <span style={{ 
              fontWeight: 400,
              fontStyle: 'italic'
            }}>Arjun </span>
            <span style={{ fontWeight: 400 }}>gave his </span>
            <span style={{ 
              fontWeight: 400,
              fontStyle: 'italic'
            }}>best </span>
            <span style={{ fontWeight: 400 }}>to complete the games</span>
          </div>

          {/* Empty content div to maintain height */}
          <div className="w-full h-full" style={{ minHeight: 'calc(100vh - 32px)' }}>
            {/* Content can be added here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};