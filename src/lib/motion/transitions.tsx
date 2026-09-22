import { AnimatePresence, motion } from 'motion/react';
import type { Key, ReactNode } from 'react';
import { useMotionTokens } from './index';

export function PageTransition({ transitionKey, children }: { transitionKey: Key; children: ReactNode }) {
  const tokens = useMotionTokens();
  if (!tokens.enabled) return <>{children}</>;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -2 }}
        transition={{ duration: tokens.page, ease: tokens.easingEnter }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function TabTransition({ transitionKey, children }: { transitionKey: Key; children: ReactNode }) {
  const tokens = useMotionTokens();
  if (!tokens.enabled) return <>{children}</>;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: tokens.page, ease: tokens.easingEnter }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ListTransition({
  itemKey,
  children,
}: {
  itemKey: Key;
  children: ReactNode;
}) {
  const tokens = useMotionTokens();
  if (!tokens.enabled) return <>{children}</>;
  return (
    <motion.div
      key={itemKey}
      layout="position"
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -2 }}
      transition={{ duration: tokens.standard, ease: tokens.easingEnter }}
    >
      {children}
    </motion.div>
  );
}
