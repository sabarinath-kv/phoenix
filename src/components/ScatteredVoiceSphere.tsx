import React from 'react';
import { motion } from 'framer-motion';

interface ScatteredVoiceSphereProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking' | 'text-mode';
  isBottom?: boolean;
  className?: string;
  isDarkTheme?: boolean;
}

export const ScatteredVoiceSphere: React.FC<ScatteredVoiceSphereProps> = ({
  state,
  isBottom = false,
  className = '',
  isDarkTheme = true,
}) => {
  // Theme-aware color palette
  const getStateColors = () => {
    const baseColors = {
      speaking: isDarkTheme 
        ? { primary: '#10b981', secondary: '#34d399', accent: '#6ee7b7' }
        : { primary: '#059669', secondary: '#10b981', accent: '#34d399' },
      processing: isDarkTheme 
        ? { primary: '#f59e0b', secondary: '#fbbf24', accent: '#fde68a' }
        : { primary: '#d97706', secondary: '#f59e0b', accent: '#fbbf24' },
      listening: isDarkTheme 
        ? { primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' }
        : { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
      'text-mode': isDarkTheme 
        ? { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' }
        : { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
      idle: isDarkTheme 
        ? { primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' }
        : { primary: '#4b5563', secondary: '#6b7280', accent: '#9ca3af' },
    };

    return baseColors[state] || baseColors.idle;
  };

  const colors = getStateColors();
  const isActive = state !== 'idle';

  // Generate scattered particles in organic, natural positions
  const generateScatteredPositions = (count: number, radius: number) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      // Use golden ratio for natural distribution
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const theta = i * goldenAngle;
      const r = Math.sqrt(i / count) * radius;
      
      // Add some organic randomness
      const randomOffset = (Math.random() - 0.5) * 20;
      const x = Math.cos(theta) * (r + randomOffset);
      const y = Math.sin(theta) * (r + randomOffset);
      
      positions.push({ x, y, angle: theta, radius: r });
    }
    return positions;
  };

  const outerParticles = generateScatteredPositions(250, 140);
  const middleParticles = generateScatteredPositions(180, 100);
  const innerParticles = generateScatteredPositions(120, 60);
  const coreParticles = generateScatteredPositions(80, 30);
  const microParticles = generateScatteredPositions(100, 180); // Extra fine particles

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        y: isBottom ? 200 : 0,
        scale: isBottom ? 0.6 : 1,
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 120,
        duration: 1.2,
      }}
    >
      <div className="relative w-80 h-80 flex items-center justify-center">
        
        {/* Micro particles - finest layer */}
        {microParticles.map((particle, i) => (
          <motion.div
            key={`micro-${i}`}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${particle.x}px, ${particle.y}px)`,
              backgroundColor: colors.accent,
              width: Math.random() * 0.8 + 0.3,
              height: Math.random() * 0.8 + 0.3,
            }}
            animate={isActive ? {
              scale: [1, 1.2 + Math.random() * 0.3, 1],
              opacity: [0.2, 0.6, 0.2],
            } : {
              scale: 1,
              opacity: 0.1,
            }}
            transition={{
              duration: state === 'speaking' ? 2 + Math.random() * 0.8 : 
                       state === 'processing' ? 2.5 + Math.random() * 1.2 : 
                       3.5 + Math.random() * 1.5,
              repeat: Infinity,
              delay: i * 0.008,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Outer scattered particles */}
        {outerParticles.map((particle, i) => (
          <motion.div
            key={`outer-${i}`}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${particle.x}px, ${particle.y}px)`,
              backgroundColor: colors.accent,
              width: Math.random() * 1.5 + 0.5,
              height: Math.random() * 1.5 + 0.5,
            }}
            animate={isActive ? {
              scale: [1, 1.5 + Math.random() * 0.5, 1],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 360],
            } : {
              scale: 1,
              opacity: 0.2,
            }}
            transition={{
              duration: state === 'speaking' ? 1.5 + Math.random() * 0.5 : 
                       state === 'processing' ? 2 + Math.random() * 1 : 
                       3 + Math.random() * 1,
              repeat: Infinity,
              delay: i * 0.01,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Middle layer - more prominent particles */}
        {middleParticles.map((particle, i) => (
          <motion.div
            key={`middle-${i}`}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${particle.x}px, ${particle.y}px)`,
              backgroundColor: colors.secondary,
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
            }}
            animate={isActive ? {
              scale: [1, 2 + Math.random() * 0.8, 1],
              opacity: [0.4, 0.9, 0.4],
              x: [particle.x, particle.x + (Math.random() - 0.5) * 10, particle.x],
              y: [particle.y, particle.y + (Math.random() - 0.5) * 10, particle.y],
            } : {
              scale: 1,
              opacity: 0.3,
            }}
            transition={{
              duration: state === 'speaking' ? 1.2 + Math.random() * 0.3 : 
                       state === 'processing' ? 1.8 + Math.random() * 0.7 : 
                       2.5 + Math.random() * 0.8,
              repeat: Infinity,
              delay: i * 0.02,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Inner layer - larger, more visible particles */}
        {innerParticles.map((particle, i) => (
          <motion.div
            key={`inner-${i}`}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${particle.x}px, ${particle.y}px)`,
              backgroundColor: colors.primary,
              width: Math.random() * 3 + 1.5,
              height: Math.random() * 3 + 1.5,
              boxShadow: `0 0 ${Math.random() * 6 + 3}px ${colors.primary}40`,
            }}
            animate={isActive ? {
              scale: [1, 1.8 + Math.random() * 0.4, 1],
              opacity: [0.5, 1, 0.5],
              rotate: [0, Math.random() > 0.5 ? 180 : -180],
            } : {
              scale: 1,
              opacity: 0.4,
            }}
            transition={{
              duration: state === 'speaking' ? 0.8 + Math.random() * 0.4 : 
                       state === 'processing' ? 1.5 + Math.random() * 0.5 : 
                       2 + Math.random() * 0.6,
              repeat: Infinity,
              delay: i * 0.03,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Core particles - most prominent */}
        {coreParticles.map((particle, i) => (
          <motion.div
            key={`core-${i}`}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${particle.x}px, ${particle.y}px)`,
              backgroundColor: colors.primary,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              boxShadow: `0 0 ${Math.random() * 8 + 4}px ${colors.primary}60`,
            }}
            animate={isActive ? {
              scale: [1, 1.6 + Math.random() * 0.3, 1],
              opacity: [0.6, 1, 0.6],
              x: [particle.x, particle.x + (Math.random() - 0.5) * 15, particle.x],
              y: [particle.y, particle.y + (Math.random() - 0.5) * 15, particle.y],
            } : {
              scale: 1,
              opacity: 0.5,
            }}
            transition={{
              duration: state === 'speaking' ? 0.6 + Math.random() * 0.2 : 
                       state === 'processing' ? 1.2 + Math.random() * 0.3 : 
                       1.8 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.05,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Central core with blended cloud animation */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={isActive ? {
            scale: [1, 1.08, 1],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Outer ethereal glow - blends with particles */}
          <motion.div
            className="absolute w-16 h-16 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.primary}15 0%, ${colors.secondary}08 50%, transparent 70%)`,
            }}
            animate={isActive ? {
              scale: [1, 1.8, 1],
              opacity: [0.8, 0.3, 0.8],
            } : {
              scale: 1,
              opacity: 0.4,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Middle glow layer */}
          <motion.div
            className="absolute w-12 h-12 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.primary}25 0%, ${colors.secondary}15 60%, transparent 80%)`,
            }}
            animate={isActive ? {
              scale: [1, 1.4, 1],
              opacity: [0.6, 0.2, 0.6],
            } : {}}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          
          {/* Main core with enhanced blending */}
          <motion.div 
            className="w-10 h-10 rounded-full relative z-10"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${colors.accent}80 0%, ${colors.primary} 70%)`,
              boxShadow: `
                0 0 30px ${colors.primary}40,
                0 0 15px ${colors.secondary}30,
                inset 0 0 10px ${colors.secondary}20,
                inset 2px 2px 4px ${colors.accent}40
              `,
            }}
            animate={state === 'speaking' ? {
              scale: [1, 1.15, 1],
              boxShadow: [
                `0 0 30px ${colors.primary}40, 0 0 15px ${colors.secondary}30, inset 0 0 10px ${colors.secondary}20`,
                `0 0 45px ${colors.primary}60, 0 0 25px ${colors.secondary}50, inset 0 0 15px ${colors.secondary}30`,
                `0 0 30px ${colors.primary}40, 0 0 15px ${colors.secondary}30, inset 0 0 10px ${colors.secondary}20`
              ],
            } : state === 'processing' ? {
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            } : state === 'listening' ? {
              scale: [1, 1.02, 1],
            } : {}}
            transition={{
              duration: state === 'speaking' ? 1.2 : 
                       state === 'processing' ? 5 : 
                       state === 'listening' ? 2.8 : 3,
              repeat: Infinity,
              ease: state === 'processing' ? "linear" : "easeInOut",
            }}
          >
            {/* Multiple inner highlights for depth and grace */}
            <div 
              className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors.accent}90 0%, ${colors.accent}40 70%, transparent 100%)`,
              }}
            />
            <div 
              className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: colors.secondary,
                opacity: 0.4,
              }}
            />
          </motion.div>

          {/* Breathing particles around core - blend with main cloud */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * 2 * Math.PI;
            const radius = 25;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <motion.div
                key={`breath-${i}`}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(${x}px, ${y}px)`,
                  backgroundColor: colors.accent,
                  boxShadow: `0 0 6px ${colors.accent}60`,
                }}
                animate={isActive ? {
                  scale: [1, 1.8, 1],
                  opacity: [0.6, 0.9, 0.6],
                  x: [x, x * 1.3, x],
                  y: [y, y * 1.3, y],
                } : {
                  scale: 1,
                  opacity: 0.3,
                }}
                transition={{
                  duration: 3 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </motion.div>

        {/* Gentle pulse waves for speaking state */}
        {state === 'speaking' && (
          <>
            {[1, 2, 3].map((wave) => (
              <motion.div
                key={`wave-${wave}`}
                className="absolute inset-0 border rounded-full"
                style={{
                  borderColor: `${colors.primary}20`,
                  borderWidth: 1,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 2.5, 4],
                  opacity: [0.6, 0.2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: wave * 0.8,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        {/* Floating energy particles for processing */}
        {state === 'processing' && (
          <>
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={`energy-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: colors.accent,
                  left: '50%',
                  top: '50%',
                  boxShadow: `0 0 10px ${colors.accent}80`,
                }}
                animate={{
                  x: [0, Math.cos(i * Math.PI / 6) * 60],
                  y: [0, Math.sin(i * Math.PI / 6) * 60],
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
};
