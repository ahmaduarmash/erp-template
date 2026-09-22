import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export default function AnimatedSurface({
  children,
  className,
  page,
  enterDuration,
  exitDuration,
  enterEase,
  exitEase,
}: {
  children: ReactNode;
  className?: string;
  page: boolean;
  enterDuration: number;
  exitDuration: number;
  enterEase: [number, number, number, number];
  exitEase: [number, number, number, number];
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: page ? 6 : 2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: page ? -2 : 0 }}
      transition={{ duration: enterDuration, ease: enterEase }}
      variants={{
        exit: { transition: { duration: exitDuration, ease: exitEase } },
      }}
    >
      {children}
    </motion.div>
  );
}
