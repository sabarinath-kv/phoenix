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

export const DustParticles = ({ 
  count = 100, 
  position = [0, 0, 0], 
  color = "#D2B48C",
  size = 0.05,
  speed = 0.1 
}: ParticleSystemProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random positions around the player
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = Math.random() * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 5;
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * speed;
      velocities[i3 + 1] = Math.random() * speed * 0.5;
      velocities[i3 + 2] = speed + Math.random() * speed;
    }
    
    return [positions, velocities];
  }, [count, speed]);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Update positions
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];
        
        // Reset particles when they go too far
        if (positions[i3 + 2] > 5) {
          positions[i3] = (Math.random() - 0.5) * 10;
          positions[i3 + 1] = Math.random() * 2;
          positions[i3 + 2] = -10;
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
        opacity={0.6}
        vertexColors={false}
      />
    </Points>
  );
};

export const MagicalSparkles = ({ 
  count = 50, 
  position = [0, 0, 0], 
  color = "#FFD700" 
}: ParticleSystemProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spiral pattern
      const angle = (i / count) * Math.PI * 4;
      const radius = 2 + Math.sin(angle) * 0.5;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle * 2) * 3 + 2;
      positions[i3 + 2] = Math.sin(angle) * radius;
    }
    
    return positions;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      
      // Floating animation
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time * 2 + i * 0.1) * 0.01;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      <Points ref={pointsRef} positions={positions}>
        <PointMaterial
          color={color}
          size={0.1}
          sizeAttenuation
          transparent
          opacity={0.8}
        />
      </Points>
    </group>
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
  
  const positions = useMemo(() => {
    const positions = new Float32Array(30 * 3);
    
    for (let i = 0; i < 30; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (trigger && pointsRef.current) {
      if (startTime.current === 0) {
        startTime.current = state.clock.elapsedTime;
      }
      
      const elapsed = state.clock.elapsedTime - startTime.current;
      
      if (elapsed < 1) {
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        
        for (let i = 0; i < 30; i++) {
          const i3 = i * 3;
          const angle = (i / 30) * Math.PI * 2;
          const speed = elapsed * 5;
          
          positions[i3] = Math.cos(angle) * speed;
          positions[i3 + 1] = Math.sin(angle) * speed + Math.sin(elapsed * 10) * 0.5;
          positions[i3 + 2] = Math.sin(angle * 2) * speed;
        }
        
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
    
    if (!trigger) {
      startTime.current = 0;
    }
  });

  return (
    <group position={position}>
      <Points ref={pointsRef} positions={positions}>
        <PointMaterial
          color="#FF4500"
          size={0.15}
          sizeAttenuation
          transparent
          opacity={trigger ? 0.8 : 0}
        />
      </Points>
    </group>
  );
};