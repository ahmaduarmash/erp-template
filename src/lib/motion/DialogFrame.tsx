import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export default function DialogFrame({
  children,
  open,
  onExit,
  duration,
}: {
  children: ReactNode;
  open: boolean;
  onExit: () => void;
  duration: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{
        opacity: open ? 1 : 0,
        y: open ? 0 : 12,
        scale: open ? 1 : 0.992,
      }}
      transition={{
        duration: Math.max(duration, 0.2),
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        if (!open) onExit();
      }}
      style={{ transformOrigin: '50% 16%' }}
    >
      {children}
    </motion.div>
  );
}
