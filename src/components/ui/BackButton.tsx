import React from 'react';

interface BackButtonProps {
  onClick: () => void;
}

function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 left-6 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/40 rounded-full shadow-lg hover:bg-white/95 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-[#393738]"
      >
        <path 
          d="M19 12H5M12 19L5 12L12 5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default BackButton;
