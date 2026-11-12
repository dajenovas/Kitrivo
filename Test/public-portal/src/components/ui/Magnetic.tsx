import { useRef, type PointerEvent, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Subtle magnetic pull toward the cursor (mouse only, off for reduced motion). */
const Magnetic = ({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <span ref={ref} className="magnetic" onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </span>
  );
};

export default Magnetic;
