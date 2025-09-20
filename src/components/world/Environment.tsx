import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Text3D, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const Temple = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.05;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Temple base */}
      <Box position={[0, 1.5, 0]} args={[4, 3, 3]} castShadow>
        <meshStandardMaterial color="#DAA520" roughness={0.7} metalness={0.3} />
      </Box>
      
      {/* Temple roof */}
      <Box position={[0, 3.2, 0]} args={[5, 0.4, 4]} castShadow>
        <meshStandardMaterial color="#B8860B" roughness={0.6} metalness={0.4} />
      </Box>
      
      {/* Pillars */}
      {[-1.5, 1.5].map((x, i) => (
        <Cylinder key={i} position={[x, 1, 1.5]} args={[0.15, 0.15, 2]} castShadow>
          <meshStandardMaterial color="#F5DEB3" roughness={0.8} />
        </Cylinder>
      ))}
      
      {/* Decorative elements */}
      <Sphere position={[0, 4, 0]} args={[0.3]} castShadow>
        <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.8} />
      </Sphere>
      
      {/* Temple entrance */}
      <Box position={[0, 0.8, 1.6]} args={[1.5, 1.6, 0.1]} castShadow>
        <meshStandardMaterial color="#2F4F4F" />
      </Box>
      
      {/* Mystical glow */}
      <pointLight position={[0, 2, 2]} intensity={0.8} color="#FFD700" distance={15} />
    </group>
  );
};

export const Vegetation = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.1;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
      
      // Sway animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Palm tree trunk */}
      <Cylinder position={[0, 1.5, 0]} args={[0.25, 0.35, 3]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </Cylinder>
      
      {/* Palm leaves */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 1.5;
        const z = Math.sin(angle) * 1.5;
        return (
          <Box
            key={i}
            position={[x, 3.5, z]}
            args={[0.3, 2, 0.1]}
            rotation={[0, angle, Math.PI / 6]}
            castShadow
          >
            <meshStandardMaterial color="#228B22" roughness={0.8} />
          </Box>
        );
      })}
      
      {/* Coconuts */}
      <Sphere position={[0.5, 2.8, 0.3]} args={[0.2]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </Sphere>
      <Sphere position={[-0.3, 2.9, 0.2]} args={[0.18]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </Sphere>
    </group>
  );
};

export const MysticalOrb = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.08;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Sphere args={[0.8]} castShadow>
        <meshPhysicalMaterial
          color="#9370DB"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.9}
          transmission={0.6}
          thickness={0.5}
        />
      </Sphere>
      
      {/* Inner glow */}
      <Sphere args={[0.4]}>
        <meshBasicMaterial color="#DDA0DD" transparent opacity={0.6} />
      </Sphere>
      
      {/* Magical particles effect */}
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#9370DB" distance={8} />
    </group>
  );
};

export const AncientRunes = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.03;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Box args={[2, 3, 0.3]} castShadow>
        <meshStandardMaterial color="#696969" roughness={0.9} />
      </Box>
      
      {/* Glowing runes */}
      {Array.from({ length: 4 }, (_, i) => (
        <Box
          key={i}
          position={[0, 1 - i * 0.5, 0.16]}
          args={[0.3, 0.3, 0.02]}
        >
          <meshBasicMaterial color="#00FFFF" transparent opacity={0.8} />
        </Box>
      ))}
      
      <pointLight position={[0, 0, 0.5]} intensity={0.5} color="#00FFFF" distance={3} />
    </group>
  );
};