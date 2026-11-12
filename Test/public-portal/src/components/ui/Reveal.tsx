import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** "clip" reveals like a curtain — good for images */
  variant?: 'fade' | 'clip';
}

const ease = [0.22, 1, 0.36, 1] as const;

const Reveal = ({ children, delay = 0, y = 32, className, variant = 'fade' }: Props) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  if (variant === 'clip') {
    return (
      <motion.div
        className={className}
        initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0.4 }}
        whileInView={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.1, delay, ease }}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
