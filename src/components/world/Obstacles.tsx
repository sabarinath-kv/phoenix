import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ObstacleProps {
  position: [number, number, number];
  type: 'rock' | 'tree' | 'wall';
  onCollision: () => void;
}

export const Obstacle = ({ position, type, onCollision }: ObstacleProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Move obstacle toward camera
      meshRef.current.position.z += 0.2;
      
      // Check collision with player (simple distance check)
      if (meshRef.current.position.z > 2 && meshRef.current.position.z < 4) {
        if (Math.abs(meshRef.current.position.x) < 1) {
          onCollision();
        }
      }
      
      // Remove when behind camera
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'rock':
        return <sphereGeometry args={[0.8, 8, 6]} />;
      case 'tree':
        return <cylinderGeometry args={[0.3, 0.5, 2, 8]} />;
      case 'wall':
        return <boxGeometry args={[1.5, 2, 0.5]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'rock':
        return '#666666';
      case 'tree':
        return '#228B22';
      case 'wall':
        return '#8B4513';
      default:
        return '#FF0000';
    }
  };

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {getGeometry()}
      <meshLambertMaterial color={getColor()} />
    </mesh>
  );
};