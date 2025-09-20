import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture, Sphere, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface TerrainProps {
  position: [number, number, number];
  segment: number;
}

export const Terrain = ({ position, segment }: TerrainProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create heightmap for more realistic terrain
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(12, 10, 32, 32);
    const positions = geo.attributes.position.array as Float32Array;
    
    // Add some noise for terrain variation
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      positions[i + 1] = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.2;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z += 0.2;
      
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = position[2];
      }
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position} receiveShadow geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Lane markers with glowing effect */}
      <mesh position={[position[0] - 2, position[1] + 0.01, position[2]]}>
        <planeGeometry args={[0.2, 10]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
      </mesh>
      <mesh position={[position[0] + 2, position[1] + 0.01, position[2]]}>
        <planeGeometry args={[0.2, 10]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
      </mesh>
      
      {/* Add some rocks and details */}
      {segment % 3 === 0 && (
        <>
          <Sphere position={[position[0] + 6, position[1] + 0.3, position[2] - 2]} args={[0.3]} castShadow>
            <meshStandardMaterial color="#666" roughness={0.9} />
          </Sphere>
          <Sphere position={[position[0] - 6, position[1] + 0.2, position[2] + 2]} args={[0.2]} castShadow>
            <meshStandardMaterial color="#555" roughness={0.9} />
          </Sphere>
        </>
      )}
    </group>
  );
};