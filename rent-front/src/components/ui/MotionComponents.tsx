'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Reusable animation components
interface AnimatedDivProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: Variants;
  delay?: number;
}

export const AnimatedDiv = ({ 
  children, 
  variant = fadeInUp, 
  delay = 0, 
  ...props 
}: AnimatedDivProps) => (
  <motion.div
    variants={variant}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.5, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ children, ...props }: HTMLMotionProps<'div'>) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    {...props}
  >
    {children}
  </motion.div>
);

export const FadeInUp = ({ children, delay = 0, ...props }: AnimatedDivProps) => (
  <AnimatedDiv variant={fadeInUp} delay={delay} {...props}>
    {children}
  </AnimatedDiv>
);

export const FadeIn = ({ children, delay = 0, ...props }: AnimatedDivProps) => (
  <AnimatedDiv variant={fadeIn} delay={delay} {...props}>
    {children}
  </AnimatedDiv>
);

export const SlideInLeft = ({ children, delay = 0, ...props }: AnimatedDivProps) => (
  <AnimatedDiv variant={slideInLeft} delay={delay} {...props}>
    {children}
  </AnimatedDiv>
);

export const SlideInRight = ({ children, delay = 0, ...props }: AnimatedDivProps) => (
  <AnimatedDiv variant={slideInRight} delay={delay} {...props}>
    {children}
  </AnimatedDiv>
);

export const ScaleIn = ({ children, delay = 0, ...props }: AnimatedDivProps) => (
  <AnimatedDiv variant={scaleIn} delay={delay} {...props}>
    {children}
  </AnimatedDiv>
);

// Page transition wrapper
export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);