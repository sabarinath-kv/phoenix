import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ParticleSystemProps {
  count?: number;
  position?: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
}

export const RoadDust = ({ 
  count = 80, 
  position = [0, 0, 0], 
  color = "#8D6E63",
  size = 0.04,
  speed = 0.1 
}: ParticleSystemProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Keep particles low to the ground
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = Math.random() * 0.5; // Very low height
      positions[i3 + 2] = (Math.random() - 0.5) * 4;
      
      // Ground-level movement only
      velocities[i3] = (Math.random() - 0.5) * speed * 0.2;
      velocities[i3 + 1] = 0; // No upward movement
      velocities[i3 + 2] = speed + Math.random() * speed * 0.4;
    }
    
    return [positions, velocities];
  }, [count, speed]);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Simple ground-level movement
        positions[i3] += velocities[i3];
        positions[i3 + 2] += velocities[i3 + 2];
        
        // Reset when particles go too far
        if (positions[i3 + 2] > 4) {
          positions[i3] = (Math.random() - 0.5) * 10;
          positions[i3 + 1] = Math.random() * 0.5;
          positions[i3 + 2] = -8;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0.3}
        vertexColors={false}
      />
    </Points>
  );
};

export const CollisionEffect = ({ 
  position, 
  trigger 
}: { 
  position: [number, number, number]; 
  trigger: boolean; 
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef(0);
  
  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(20 * 3);
    const velocities = new Float32Array(20 * 3);
    
    for (let i = 0; i < 20; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;
      
      // Simple horizontal spread
      const angle = (i / 20) * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = Math.random() * 0.5; // Minimal upward movement
      velocities[i3 + 2] = Math.sin(angle) * speed;
    }
    
    return [positions, velocities];
  }, []);

  useFrame((state) => {
    if (trigger && pointsRef.current) {
      if (startTime.current === 0) {
        startTime.current = state.clock.elapsedTime;
      }
      
      const elapsed = state.clock.elapsedTime - startTime.current;
      
      if (elapsed < 1) {
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        
        for (let i = 0; i < 20; i++) {
          const i3 = i * 3;
          
          positions[i3] += velocities[i3] * 0.02;
          positions[i3 + 1] += velocities[i3 + 1] * 0.02;
          positions[i3 + 2] += velocities[i3 + 2] * 0.02;
          
          velocities[i3] *= 0.95;
          velocities[i3 + 1] *= 0.95;
          velocities[i3 + 2] *= 0.95;
        }
        
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
    
    if (!trigger) {
      startTime.current = 0;
      if (pointsRef.current) {
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i++) {
          positions[i] = 0;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group position={position}>
      <Points ref={pointsRef} positions={positions}>
        <PointMaterial
          color="#FFD700"
          size={0.1}
          sizeAttenuation
          transparent
          opacity={trigger ? 0.6 : 0}
        />
      </Points>
      
      {/* Simple flash effect */}
      {trigger && (
        <pointLight 
          position={[0, 0, 0]} 
          intensity={2} 
          color="#FFD700" 
          distance={5}
          decay={2}
        />
      )}
    </group>
  );
};