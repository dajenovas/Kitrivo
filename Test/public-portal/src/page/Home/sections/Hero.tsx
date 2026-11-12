import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { hasWebGL } from '@/hooks/useWebGL';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Magnetic from '@/components/ui/Magnetic';
import { ArrowForward } from '@mui/icons-material';

const HeroScene = lazy(() => import('@/components/three/HeroScene'));

/** CSS-only stand-in when WebGL is unavailable or still loading. */
const HeroFallback = () => (
  <div className="hero__fallback" aria-hidden>
    <span /><span /><span />
  </div>
);

const Hero = () => {
  const reduce = useReducedMotion() ?? false;
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: '100px' });
  const webgl = hasWebGL();

  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 36 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden>
        <span className="hero__orb hero__orb--a" />
        <span className="hero__orb hero__orb--b" />
        <span className="hero__grid" />
      </div>
      <div className="container hero__inner">
        <div className="hero__copy">
          <motion.span className="eyebrow" {...item(0)}>{siteConfig.name}</motion.span>
          <motion.h1 id="hero-title" {...item(1)}>
            <span className="gradient-text">{siteConfig.tagline}</span>
          </motion.h1>
          <motion.p className="lede" {...item(2)}>
            Explore our collection and see the projects we’ve delivered — then place an order or ask us for a quote.
          </motion.p>
          <motion.div className="hero__cta" {...item(3)}>
            <Magnetic>
              <Link to="/products" className="btn btn--primary btn--lg">
                Explore Collection <ArrowForward className="btn__arrow" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link to="/projects" className="btn btn--ghost btn--lg">View Our Projects</Link>
            </Magnetic>
          </motion.div>
        </div>
        <motion.div ref={stage} className="hero__stage" initial={reduce ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          {webgl ? (
            <ErrorBoundary fallback={<HeroFallback />}>
              <Suspense fallback={<HeroFallback />}>
                <HeroScene active={inView} reduceMotion={reduce} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <HeroFallback />
          )}
        </motion.div>
      </div>
      <a href="#featured" className="scroll-cue" aria-label="Scroll to featured products">
        <span>Scroll</span>
        <i />
      </a>
    </section>
  );
};

export default Hero;
