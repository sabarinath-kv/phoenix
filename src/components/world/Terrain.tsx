import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture, Sphere, Box, Cylinder, RoundedBox, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface TerrainProps {
  position: [number, number, number];
  segment: number;
}

export const Terrain = ({ position, segment }: TerrainProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const decorationsRef = useRef<THREE.Group>(null);
  
  // Create flat urban street geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 10, 32, 32);
    // Keep it flat for urban streets
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Urban street materials
  const asphaltMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2C3E50',
    roughness: 0.9,
    metalness: 0.1,
  }), []);

  const sidewalkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#BDC3C7',
    roughness: 0.8,
    metalness: 0.05,
  }), []);

  const laneMarkingMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#FFFFFF',
    transparent: true,
    opacity: 0.9,
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.2;
      
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }

    // Animate urban elements
    if (decorationsRef.current) {
      const time = state.clock.elapsedTime;
      decorationsRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Group) {
          // Subtle movement for some elements
          if (i % 3 === 0) {
            child.rotation.y = Math.sin(time * 0.5 + i) * 0.02;
          }
        }
      });
    }
  });

  return (
    <group>
      {/* Main street asphalt */}
      <mesh 
        ref={meshRef} 
        position={position} 
        receiveShadow 
        geometry={geometry} 
        rotation={[-Math.PI / 2, 0, 0]}
        material={asphaltMaterial}
      />
      
      {/* Sidewalks */}
      <mesh position={[position[0] - 6, position[1] + 0.01, position[2]]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 10]} />
        <primitive object={sidewalkMaterial} />
      </mesh>
      <mesh position={[position[0] + 6, position[1] + 0.01, position[2]]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 10]} />
        <primitive object={sidewalkMaterial} />
      </mesh>
      
      {/* Lane markings - 3 lanes */}
      {[-2, 2].map((laneX, i) => (
        <group key={i}>
          {/* Dashed lane lines */}
          {Array.from({ length: 8 }, (_, j) => (
            <mesh
              key={j}
              position={[position[0] + laneX, position[1] + 0.02, position[2] - 4 + j * 1.2]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.2, 0.8]} />
              <primitive object={laneMarkingMaterial} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Solid edge lines */}
      <mesh position={[position[0] - 4, position[1] + 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 10]} />
        <primitive object={laneMarkingMaterial} />
      </mesh>
      <mesh position={[position[0] + 4, position[1] + 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 10]} />
        <primitive object={laneMarkingMaterial} />
      </mesh>
      
      {/* Crosswalk (every few segments) */}
      {segment % 8 === 0 && (
        <group>
          {Array.from({ length: 12 }, (_, i) => (
            <mesh
              key={i}
              position={[position[0] - 3.5 + i * 0.6, position[1] + 0.03, position[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.4, 8]} />
              <primitive object={laneMarkingMaterial} />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Urban decorations and street furniture */}
      <group ref={decorationsRef}>
        {/* Manholes */}
        {segment % 3 === 0 && (
          <Cylinder position={[position[0] + 1, position[1] + 0.02, position[2] + 2]} args={[0.4, 0.4, 0.05]} castShadow>
            <meshStandardMaterial color="#34495E" roughness={0.9} metalness={0.3} />
          </Cylinder>
        )}
        
        {/* Storm drains */}
        {segment % 4 === 1 && (
          <>
            <RoundedBox position={[position[0] - 4.5, position[1] + 0.03, position[2] - 1]} args={[0.8, 0.05, 0.3]} radius={0.02} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </RoundedBox>
            {/* Drain grates */}
            {Array.from({ length: 6 }, (_, i) => (
              <RoundedBox
                key={i}
                position={[position[0] - 4.7 + i * 0.08, position[1] + 0.04, position[2] - 1]}
                args={[0.02, 0.02, 0.25]}
                radius={0.01}
                castShadow
              >
                <meshStandardMaterial color="#7F8C8D" />
              </RoundedBox>
            ))}
          </>
        )}
        
        {/* Street signs */}
        {segment % 5 === 2 && (
          <group>
            {/* Sign post */}
            <Cylinder position={[position[0] + 5, position[1] + 1.5, position[2] + 1]} args={[0.05, 0.05, 3]} castShadow>
              <meshStandardMaterial color="#7F8C8D" roughness={0.8} />
            </Cylinder>
            {/* Street sign */}
            <RoundedBox position={[position[0] + 5, position[1] + 2.8, position[2] + 1]} args={[1.2, 0.3, 0.05]} radius={0.02} castShadow>
              <meshStandardMaterial color="#27AE60" />
            </RoundedBox>
            {/* Stop sign */}
            <Cylinder position={[position[0] + 5, position[1] + 2.2, position[2] + 1]} args={[0.25, 0.25, 0.03]} rotation={[0, 0, Math.PI / 8]} castShadow>
              <meshStandardMaterial color="#E74C3C" />
            </Cylinder>
          </group>
        )}
        
        {/* Parking meters */}
        {segment % 6 === 3 && (
          <>
            <Cylinder position={[position[0] + 4.8, position[1] + 0.6, position[2] - 2]} args={[0.08, 0.08, 1.2]} castShadow>
              <meshStandardMaterial color="#34495E" roughness={0.8} />
            </Cylinder>
            <RoundedBox position={[position[0] + 4.8, position[1] + 1.3, position[2] - 2]} args={[0.2, 0.3, 0.15]} radius={0.02} castShadow>
              <meshStandardMaterial color="#3498DB" roughness={0.6} metalness={0.4} />
            </RoundedBox>
          </>
        )}
        
        {/* Newspaper stands */}
        {segment % 7 === 4 && (
          <RoundedBox position={[position[0] - 5.5, position[1] + 0.4, position[2] + 3]} args={[0.6, 0.8, 0.4]} radius={0.05} castShadow>
            <meshStandardMaterial color="#F39C12" roughness={0.7} />
          </RoundedBox>
        )}
        
        {/* Bike racks */}
        {segment % 8 === 5 && (
          <group>
            {Array.from({ length: 3 }, (_, i) => (
              <Torus
                key={i}
                position={[position[0] - 6 + i * 0.8, position[1] + 0.3, position[2] - 1]}
                args={[0.3, 0.03]}
                rotation={[Math.PI / 2, 0, 0]}
                castShadow
              >
                <meshStandardMaterial color="#2C3E50" roughness={0.8} />
              </Torus>
            ))}
          </group>
        )}
        
        {/* Construction barriers */}
        {segment % 9 === 6 && (
          <group>
            <RoundedBox position={[position[0] + 3, position[1] + 0.5, position[2] + 2]} args={[2, 1, 0.1]} radius={0.05} castShadow>
              <meshStandardMaterial color="#F39C12" roughness={0.8} />
            </RoundedBox>
            {/* Warning stripes */}
            {Array.from({ length: 4 }, (_, i) => (
              <RoundedBox
                key={i}
                position={[position[0] + 2.2 + i * 0.4, position[1] + 0.5, position[2] + 2.06]}
                args={[0.3, 0.8, 0.02]}
                radius={0.01}
                castShadow
              >
                <meshStandardMaterial color={i % 2 === 0 ? "#E74C3C" : "#FFFFFF"} />
              </RoundedBox>
            ))}
          </group>
        )}
        
        {/* Litter and urban details */}
        {segment % 4 === 0 && (
          <>
            {/* Scattered leaves */}
            {Array.from({ length: 8 }, (_, i) => {
              const x = position[0] + (Math.random() - 0.5) * 12;
              const z = position[2] + (Math.random() - 0.5) * 8;
              return (
                <RoundedBox
                  key={i}
                  position={[x, position[1] + 0.02, z]}
                  args={[0.1, 0.01, 0.15]}
                  radius={0.02}
                  rotation={[0, Math.random() * Math.PI, 0]}
                  castShadow
                >
                  <meshStandardMaterial color="#8B4513" roughness={0.9} />
                </RoundedBox>
              );
            })}
            
            {/* Small debris */}
            {Array.from({ length: 5 }, (_, i) => {
              const x = position[0] + (Math.random() - 0.5) * 10;
              const z = position[2] + (Math.random() - 0.5) * 6;
              return (
                <Sphere
                  key={i}
                  position={[x, position[1] + 0.03, z]}
                  args={[0.02 + Math.random() * 0.03]}
                  castShadow
                >
                  <meshStandardMaterial color="#95A5A6" roughness={0.9} />
                </Sphere>
              );
            })}
          </>
        )}
      </group>
      
      {/* Street lighting */}
      {segment % 6 === 0 && (
        <>
          <pointLight 
            position={[position[0] - 6, position[1] + 4, position[2]]} 
            intensity={0.8} 
            color="#FFE135" 
            distance={12} 
          />
          <pointLight 
            position={[position[0] + 6, position[1] + 4, position[2]]} 
            intensity={0.8} 
            color="#FFE135" 
            distance={12} 
          />
        </>
      )}
    </group>
  );
};