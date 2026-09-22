import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { useTemplate } from '../../theme/ThemeProvider';

const Animated = lazy(() => import('./surface'));

export function useMotionTokens() {
  const { tokens, motionEnabled, reducedMotion } = useTemplate();
  return {
    enabled: motionEnabled,
    reduced: reducedMotion,
    ...tokens.motion,
  };
}

/** Backward-compatible bridge while older feature code migrates to interaction-specific tokens. */
export function useMotionPolicy() {
  const motion = useMotionTokens();
  return { enabled: motion.enabled, duration: motion.standard };
}

/** Delegated, lazy-loaded button press feedback; no per-cell listeners. */
export function useButtonMotion() {
  const motion = useMotionTokens();
  useEffect(() => {
    if (!motion.enabled) return;
    let disposed = false;
    let removeListeners = () => {};
    const active = new Map<HTMLElement, { stop: () => void }>();

    void import('motion')
      .then(({ animate }) => {
        if (disposed) return;
        const run = (button: HTMLElement, scale: number) => {
          active.get(button)?.stop();
          const control = animate(
            button,
            { scale },
            {
              duration: motion.micro,
              ease: scale < 1 ? motion.easingExit : motion.easingEnter,
            },
          );
          active.set(button, control);
          void control.then(() => {
            if (active.get(button) === control && scale === 1) active.delete(button);
          });
        };
        const press = (event: PointerEvent) => {
          const button = (event.target as HTMLElement).closest<HTMLElement>('.ant-btn');
          if (button && !button.hasAttribute('disabled')) run(button, 0.985);
        };
        const release = () => active.forEach((_control, button) => run(button, 1));
        document.addEventListener('pointerdown', press);
        document.addEventListener('pointerup', release);
        document.addEventListener('pointercancel', release);
        removeListeners = () => {
          document.removeEventListener('pointerdown', press);
          document.removeEventListener('pointerup', release);
          document.removeEventListener('pointercancel', release);
        };
      })
      .catch(() => {});

    return () => {
      disposed = true;
      removeListeners();
      active.forEach((control, button) => {
        control.stop();
        button.style.removeProperty('transform');
      });
      active.clear();
    };
  }, [motion.enabled, motion.easingEnter, motion.easingExit, motion.micro]);
}

export function MotionSurface({
  children,
  className,
  page = false,
}: {
  children: ReactNode;
  className?: string;
  page?: boolean;
}) {
  const motion = useMotionTokens();
  const plain = <div className={className}>{children}</div>;
  if (!motion.enabled) return plain;
  return (
    <Suspense fallback={plain}>
      <Animated
        className={className}
        page={page}
        enterDuration={page ? motion.page : motion.standard}
        exitDuration={motion.micro}
        enterEase={motion.easingEnter}
        exitEase={motion.easingExit}
      >
        {children}
      </Animated>
    </Suspense>
  );
}
