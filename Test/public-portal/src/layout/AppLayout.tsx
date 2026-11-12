import { Suspense } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import { PageLoader } from '@/components/ui/States';
import { scrollToTop } from '@/utils/scroll';

const AppLayout = () => {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <SmoothScroll />
      <Header />
      <AnimatePresence mode="wait" onExitComplete={scrollToTop}>
        <motion.main
          id="main"
          key={pathname}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
};

export default AppLayout;
