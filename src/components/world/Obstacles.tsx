import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface ObstacleProps {
  position: [number, number, number];
  type: 'rock' | 'tree' | 'wall' | 'spike' | 'crystal';
  onCollision: () => void;
}

export const Obstacle = ({ position, type, onCollision }: ObstacleProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hasCollided, setHasCollided] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Move obstacle toward camera
      meshRef.current.position.z += 0.2;
      
      // Floating animation for crystals
      if (type === 'crystal') {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        meshRef.current.rotation.y = state.clock.elapsedTime;
      }
      
      // Check collision with player (lane position based)
      if (meshRef.current.position.z > 1.5 && meshRef.current.position.z < 3 && !hasCollided) {
        const playerLaneX = 0; // This should come from parent component
        const obstacleX = meshRef.current.position.x;
        if (Math.abs(obstacleX - playerLaneX) < 1.5) {
          setHasCollided(true);
          onCollision();
        }
      }
      
      // Remove when behind camera
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
        setHasCollided(false);
      }
    }
  });

  const renderObstacle = () => {
    switch (type) {
      case 'rock':
        return (
          <group>
            <Sphere args={[0.8]} castShadow>
              <meshStandardMaterial color="#666" roughness={0.9} metalness={0.1} />
            </Sphere>
            <Sphere position={[0.3, 0.2, 0.2]} args={[0.4]} castShadow>
              <meshStandardMaterial color="#555" roughness={0.9} metalness={0.1} />
            </Sphere>
          </group>
        );
      
      case 'tree':
        return (
          <group>
            {/* Trunk */}
            <Cylinder position={[0, 1, 0]} args={[0.3, 0.4, 2]} castShadow>
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </Cylinder>
            {/* Leaves */}
            <Sphere position={[0, 2.5, 0]} args={[1.2]} castShadow>
              <meshStandardMaterial color="#228B22" roughness={0.7} />
            </Sphere>
            <Sphere position={[-0.3, 2.8, 0.2]} args={[0.8]} castShadow>
              <meshStandardMaterial color="#32CD32" roughness={0.7} />
            </Sphere>
          </group>
        );
      
      case 'wall':
        return (
          <Box args={[1.5, 2.5, 0.5]} castShadow>
            <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.2} />
          </Box>
        );
      
      case 'spike':
        return (
          <group>
            <Cylinder args={[0.1, 0.4, 1.5]} castShadow>
              <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
            </Cylinder>
            <Cylinder position={[0.3, 0, 0.2]} args={[0.1, 0.3, 1.2]} castShadow>
              <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
            </Cylinder>
            <Cylinder position={[-0.2, 0, -0.1]} args={[0.1, 0.35, 1.3]} castShadow>
              <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
            </Cylinder>
          </group>
        );
      
      case 'crystal':
        return (
          <group>
            <Box args={[0.6, 1.5, 0.6]} castShadow>
              <meshPhysicalMaterial 
                color="#FF69B4" 
                transparent 
                opacity={0.8} 
                roughness={0.1} 
                metalness={0.9}
                transmission={0.5}
                thickness={0.5}
              />
            </Box>
            {/* Glow effect */}
            <pointLight position={[0, 0.5, 0]} intensity={0.5} color="#FF69B4" distance={5} />
          </group>
        );
      
      default:
        return (
          <Box args={[1, 1, 1]} castShadow>
            <meshStandardMaterial color="#FF0000" />
          </Box>
        );
    }
  };

  return (
    <group ref={meshRef} position={position}>
      {renderObstacle()}
    </group>
  );
};