export const Lighting = () => {
  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.3} color="#FFE4B5" />
      
      {/* Main directional light (sun) */}
      <directionalLight
        position={[20, 30, 10]}
        intensity={1.5}
        color="#FFF8DC"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      
      {/* Secondary fill light */}
      <directionalLight
        position={[-10, 15, 5]}
        intensity={0.4}
        color="#87CEEB"
      />
      
      {/* Warm accent light */}
      <pointLight 
        position={[0, 8, -5]} 
        intensity={0.6} 
        color="#FFA500" 
        distance={25}
        decay={2}
      />
      
      {/* Mystical purple light */}
      <spotLight
        position={[0, 15, -10]}
        intensity={0.8}
        color="#9370DB"
        angle={Math.PI / 4}
        penumbra={0.5}
        distance={30}
        castShadow
      />
      
      {/* Ground bounce light */}
      <hemisphereLight
        args={["#87CEEB", "#8B4513", 0.4]}
      />
    </>
  );
};