import { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from 'framer-motion';
import { setLenis } from '@/utils/scroll';

/** Lenis smooth scrolling — skipped entirely when the visitor prefers reduced motion. */
const SmoothScroll = () => {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    setLenis(lenis);
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduce]);
  return null;
};

export default SmoothScroll;
