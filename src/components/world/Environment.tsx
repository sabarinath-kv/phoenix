import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, RoundedBox, Torus, Cone } from '@react-three/drei';
import * as THREE from 'three';

export const Building = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);
  const windowLightsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.05;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }

    // Animated window lights
    if (windowLightsRef.current) {
      const time = state.clock.elapsedTime;
      windowLightsRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = 0.6 + Math.sin(time * 2 + i * 0.5) * 0.4;
        }
      });
    }
  });

  const buildingHeight = 8 + Math.random() * 12;
  const buildingWidth = 3 + Math.random() * 2;

  return (
    <group ref={meshRef} position={position}>
      {/* Main building structure */}
      <RoundedBox position={[0, buildingHeight / 2, 0]} args={[buildingWidth, buildingHeight, 3]} radius={0.1} castShadow>
        <meshStandardMaterial color="#7F8C8D" roughness={0.8} metalness={0.2} />
      </RoundedBox>
      
      {/* Building windows */}
      <group ref={windowLightsRef}>
        {Array.from({ length: Math.floor(buildingHeight / 2) }, (_, floor) => 
          Array.from({ length: Math.floor(buildingWidth) }, (_, col) => {
            const windowX = -buildingWidth / 2 + 0.5 + col * (buildingWidth / Math.floor(buildingWidth));
            const windowY = 1 + floor * 2;
            const isLit = Math.random() > 0.3;
            return (
              <RoundedBox
                key={`${floor}-${col}`}
                position={[windowX, windowY, 1.51]}
                args={[0.4, 0.6, 0.02]}
                radius={0.02}
                castShadow
              >
                <meshBasicMaterial 
                  color={isLit ? "#FFE135" : "#2C3E50"} 
                  transparent 
                  opacity={isLit ? 0.8 : 0.3}
                />
              </RoundedBox>
            );
          })
        )}
      </group>
      
      {/* Building entrance */}
      <RoundedBox position={[0, 1, 1.52]} args={[1, 2, 0.1]} radius={0.05} castShadow>
        <meshStandardMaterial color="#34495E" />
      </RoundedBox>
      
      {/* Rooftop elements */}
      <RoundedBox position={[0, buildingHeight + 0.3, 0]} args={[buildingWidth + 0.2, 0.4, 3.2]} radius={0.05} castShadow>
        <meshStandardMaterial color="#95A5A6" roughness={0.9} />
      </RoundedBox>
      
      {/* Air conditioning units */}
      <RoundedBox position={[buildingWidth / 3, buildingHeight + 0.7, 0]} args={[0.8, 0.6, 0.6]} radius={0.05} castShadow>
        <meshStandardMaterial color="#BDC3C7" roughness={0.7} />
      </RoundedBox>
      
      {/* Antenna */}
      <Cylinder position={[0, buildingHeight + 2, 0]} args={[0.02, 0.02, 3]} castShadow>
        <meshStandardMaterial color="#E74C3C" />
      </Cylinder>
    </group>
  );
};

export const TrafficLight = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.1;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }

    // Traffic light cycle
    if (lightRef.current) {
      const time = Math.floor(state.clock.elapsedTime * 0.5) % 3;
      lightRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = i === time ? 1 : 0.2;
        }
      });
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Traffic light pole */}
      <Cylinder position={[0, 2, 0]} args={[0.08, 0.08, 4]} castShadow>
        <meshStandardMaterial color="#2C3E50" roughness={0.8} />
      </Cylinder>
      
      {/* Traffic light box */}
      <RoundedBox position={[0, 4.5, 0]} args={[0.4, 1.2, 0.3]} radius={0.05} castShadow>
        <meshStandardMaterial color="#34495E" roughness={0.7} />
      </RoundedBox>
      
      {/* Traffic lights */}
      <group ref={lightRef}>
        {/* Red light */}
        <Sphere position={[0, 5, 0.16]} args={[0.12]} castShadow>
          <meshBasicMaterial color="#E74C3C" transparent opacity={0.2} />
        </Sphere>
        {/* Yellow light */}
        <Sphere position={[0, 4.5, 0.16]} args={[0.12]} castShadow>
          <meshBasicMaterial color="#F39C12" transparent opacity={0.2} />
        </Sphere>
        {/* Green light */}
        <Sphere position={[0, 4, 0.16]} args={[0.12]} castShadow>
          <meshBasicMaterial color="#27AE60" transparent opacity={0.2} />
        </Sphere>
      </group>
      
      {/* Base */}
      <Cylinder position={[0, 0.2, 0]} args={[0.3, 0.3, 0.4]} castShadow>
        <meshStandardMaterial color="#7F8C8D" roughness={0.9} />
      </Cylinder>
    </group>
  );
};

export const StreetLamp = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.08;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Lamp post */}
      <Cylinder position={[0, 2.5, 0]} args={[0.06, 0.06, 5]} castShadow>
        <meshStandardMaterial color="#2C3E50" roughness={0.8} />
      </Cylinder>
      
      {/* Lamp head */}
      <Sphere position={[0, 5.3, 0]} args={[0.3]} castShadow>
        <meshStandardMaterial color="#F39C12" roughness={0.3} />
      </Sphere>
      
      {/* Lamp glow */}
      <pointLight position={[0, 5.3, 0]} intensity={1} color="#FFE135" distance={8} />
      
      {/* Base */}
      <Cylinder position={[0, 0.15, 0]} args={[0.2, 0.2, 0.3]} castShadow>
        <meshStandardMaterial color="#7F8C8D" roughness={0.9} />
      </Cylinder>
    </group>
  );
};

export const BusStop = ({ position }: { position: [number, number, number] }) => {
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
      {/* Bus stop shelter */}
      <RoundedBox position={[0, 1.5, 0]} args={[3, 3, 1.5]} radius={0.1} castShadow>
        <meshStandardMaterial color="#ECF0F1" transparent opacity={0.8} />
      </RoundedBox>
      
      {/* Roof */}
      <RoundedBox position={[0, 3.2, 0]} args={[3.2, 0.2, 1.7]} radius={0.05} castShadow>
        <meshStandardMaterial color="#95A5A6" roughness={0.8} />
      </RoundedBox>
      
      {/* Support poles */}
      <Cylinder position={[-1.3, 1.5, -0.6]} args={[0.05, 0.05, 3]} castShadow>
        <meshStandardMaterial color="#7F8C8D" />
      </Cylinder>
      <Cylinder position={[1.3, 1.5, -0.6]} args={[0.05, 0.05, 3]} castShadow>
        <meshStandardMaterial color="#7F8C8D" />
      </Cylinder>
      
      {/* Bench */}
      <RoundedBox position={[0, 0.8, -0.3]} args={[2.5, 0.1, 0.4]} radius={0.02} castShadow>
        <meshStandardMaterial color="#34495E" />
      </RoundedBox>
      <RoundedBox position={[0, 1.2, -0.5]} args={[2.5, 0.8, 0.1]} radius={0.02} castShadow>
        <meshStandardMaterial color="#34495E" />
      </RoundedBox>
      
      {/* Bus stop sign */}
      <Cylinder position={[2, 2, 0]} args={[0.04, 0.04, 1.5]} castShadow>
        <meshStandardMaterial color="#E74C3C" />
      </Cylinder>
      <RoundedBox position={[2, 2.8, 0]} args={[0.6, 0.4, 0.05]} radius={0.02} castShadow>
        <meshStandardMaterial color="#3498DB" />
      </RoundedBox>
    </group>
  );
};

export const FireHydrant = ({ position }: { position: [number, number, number] }) => {
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
      {/* Main body */}
      <Cylinder position={[0, 0.4, 0]} args={[0.15, 0.18, 0.8]} castShadow>
        <meshStandardMaterial color="#E74C3C" roughness={0.7} />
      </Cylinder>
      
      {/* Top cap */}
      <Cylinder position={[0, 0.9, 0]} args={[0.12, 0.12, 0.2]} castShadow>
        <meshStandardMaterial color="#C0392B" roughness={0.8} />
      </Cylinder>
      
      {/* Side outlets */}
      <Cylinder position={[0.2, 0.5, 0]} args={[0.04, 0.04, 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial color="#F39C12" roughness={0.6} />
      </Cylinder>
      <Cylinder position={[-0.2, 0.5, 0]} args={[0.04, 0.04, 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial color="#F39C12" roughness={0.6} />
      </Cylinder>
      
      {/* Base */}
      <Cylinder position={[0, 0.05, 0]} args={[0.2, 0.2, 0.1]} castShadow>
        <meshStandardMaterial color="#7F8C8D" roughness={0.9} />
      </Cylinder>
    </group>
  );
};

export const ParkBench = ({ position }: { position: [number, number, number] }) => {
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
      {/* Bench seat */}
      <RoundedBox position={[0, 0.5, 0]} args={[1.8, 0.08, 0.4]} radius={0.02} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </RoundedBox>
      
      {/* Bench back */}
      <RoundedBox position={[0, 0.9, -0.15]} args={[1.8, 0.6, 0.08]} radius={0.02} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </RoundedBox>
      
      {/* Legs */}
      <Cylinder position={[-0.7, 0.25, 0]} args={[0.03, 0.03, 0.5]} castShadow>
        <meshStandardMaterial color="#2C3E50" />
      </Cylinder>
      <Cylinder position={[0.7, 0.25, 0]} args={[0.03, 0.03, 0.5]} castShadow>
        <meshStandardMaterial color="#2C3E50" />
      </Cylinder>
      <Cylinder position={[-0.7, 0.25, -0.3]} args={[0.03, 0.03, 0.5]} castShadow>
        <meshStandardMaterial color="#2C3E50" />
      </Cylinder>
      <Cylinder position={[0.7, 0.25, -0.3]} args={[0.03, 0.03, 0.5]} castShadow>
        <meshStandardMaterial color="#2C3E50" />
      </Cylinder>
    </group>
  );
};

export const TrashCan = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.08;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Main trash can */}
      <Cylinder position={[0, 0.6, 0]} args={[0.25, 0.3, 1.2]} castShadow>
        <meshStandardMaterial color="#27AE60" roughness={0.7} />
      </Cylinder>
      
      {/* Lid */}
      <Cylinder position={[0, 1.3, 0]} args={[0.32, 0.32, 0.1]} castShadow>
        <meshStandardMaterial color="#229954" roughness={0.8} />
      </Cylinder>
      
      {/* Handle */}
      <Torus position={[0, 1.35, 0]} args={[0.08, 0.02]} castShadow>
        <meshStandardMaterial color="#2C3E50" />
      </Torus>
      
      {/* Base */}
      <Cylinder position={[0, 0.05, 0]} args={[0.35, 0.35, 0.1]} castShadow>
        <meshStandardMaterial color="#1E8449" roughness={0.9} />
      </Cylinder>
    </group>
  );
};