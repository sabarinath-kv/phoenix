import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, RoundedBox, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface PlayerProps {
  lane: number;
  isJumping: boolean;
  jumpStartTime: number;
  isSliding: boolean;
}

export const Player = ({ lane, isJumping, jumpStartTime, isSliding }: PlayerProps) => {
  const carRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const exhaustRef = useRef<THREE.Group>(null);
  
  const initialY = 0.3;
  const driveSpeed = 8;

  // Car materials
  const carBodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E74C3C', // Red sports car
    roughness: 0.2,
    metalness: 0.8,
  }), []);

  const wheelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2C3E50',
    roughness: 0.9,
    metalness: 0.1,
  }), []);

  const glassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#85C1E9',
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.1,
  }), []);

  const chromeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#BDC3C7',
    roughness: 0.1,
    metalness: 0.9,
  }), []);

  useFrame((state) => {
    if (carRef.current) {
      // Lane switching with faster interpolation for better collision detection
      const targetX = lane * 4;
      carRef.current.position.x = THREE.MathUtils.lerp(
        carRef.current.position.x,
        targetX,
        0.4  // Increased from 0.15 to 0.4 for faster lane switching
      );

      // Jumping mechanics (car going over ramps)
      if (isJumping) {
        const jumpTime = (Date.now() - jumpStartTime) / 600;
        const jumpHeight = Math.sin(jumpTime * Math.PI) * 1.5;
        carRef.current.position.y = THREE.MathUtils.lerp(
          carRef.current.position.y,
          initialY + jumpHeight,
          0.3
        );
        
        // Car tilts forward when jumping
        carRef.current.rotation.x = THREE.MathUtils.lerp(
          carRef.current.rotation.x,
          -0.2,
          0.2
        );
      } else if (isSliding) {
        // Car lowers (like going under barriers)
        carRef.current.position.y = THREE.MathUtils.lerp(
          carRef.current.position.y,
          initialY - 0.3,
          0.3
        );
      } else {
        // Return to normal position
        carRef.current.position.y = THREE.MathUtils.lerp(
          carRef.current.position.y,
          initialY,
          0.2
        );
        carRef.current.rotation.x = THREE.MathUtils.lerp(
          carRef.current.rotation.x,
          0,
          0.2
        );
      }

      // Driving animation
      const time = state.clock.elapsedTime * driveSpeed;
      
      // Subtle car body movement
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(time * 2) * 0.01;
      }
      
      // Wheel rotation
      if (wheelsRef.current) {
        wheelsRef.current.children.forEach((wheel) => {
          if (wheel instanceof THREE.Mesh) {
            wheel.rotation.x = time * 2;
          }
        });
      }

      // Exhaust smoke animation
      if (exhaustRef.current) {
        exhaustRef.current.rotation.y = Math.sin(time * 3) * 0.1;
      }
    }
  });

  return (
    <group ref={carRef} position={[0, initialY, 2]}>
      {/* Car body */}
      <group ref={bodyRef}>
        {/* Main car body */}
        <RoundedBox args={[1.8, 0.6, 4]} radius={0.1} castShadow>
          <primitive object={carBodyMaterial} />
        </RoundedBox>
        
        {/* Car roof */}
        <RoundedBox position={[0, 0.5, -0.2]} args={[1.6, 0.4, 2.2]} radius={0.15} castShadow>
          <primitive object={carBodyMaterial} />
        </RoundedBox>
        
        {/* Hood */}
        <RoundedBox position={[0, 0.1, 1.5]} args={[1.7, 0.3, 1]} radius={0.08} castShadow>
          <primitive object={carBodyMaterial} />
        </RoundedBox>
        
        {/* Trunk */}
        <RoundedBox position={[0, 0.1, -1.8]} args={[1.7, 0.3, 0.8]} radius={0.08} castShadow>
          <primitive object={carBodyMaterial} />
        </RoundedBox>
      </group>

      {/* Windows */}
      <group>
        {/* Windshield */}
        <RoundedBox position={[0, 0.6, 0.8]} args={[1.5, 0.4, 0.05]} radius={0.05} castShadow>
          <primitive object={glassMaterial} />
        </RoundedBox>
        
        {/* Rear window */}
        <RoundedBox position={[0, 0.6, -1.2]} args={[1.5, 0.4, 0.05]} radius={0.05} castShadow>
          <primitive object={glassMaterial} />
        </RoundedBox>
        
        {/* Side windows */}
        <RoundedBox position={[0.8, 0.6, -0.2]} args={[0.05, 0.4, 1.8]} radius={0.02} castShadow>
          <primitive object={glassMaterial} />
        </RoundedBox>
        <RoundedBox position={[-0.8, 0.6, -0.2]} args={[0.05, 0.4, 1.8]} radius={0.02} castShadow>
          <primitive object={glassMaterial} />
        </RoundedBox>
      </group>

      {/* Wheels */}
      <group ref={wheelsRef}>
        {/* Front wheels */}
        <Cylinder position={[-0.7, -0.2, 1.3]} args={[0.3, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <primitive object={wheelMaterial} />
        </Cylinder>
        <Cylinder position={[0.7, -0.2, 1.3]} args={[0.3, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <primitive object={wheelMaterial} />
        </Cylinder>
        
        {/* Rear wheels */}
        <Cylinder position={[-0.7, -0.2, -1.3]} args={[0.3, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <primitive object={wheelMaterial} />
        </Cylinder>
        <Cylinder position={[0.7, -0.2, -1.3]} args={[0.3, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <primitive object={wheelMaterial} />
        </Cylinder>
        
        {/* Wheel rims */}
        <Cylinder position={[-0.7, -0.2, 1.3]} args={[0.15, 0.15, 0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <primitive object={chromeMaterial} />
        </Cylinder>
        <Cylinder position={[0.7, -0.2, 1.3]} args={[0.15, 0.15, 0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <primitive object={chromeMaterial} />
        </Cylinder>
        <Cylinder position={[-0.7, -0.2, -1.3]} args={[0.15, 0.15, 0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <primitive object={chromeMaterial} />
        </Cylinder>
        <Cylinder position={[0.7, -0.2, -1.3]} args={[0.15, 0.15, 0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <primitive object={chromeMaterial} />
        </Cylinder>
      </group>

      {/* Headlights */}
      <Sphere position={[-0.6, 0.1, 2.1]} args={[0.15]} castShadow>
        <meshBasicMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere position={[0.6, 0.1, 2.1]} args={[0.15]} castShadow>
        <meshBasicMaterial color="#FFFFFF" />
      </Sphere>
      
      {/* Taillights */}
      <Sphere position={[-0.6, 0.1, -2.1]} args={[0.12]} castShadow>
        <meshBasicMaterial color="#FF0000" />
      </Sphere>
      <Sphere position={[0.6, 0.1, -2.1]} args={[0.12]} castShadow>
        <meshBasicMaterial color="#FF0000" />
      </Sphere>

      {/* Grille */}
      <RoundedBox position={[0, 0, 2.05]} args={[1.4, 0.3, 0.05]} radius={0.02} castShadow>
        <primitive object={chromeMaterial} />
      </RoundedBox>
      
      {/* Grille bars */}
      {Array.from({ length: 5 }, (_, i) => (
        <RoundedBox
          key={i}
          position={[-0.5 + i * 0.25, 0, 2.08]}
          args={[0.02, 0.25, 0.02]}
          radius={0.01}
          castShadow
        >
          <primitive object={chromeMaterial} />
        </RoundedBox>
      ))}

      {/* License plate */}
      <RoundedBox position={[0, -0.15, 2.05]} args={[0.6, 0.15, 0.02]} radius={0.01} castShadow>
        <meshStandardMaterial color="#FFFFFF" />
      </RoundedBox>

      {/* Side mirrors */}
      <RoundedBox position={[-0.9, 0.4, 0.5]} args={[0.08, 0.06, 0.12]} radius={0.02} castShadow>
        <primitive object={chromeMaterial} />
      </RoundedBox>
      <RoundedBox position={[0.9, 0.4, 0.5]} args={[0.08, 0.06, 0.12]} radius={0.02} castShadow>
        <primitive object={chromeMaterial} />
      </RoundedBox>

      {/* Exhaust pipes */}
      <group ref={exhaustRef}>
        <Cylinder position={[-0.3, -0.3, -2.2]} args={[0.06, 0.06, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <primitive object={chromeMaterial} />
        </Cylinder>
        <Cylinder position={[0.3, -0.3, -2.2]} args={[0.06, 0.06, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <primitive object={chromeMaterial} />
        </Cylinder>
      </group>

      {/* Car lighting effects */}
      <pointLight position={[0, 0.5, 2]} intensity={0.5} color="#FFFFFF" distance={8} />
      <pointLight position={[0, 0, -2]} intensity={0.3} color="#FF0000" distance={4} />
    </group>
  );
};