import React from 'react';
import { PreloadedImage } from './LazyImage';
import wiglooImage from '../assets/images/wigloo-image.png';

interface WinglooIllustrationProps {
  isListening: boolean;
  className?: string;
}

export function WinglooIllustration({ isListening, className = "" }: WinglooIllustrationProps) {
  return (
    <div className={`flex items-center justify-center w-[300px] h-[300px] ${className}`}>
      {/* Container with relative positioning for animations */}
      <div className="relative flex items-center justify-center">
        {/* Animated background glow */}
        <div className={`absolute w-[400px] h-[400px] ''}`} />
        
        <img 
            src={wiglooImage} 
            alt="Wigloo listening"
            className="w-full h-full object-cover animate-cloud-float"
            onError={() => {
              // Fallback to CSS illustration if image fails to load
            
            }}
          />
        
        {/* Listening animation rings */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-white/30 animate-ping" style={{ animationDelay: '0s' }} />
            <div className="absolute w-[260px] h-[260px] rounded-full border-2 border-white/20 animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-white/10 animate-ping" style={{ animationDelay: '1s' }} />
          </div>
        )}
      </div>
    </div>
  );
}
