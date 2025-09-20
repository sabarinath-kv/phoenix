import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TerrainProps {
  position: [number, number, number];
  segment: number;
}

export const Terrain = ({ position, segment }: TerrainProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Move terrain toward camera
      meshRef.current.position.z += 0.2;
      
      // Reset position when it goes behind camera
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} receiveShadow>
      <planeGeometry args={[12, 10]} />
      <meshLambertMaterial color="#8B4513" />
      
      {/* Lane markers */}
      <mesh position={[-2, 0.01, 0]}>
        <planeGeometry args={[0.1, 10]} />
        <meshBasicMaterial color="#654321" />
      </mesh>
      <mesh position={[2, 0.01, 0]}>
        <planeGeometry args={[0.1, 10]} />
        <meshBasicMaterial color="#654321" />
      </mesh>
    </mesh>
  );
};