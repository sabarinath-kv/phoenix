import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Temple = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Slight parallax movement
      meshRef.current.position.z += 0.05;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Temple base */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 2, 2]} />
        <meshLambertMaterial color="#DAA520" />
      </mesh>
      
      {/* Temple roof */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[2, 1, 4]} />
        <meshLambertMaterial color="#B8860B" />
      </mesh>
      
      {/* Pillars */}
      <mesh position={[-1, 0.5, 1]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshLambertMaterial color="#F5DEB3" />
      </mesh>
      <mesh position={[1, 0.5, 1]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshLambertMaterial color="#F5DEB3" />
      </mesh>
    </group>
  );
};

export const Vegetation = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.1;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Palm tree trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Palm leaves */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
    </group>
  );
};