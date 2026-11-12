import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import Studio from './Studio';

interface Props {
  url: string;
  reduceMotion: boolean;
}

const GLTFModel = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  const object = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={object} />;
};

/** Built-in procedural shapes so the viewer can be previewed without real assets (dev mock data). */
const Procedural = ({ kind }: { kind: string }) => (
  <mesh>
    {kind === 'orb' ? <sphereGeometry args={[1, 64, 64]} /> : <torusKnotGeometry args={[0.9, 0.3, 240, 32]} />}
    <meshPhysicalMaterial color="#e2a45a" metalness={1} roughness={0.18} clearcoat={0.5} />
  </mesh>
);

const ModelViewer = ({ url, reduceMotion }: Props) => (
  <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.6, 4], fov: 35 }} gl={{ antialias: true, alpha: true }}>
    <Studio />
    <ambientLight intensity={0.3} />
    <Suspense fallback={null}>
      <Bounds fit clip observe margin={1.25}>
        <Center>
          {url.startsWith('procedural:') ? <Procedural kind={url.slice(11)} /> : <GLTFModel url={url} />}
        </Center>
      </Bounds>
      <ContactShadows position={[0, -1.25, 0]} opacity={0.5} scale={8} blur={2.6} far={3} />
    </Suspense>
    {/* zoom disabled so the viewer never hijacks page scrolling */}
    <OrbitControls makeDefault enablePan={false} enableZoom={false} autoRotate={!reduceMotion} autoRotateSpeed={1.2} minPolarAngle={0.6} maxPolarAngle={Math.PI / 1.8} />
  </Canvas>
);

export default ModelViewer;
