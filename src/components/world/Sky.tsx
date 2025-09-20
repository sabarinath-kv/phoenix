export const Sky = () => {
  return (
    <mesh position={[0, 10, -50]} scale={[100, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#87CEEB" />
    </mesh>
  );
};