import React from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface GameTimerProps {
  timeLeft: number;
  totalTime: number;
  className?: string;
}

export const GameTimer: React.FC<GameTimerProps> = ({ 
  timeLeft, 
  totalTime, 
  className = "" 
}) => {
  const progressPercentage = (timeLeft / totalTime) * 100;
  const isLowTime = timeLeft <= 10;

  return (
    <motion.div 
      className={`bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-orange-200 ${className}`}
      animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-orange-700">⏰ Time Left</span>
        <motion.span 
          className={`text-2xl font-bold ${isLowTime ? 'text-red-600' : 'text-orange-700'}`}
          animate={isLowTime ? { color: ['#dc2626', '#ef4444', '#dc2626'] } : {}}
          transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
        >
          {timeLeft}s
        </motion.span>
      </div>
      <div className={`w-full h-3 rounded-full overflow-hidden ${isLowTime ? 'bg-red-100' : 'bg-orange-100'}`}>
        <motion.div
          className={`h-full rounded-full ${isLowTime ? 'bg-red-500' : 'bg-orange-400'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};
