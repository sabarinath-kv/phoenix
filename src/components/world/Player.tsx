import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  lane: number; // -1, 0, 1 for left, center, right
  isJumping: boolean;
  jumpStartTime: number;
}

export const Player = ({ lane, isJumping, jumpStartTime }: PlayerProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = 1;

  useFrame((state) => {
    if (meshRef.current) {
      // Update lane position
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        lane * 4, // Lane spacing
        0.1
      );

      // Handle jumping
      if (isJumping) {
        const elapsed = Date.now() - jumpStartTime;
        const progress = Math.min(elapsed / 600, 1); // 600ms jump duration
        const jumpHeight = Math.sin(progress * Math.PI) * 2; // Arc motion
        meshRef.current.position.y = initialY + jumpHeight;
      } else {
        meshRef.current.position.y = THREE.MathUtils.lerp(
          meshRef.current.position.y,
          initialY,
          0.1
        );
      }

      // Slight running animation
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 10) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, initialY, 2]} castShadow>
      <capsuleGeometry args={[0.4, 1]} />
      <meshLambertMaterial color="#FF6B6B" />
      
      {/* Simple head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshLambertMaterial color="#FFB6C1" />
      </mesh>
    </mesh>
  );
};