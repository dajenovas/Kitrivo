import { useRef, type PointerEvent, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Props {
  children: ReactNode;
  className?: string;
  max?: number;
}

/** 3D tilt + moving glare driven by pointer position (mouse only, off for reduced motion). */
const Tilt = ({ children, className, max = 7 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateX(${((0.5 - py) * max * 2).toFixed(2)}deg) rotateY(${((px - 0.5) * max * 2).toFixed(2)}deg)`;
    el.style.setProperty('--gx', `${(px * 100).toFixed(0)}%`);
    el.style.setProperty('--gy', `${(py * 100).toFixed(0)}%`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div ref={ref} className={className} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
};

export default Tilt;
