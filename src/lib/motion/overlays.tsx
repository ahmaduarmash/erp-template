import { lazy, Suspense, useEffect, useState, type ComponentProps } from 'react';
import { Drawer, Dropdown, Modal, Popover } from 'antd';
import { useMotionTokens } from './index';

const DialogFrame = lazy(() => import('./DialogFrame'));

type ModalProps = ComponentProps<typeof Modal>;
type DrawerProps = ComponentProps<typeof Drawer>;
type PopoverProps = ComponentProps<typeof Popover>;
type DropdownProps = ComponentProps<typeof Dropdown>;

export function AnimatedModal({ open, modalRender, ...props }: ModalProps) {
  const motion = useMotionTokens();
  const [present, setPresent] = useState(Boolean(open));
  useEffect(() => {
    if (open || !motion.enabled) setPresent(Boolean(open));
  }, [open, motion.enabled]);

  return (
    <Modal
      {...props}
      open={motion.enabled ? Boolean(open) || present : open}
      modalRender={(node) => {
        const rendered = modalRender ? modalRender(node) : node;
        return motion.enabled ? (
          <Suspense fallback={rendered}>
            <DialogFrame
              open={Boolean(open)}
              onExit={() => setPresent(false)}
              variant="modal"
              enterDuration={motion.modalEnter}
              exitDuration={motion.modalExit}
              enterEase={motion.easingEnter}
              exitEase={motion.easingExit}
            >
              {rendered}
            </DialogFrame>
          </Suspense>
        ) : rendered;
      }}
    />
  );
}

export function AnimatedDrawer({ open, drawerRender, ...props }: DrawerProps) {
  const motion = useMotionTokens();
  const [present, setPresent] = useState(Boolean(open));
  useEffect(() => {
    if (open || !motion.enabled) setPresent(Boolean(open));
  }, [open, motion.enabled]);

  return (
    <Drawer
      {...props}
      open={motion.enabled ? Boolean(open) || present : open}
      drawerRender={(node) => {
        const rendered = drawerRender ? drawerRender(node) : node;
        return motion.enabled ? (
          <Suspense fallback={rendered}>
            <DialogFrame
              open={Boolean(open)}
              onExit={() => setPresent(false)}
              variant="drawer"
              enterDuration={motion.drawerEnter}
              exitDuration={motion.drawerExit}
              enterEase={motion.easingEnter}
              exitEase={motion.easingExit}
            >
              {rendered}
            </DialogFrame>
          </Suspense>
        ) : rendered;
      }}
    />
  );
}

export function AnimatedPopover({ rootClassName, ...props }: PopoverProps) {
  return <Popover {...props} rootClassName={['motion-standard-overlay', rootClassName].filter(Boolean).join(' ')} />;
}

export function AnimatedDropdown({ rootClassName, ...props }: DropdownProps) {
  return <Dropdown {...props} rootClassName={['motion-standard-overlay', rootClassName].filter(Boolean).join(' ')} />;
}
