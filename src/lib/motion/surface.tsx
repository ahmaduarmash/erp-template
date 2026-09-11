import { motion } from 'motion/react';
import type { ReactNode } from 'react';
export default function AnimatedSurface({
  children,
  className,
  page,
  duration,
}: {
  children: ReactNode;
  className?: string;
  page: boolean;
  duration: number;
}) {
  return (
    <motion.div
      layout
      className={className}
      initial={{ opacity: 0, y: page ? 8 : 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: page ? duration + 0.08 : duration }}
      whileHover={page ? undefined : { y: -1 }}
      whileTap={page ? undefined : { scale: 0.998 }}
    >
      {children}
    </motion.div>
  );
}
