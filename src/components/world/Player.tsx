import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Text3D, Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface PlayerProps {
  lane: number;
  isJumping: boolean;
  jumpStartTime: number;
  isSliding: boolean;
}

export const Player = ({ lane, isJumping, jumpStartTime, isSliding }: PlayerProps) => {
  const playerRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  
  const initialY = 1;
  const runSpeed = 8; // Animation speed

  useFrame((state) => {
    if (playerRef.current) {
      // Smooth lane transition
      playerRef.current.position.x = THREE.MathUtils.lerp(
        playerRef.current.position.x,
        lane * 4,
        0.15
      );

      // Handle jumping
      if (isJumping) {
        const elapsed = Date.now() - jumpStartTime;
        const progress = Math.min(elapsed / 600, 1);
        const jumpHeight = Math.sin(progress * Math.PI) * 2.5;
        playerRef.current.position.y = initialY + jumpHeight;
        
        // Jump animation - rotate slightly
        playerRef.current.rotation.x = -progress * 0.3;
      } else if (isSliding) {
        // Sliding pose
        playerRef.current.position.y = THREE.MathUtils.lerp(
          playerRef.current.position.y,
          initialY - 0.5,
          0.2
        );
        playerRef.current.rotation.x = THREE.MathUtils.lerp(
          playerRef.current.rotation.x,
          0.3,
          0.2
        );
      } else {
        // Normal running
        playerRef.current.position.y = THREE.MathUtils.lerp(
          playerRef.current.position.y,
          initialY,
          0.2
        );
        playerRef.current.rotation.x = THREE.MathUtils.lerp(
          playerRef.current.rotation.x,
          0,
          0.2
        );
      }

      // Running animation
      const time = state.clock.elapsedTime * runSpeed;
      
      if (bodyRef.current) {
        bodyRef.current.rotation.y = Math.sin(time) * 0.1;
      }
      
      // Arm swinging
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time) * 0.8;
        rightArmRef.current.rotation.x = -Math.sin(time) * 0.8;
      }
      
      // Leg movement
      if (leftLegRef.current && rightLegRef.current && !isJumping) {
        leftLegRef.current.rotation.x = Math.sin(time + Math.PI) * 0.6;
        rightLegRef.current.rotation.x = Math.sin(time) * 0.6;
      }
      
      // Head bobbing
      if (headRef.current) {
        headRef.current.position.y = Math.sin(time * 2) * 0.05;
      }
    }
  });

  return (
    <group ref={playerRef} position={[0, initialY, 2]}>
      {/* Main body */}
      <group ref={bodyRef}>
        <Cylinder args={[0.35, 0.45, 1.2]} castShadow>
          <meshStandardMaterial color="#FF6B6B" roughness={0.8} />
        </Cylinder>
        
        {/* Head */}
        <Sphere ref={headRef} position={[0, 0.9, 0]} args={[0.35]} castShadow>
          <meshStandardMaterial color="#FFB6C1" roughness={0.7} />
        </Sphere>
        
        {/* Eyes */}
        <Sphere position={[-0.15, 0.95, 0.25]} args={[0.08]} castShadow>
          <meshStandardMaterial color="#000" />
        </Sphere>
        <Sphere position={[0.15, 0.95, 0.25]} args={[0.08]} castShadow>
          <meshStandardMaterial color="#000" />
        </Sphere>
        
        {/* Arms */}
        <group ref={leftArmRef} position={[-0.5, 0.3, 0]}>
          <Cylinder args={[0.12, 0.15, 0.8]} castShadow>
            <meshStandardMaterial color="#FFB6C1" roughness={0.8} />
          </Cylinder>
        </group>
        
        <group ref={rightArmRef} position={[0.5, 0.3, 0]}>
          <Cylinder args={[0.12, 0.15, 0.8]} castShadow>
            <meshStandardMaterial color="#FFB6C1" roughness={0.8} />
          </Cylinder>
        </group>
        
        {/* Legs */}
        <group ref={leftLegRef} position={[-0.2, -0.8, 0]}>
          <Cylinder args={[0.15, 0.18, 0.9]} castShadow>
            <meshStandardMaterial color="#4169E1" roughness={0.8} />
          </Cylinder>
          {/* Foot */}
          <Box position={[0, -0.6, 0.2]} args={[0.3, 0.1, 0.5]} castShadow>
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </Box>
        </group>
        
        <group ref={rightLegRef} position={[0.2, -0.8, 0]}>
          <Cylinder args={[0.15, 0.18, 0.9]} castShadow>
            <meshStandardMaterial color="#4169E1" roughness={0.8} />
          </Cylinder>
          {/* Foot */}
          <Box position={[0, -0.6, 0.2]} args={[0.3, 0.1, 0.5]} castShadow>
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </Box>
        </group>
      </group>
      
      {/* Trail effect */}
      <pointLight position={[0, 0, -1]} intensity={0.3} color="#FFD700" distance={3} />
    </group>
  );
};