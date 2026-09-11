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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: open ? 1 : 0, y: open ? 0 : 10 }}
      transition={{ duration }}
      onAnimationComplete={() => {
        if (!open) onExit();
      }}
    >
      {children}
    </motion.div>
  );
}
