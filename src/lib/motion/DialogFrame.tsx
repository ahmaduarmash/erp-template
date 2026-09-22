import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export default function DialogFrame({
  children,
  open,
  onExit,
  variant,
  enterDuration,
  exitDuration,
  enterEase,
  exitEase,
}: {
  children: ReactNode;
  open: boolean;
  onExit: () => void;
  variant: 'modal' | 'drawer';
  enterDuration: number;
  exitDuration: number;
  enterEase: [number, number, number, number];
  exitEase: [number, number, number, number];
}) {
  const closed = variant === 'drawer'
    ? { opacity: 0.98, x: 14, y: 0, scale: 1 }
    : { opacity: 0, x: 0, y: 10, scale: 0.992 };

  return (
    <motion.div
      initial={closed}
      animate={open ? { opacity: 1, x: 0, y: 0, scale: 1 } : closed}
      transition={{
        duration: open ? enterDuration : exitDuration,
        ease: open ? enterEase : exitEase,
      }}
      onAnimationComplete={() => {
        if (!open) onExit();
      }}
      style={{ transformOrigin: variant === 'modal' ? '50% 16%' : '100% 50%' }}
    >
      {children}
    </motion.div>
  );
}
