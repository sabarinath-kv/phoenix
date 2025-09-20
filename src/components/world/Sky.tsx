import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Custom sky shader material
const SkyMaterial = shaderMaterial(
  {
    time: 0,
    sunPosition: new THREE.Vector3(0, 1, 0),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 sunPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vec3 direction = normalize(vWorldPosition);
      float elevation = direction.y;
      
      // Sky gradient
      vec3 skyColor = mix(
        vec3(1.0, 0.6, 0.3), // Orange horizon
        vec3(0.5, 0.8, 1.0), // Blue sky
        elevation * 0.5 + 0.5
      );
      
      // Sun effect
      float sunDistance = distance(direction, normalize(sunPosition));
      float sunGlow = 1.0 - smoothstep(0.0, 0.5, sunDistance);
      skyColor += vec3(1.0, 1.0, 0.8) * sunGlow * 0.5;
      
      // Animated clouds
      float clouds = sin(vUv.x * 10.0 + time * 0.5) * sin(vUv.y * 8.0 + time * 0.3) * 0.3;
      clouds = smoothstep(0.1, 0.3, clouds);
      skyColor = mix(skyColor, vec3(1.0), clouds * 0.2);
      
      gl_FragColor = vec4(skyColor, 1.0);
    }
  `
);

extend({ SkyMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      skyMaterial: any;
    }
  }
}

export const Sky = () => {
  const materialRef = useRef<any>();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 10, -50]} scale={[100, 30, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <skyMaterial ref={materialRef} sunPosition={[0.5, 0.8, 0.3]} />
    </mesh>
  );
};