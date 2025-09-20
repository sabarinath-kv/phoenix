import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, RoundedBox, Cone, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface ObstacleProps {
  position: [number, number, number];
  type: 'car' | 'truck' | 'cone' | 'barrier' | 'bus';
  onCollision: () => void;
  playerLane: number;
  isPlayerJumping?: boolean;
  isPlayerSliding?: boolean;
}

export const Obstacle = ({ position, type, onCollision, playerLane, isPlayerJumping = false, isPlayerSliding = false }: ObstacleProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [collided, setCollided] = useState(false);
  
  // Fixed collision detection with jump/slide mechanics
  useFrame((state) => {
    if (meshRef.current && !collided) {
      // Move obstacle towards player
      meshRef.current.position.z += 0.2;
      
      // Calculate actual positions for more accurate collision detection
      const obstacleX = meshRef.current.position.x;
      const playerX = playerLane * 4; // Player target position
      
      // Check collision based on actual distance between obstacle and player
      const horizontalDistance = Math.abs(obstacleX - playerX);
      const isInSameLane = horizontalDistance < 1.5; // More forgiving collision detection
      const isInCollisionZone = meshRef.current.position.z > 1.5 && meshRef.current.position.z < 2.5;
      
      // Check if player can avoid obstacle
      let canAvoidObstacle = false;
      
      if (isInSameLane && isInCollisionZone) {
        // Cars and trucks can be avoided by changing lanes (if not in same lane, no collision)
        // This is already handled by the isInSameLane check above
        
        // Low obstacles (cones) can be jumped over
        if (isPlayerJumping && type === 'cone') {
          canAvoidObstacle = true;
        }
        
        // High obstacles (barriers) can be slid under
        if (isPlayerSliding && type === 'barrier') {
          canAvoidObstacle = true;
        }
        
        // Cars and trucks can also be jumped over (like going over ramps)
        if (isPlayerJumping && (type === 'car' || type === 'truck')) {
          canAvoidObstacle = true;
        }
        
        // Collision occurs only if player can't avoid the obstacle
        if (!canAvoidObstacle) {
          setCollided(true);
          onCollision();
        }
      }
      
      // Remove obstacle when it's behind the player
      if (meshRef.current.position.z > 5) {
        meshRef.current.position.z = position[2];
        setCollided(false);
      }
    }
  });

  const renderObstacle = () => {
    switch (type) {
      case 'car':
        return (
          <group>
            {/* Car body */}
            <RoundedBox args={[1.8, 0.8, 4]} radius={0.1} castShadow>
              <meshStandardMaterial color="#E74C3C" roughness={0.3} metalness={0.7} />
            </RoundedBox>
            
            {/* Car roof */}
            <RoundedBox position={[0, 0.6, -0.2]} args={[1.6, 0.6, 2.5]} radius={0.15} castShadow>
              <meshStandardMaterial color="#C0392B" roughness={0.2} metalness={0.8} />
            </RoundedBox>
            
            {/* Windshield */}
            <RoundedBox position={[0, 0.7, 0.8]} args={[1.5, 0.5, 0.05]} radius={0.05} castShadow>
              <meshStandardMaterial color="#85C1E9" transparent opacity={0.7} />
            </RoundedBox>
            
            {/* Rear window */}
            <RoundedBox position={[0, 0.7, -1.2]} args={[1.5, 0.5, 0.05]} radius={0.05} castShadow>
              <meshStandardMaterial color="#85C1E9" transparent opacity={0.7} />
            </RoundedBox>
            
            {/* Wheels */}
            <Cylinder position={[-0.8, -0.3, 1.2]} args={[0.3, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[0.8, -0.3, 1.2]} args={[0.3, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[-0.8, -0.3, -1.2]} args={[0.3, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[0.8, -0.3, -1.2]} args={[0.3, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            
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
            
            {/* License plate */}
            <RoundedBox position={[0, -0.2, 2.05]} args={[0.6, 0.2, 0.02]} radius={0.01} castShadow>
              <meshStandardMaterial color="#FFFFFF" />
            </RoundedBox>
          </group>
        );
        
      case 'truck':
        return (
          <group>
            {/* Truck cab */}
            <RoundedBox position={[0, 1, 1.5]} args={[2, 2, 3]} radius={0.1} castShadow>
              <meshStandardMaterial color="#F39C12" roughness={0.4} metalness={0.6} />
            </RoundedBox>
            
            {/* Truck cargo */}
            <RoundedBox position={[0, 1.2, -1.5]} args={[2.2, 2.4, 4]} radius={0.1} castShadow>
              <meshStandardMaterial color="#D68910" roughness={0.6} metalness={0.3} />
            </RoundedBox>
            
            {/* Windshield */}
            <RoundedBox position={[0, 1.5, 2.8]} args={[1.8, 1.2, 0.05]} radius={0.05} castShadow>
              <meshStandardMaterial color="#85C1E9" transparent opacity={0.7} />
            </RoundedBox>
            
            {/* Wheels */}
            <Cylinder position={[-1, -0.5, 1.5]} args={[0.4, 0.4, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[1, -0.5, 1.5]} args={[0.4, 0.4, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[-1, -0.5, -1]} args={[0.4, 0.4, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[1, -0.5, -1]} args={[0.4, 0.4, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[-1, -0.5, -2.5]} args={[0.4, 0.4, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[1, -0.5, -2.5]} args={[0.4, 0.4, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            
            {/* Headlights */}
            <Sphere position={[-0.7, 0.8, 3.1]} args={[0.2]} castShadow>
              <meshBasicMaterial color="#FFFFFF" />
            </Sphere>
            <Sphere position={[0.7, 0.8, 3.1]} args={[0.2]} castShadow>
              <meshBasicMaterial color="#FFFFFF" />
            </Sphere>
            
            {/* Exhaust pipe */}
            <Cylinder position={[1.2, 1.5, 0]} args={[0.08, 0.08, 1]} castShadow>
              <meshStandardMaterial color="#34495E" roughness={0.8} />
            </Cylinder>
          </group>
        );
        
      case 'cone':
        return (
          <group>
            {/* Traffic cone */}
            <Cone args={[0.3, 1]} castShadow>
              <meshStandardMaterial color="#FF6B35" roughness={0.7} />
            </Cone>
            
            {/* Reflective stripes */}
            <Torus position={[0, 0.3, 0]} args={[0.25, 0.02]} castShadow>
              <meshBasicMaterial color="#FFFFFF" />
            </Torus>
            <Torus position={[0, 0.6, 0]} args={[0.18, 0.02]} castShadow>
              <meshBasicMaterial color="#FFFFFF" />
            </Torus>
            
            {/* Base */}
            <Cylinder position={[0, -0.05, 0]} args={[0.35, 0.35, 0.1]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
          </group>
        );
        
      case 'barrier':
        return (
          <group>
            {/* Construction barrier */}
            <RoundedBox args={[3, 1, 0.2]} radius={0.05} castShadow>
              <meshStandardMaterial color="#F39C12" roughness={0.8} />
            </RoundedBox>
            
            {/* Warning stripes */}
            {Array.from({ length: 6 }, (_, i) => (
              <RoundedBox
                key={i}
                position={[-1.2 + i * 0.4, 0, 0.11]}
                args={[0.3, 0.8, 0.02]}
                radius={0.01}
                castShadow
              >
                <meshStandardMaterial color={i % 2 === 0 ? "#E74C3C" : "#FFFFFF"} />
              </RoundedBox>
            ))}
            
            {/* Support legs */}
            <Cylinder position={[-1.2, -0.7, 0]} args={[0.05, 0.05, 0.6]} castShadow>
              <meshStandardMaterial color="#D68910" />
            </Cylinder>
            <Cylinder position={[1.2, -0.7, 0]} args={[0.05, 0.05, 0.6]} castShadow>
              <meshStandardMaterial color="#D68910" />
            </Cylinder>
            
            {/* Warning light */}
            <Sphere position={[0, 0.7, 0]} args={[0.1]} castShadow>
              <meshBasicMaterial color="#FF0000" />
            </Sphere>
            <pointLight position={[0, 0.7, 0]} intensity={0.5} color="#FF0000" distance={3} />
          </group>
        );
        
      case 'bus':
        return (
          <group>
            {/* Bus body */}
            <RoundedBox args={[2.5, 2.5, 8]} radius={0.2} castShadow>
              <meshStandardMaterial color="#3498DB" roughness={0.4} metalness={0.5} />
            </RoundedBox>
            
            {/* Bus roof */}
            <RoundedBox position={[0, 1.4, 0]} args={[2.3, 0.2, 7.8]} radius={0.05} castShadow>
              <meshStandardMaterial color="#2980B9" roughness={0.6} />
            </RoundedBox>
            
            {/* Windows */}
            {Array.from({ length: 6 }, (_, i) => (
              <RoundedBox
                key={i}
                position={[0, 0.8, -3 + i * 1.2]}
                args={[2.3, 0.8, 0.05]}
                radius={0.05}
                castShadow
              >
                <meshStandardMaterial color="#85C1E9" transparent opacity={0.7} />
              </RoundedBox>
            ))}
            
            {/* Front windshield */}
            <RoundedBox position={[0, 0.8, 4.1]} args={[2.3, 1.5, 0.05]} radius={0.1} castShadow>
              <meshStandardMaterial color="#85C1E9" transparent opacity={0.7} />
            </RoundedBox>
            
            {/* Wheels */}
            <Cylinder position={[-1.1, -1, 2.5]} args={[0.5, 0.5, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[1.1, -1, 2.5]} args={[0.5, 0.5, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[-1.1, -1, -2.5]} args={[0.5, 0.5, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            <Cylinder position={[1.1, -1, -2.5]} args={[0.5, 0.5, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#2C3E50" roughness={0.9} />
            </Cylinder>
            
            {/* Headlights */}
            <Sphere position={[-0.8, 0.2, 4.2]} args={[0.2]} castShadow>
              <meshBasicMaterial color="#FFFFFF" />
            </Sphere>
            <Sphere position={[0.8, 0.2, 4.2]} args={[0.2]} castShadow>
              <meshBasicMaterial color="#FFFFFF" />
            </Sphere>
            
            {/* Door */}
            <RoundedBox position={[1.3, 0, 1]} args={[0.05, 1.8, 1.5]} radius={0.05} castShadow>
              <meshStandardMaterial color="#2980B9" />
            </RoundedBox>
            
            {/* Bus number display */}
            <RoundedBox position={[0, 1.8, 4.1]} args={[1, 0.3, 0.05]} radius={0.02} castShadow>
              <meshBasicMaterial color="#000000" />
            </RoundedBox>
          </group>
        );
      
      default:
        return (
          <RoundedBox args={[1, 1, 1]} radius={0.1} castShadow>
            <meshStandardMaterial color="#E74C3C" roughness={0.8} />
          </RoundedBox>
        );
    }
  };

  return (
    <group ref={meshRef} position={position}>
      {renderObstacle()}
      
      {/* Collision effect */}
      {collided && (
        <group>
          {/* Impact sparks */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 1.5;
            const z = Math.sin(angle) * 1.5;
            return (
              <Sphere key={i} position={[x, 0.5, z]} args={[0.08]} castShadow>
                <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
              </Sphere>
            );
          })}
          
          {/* Impact flash */}
          <pointLight position={[0, 1, 0]} intensity={2} color="#FFFFFF" distance={6} />
        </group>
      )}
    </group>
  );
};