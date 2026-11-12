import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { MathUtils, type Group, type Mesh } from 'three';
import Studio from './Studio';

interface Props {
  active: boolean;
  reduceMotion: boolean;
}

const Knot = ({ reduceMotion }: { reduceMotion: boolean }) => {
  const mesh = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (reduceMotion || !mesh.current) return;
    mesh.current.rotation.y += dt * 0.22;
    mesh.current.rotation.x += dt * 0.08;
  });
  return (
    <mesh ref={mesh} rotation={[0.5, 0.3, 0]}>
      <torusKnotGeometry args={[1, 0.34, 260, 36, 2, 3]} />
      <meshPhysicalMaterial color="#e2a45a" metalness={1} roughness={0.16} clearcoat={0.6} clearcoatRoughness={0.2} envMapIntensity={1.25} />
    </mesh>
  );
};

const Satellite = ({ position, scale, color, shape, speed }: { position: [number, number, number]; scale: number; color: string; shape: 'oct' | 'ico' | 'sphere'; speed: number }) => (
  <Float speed={speed} rotationIntensity={1.2} floatIntensity={1.4}>
    <mesh position={position} scale={scale}>
      {shape === 'oct' && <octahedronGeometry args={[1, 0]} />}
      {shape === 'ico' && <icosahedronGeometry args={[1, 0]} />}
      {shape === 'sphere' && <sphereGeometry args={[1, 48, 48]} />}
      <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.22} envMapIntensity={1} />
    </mesh>
  </Float>
);

const Rig = ({ children, reduceMotion }: { children: React.ReactNode; reduceMotion: boolean }) => {
  const group = useRef<Group>(null);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduceMotion) return;
    g.rotation.y = MathUtils.damp(g.rotation.y, state.pointer.x * 0.45, 3, dt);
    g.rotation.x = MathUtils.damp(g.rotation.x, -state.pointer.y * 0.28, 3, dt);
  });
  return <group ref={group}>{children}</group>;
};

const HeroScene = ({ active, reduceMotion }: Props) => (
  <Canvas
    dpr={[1, 1.75]}
    camera={{ position: [0, 0, 6.4], fov: 34 }}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    frameloop={active ? 'always' : 'never'}
    aria-hidden
  >
    <Studio />
    <ambientLight intensity={0.25} />
    <Rig reduceMotion={reduceMotion}>
      <Float speed={reduceMotion ? 0 : 1.4} rotationIntensity={reduceMotion ? 0 : 0.4} floatIntensity={reduceMotion ? 0 : 0.9}>
        <Knot reduceMotion={reduceMotion} />
      </Float>
      <Satellite position={[-2.3, 1.2, -0.6]} scale={0.34} color="#2a2d38" shape="oct" speed={reduceMotion ? 0 : 1.8} />
      <Satellite position={[2.2, -1.1, 0.4]} scale={0.26} color="#f3c58a" shape="sphere" speed={reduceMotion ? 0 : 2.2} />
      <Satellite position={[1.9, 1.6, -1.2]} scale={0.2} color="#8a92a6" shape="ico" speed={reduceMotion ? 0 : 1.5} />
      <Satellite position={[-1.8, -1.5, 0.6]} scale={0.16} color="#e2a45a" shape="ico" speed={reduceMotion ? 0 : 2} />
    </Rig>
  </Canvas>
);

export default HeroScene;
