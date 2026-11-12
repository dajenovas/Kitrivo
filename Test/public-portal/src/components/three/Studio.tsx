import { Environment, Lightformer } from '@react-three/drei';

/** Procedural studio lighting — no external HDR download needed. */
const Studio = () => (
  <Environment frames={1} resolution={256}>
    <Lightformer form="rect" intensity={4} position={[0, 5, -5]} scale={[12, 4, 1]} color="#fff1dc" />
    <Lightformer form="ring" intensity={3} position={[-5, 1, -1]} scale={4} color="#e2a45a" />
    <Lightformer form="rect" intensity={2.2} position={[5, -1, 2]} scale={[3, 7, 1]} color="#a9bcff" />
    <Lightformer form="circle" intensity={1.5} position={[0, -4, 3]} scale={5} color="#ffffff" />
  </Environment>
);

export default Studio;
