import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface GameCardProps {
  content: string | React.ReactNode;
  onClick: () => void;
  isCorrect?: boolean | null;
  isSelected?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const GameCard: React.FC<GameCardProps> = ({
  content,
  onClick,
  isCorrect = null,
  isSelected = false,
  disabled = false,
  className = "",
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'w-24 h-24 text-2xl',
    medium: 'w-32 h-32 text-4xl',
    large: 'w-40 h-40 text-6xl'
  };

  const getCardStyle = () => {
    if (isCorrect === true) {
      return 'bg-gradient-to-br from-green-200 to-green-300 border-green-400 text-green-800';
    }
    if (isCorrect === false) {
      return 'bg-gradient-to-br from-red-200 to-red-300 border-red-400 text-red-800';
    }
    if (isSelected) {
      return 'bg-gradient-to-br from-blue-200 to-blue-300 border-blue-400 text-blue-800';
    }
    return 'bg-gradient-to-br from-white to-gray-50 border-gray-200 text-gray-800 hover:from-purple-50 hover:to-purple-100 hover:border-purple-300';
  };

  const cardVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    shake: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    },
    success: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.6 }
    }
  };

  const getAnimationState = () => {
    if (isCorrect === true) return 'success';
    if (isCorrect === false) return 'shake';
    return 'idle';
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      animate={getAnimationState()}
      whileHover={!disabled ? "hover" : "idle"}
      whileTap={!disabled ? "tap" : "idle"}
      className="cursor-pointer"
    >
      <Card
        className={`
          ${sizeClasses[size]} 
          ${getCardStyle()} 
          ${className}
          flex items-center justify-center font-bold border-4 shadow-lg
          transition-all duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        onClick={!disabled ? onClick : undefined}
      >
        <div className="text-center">
          {content}
        </div>
      </Card>

      {/* Confetti effect for correct answers */}
      {isCorrect === true && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{
                x: '50%',
                y: '50%',
                scale: 0
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`,
                scale: [0, 1, 0],
                rotate: 360
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
