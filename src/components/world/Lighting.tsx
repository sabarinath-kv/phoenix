export const Lighting = () => {
  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* Directional light as sun */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Point light for warmth */}
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#FFA500" />
    </>
  );
};