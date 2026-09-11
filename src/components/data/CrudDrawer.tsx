import { lazy, Suspense, useState, useEffect } from 'react';
import { Button, Drawer, Space } from 'antd';
import type { CrudShellProps } from './CrudModal';
import { useMotionPolicy } from '../../lib/motion';
const Frame = lazy(() => import('../../lib/motion/DialogFrame'));
export function CrudDrawer({
  open,
  title,
  onCancel,
  onSave,
  children,
  loading,
  saveLabel = 'Save changes',
}: CrudShellProps) {
  const { enabled, duration } = useMotionPolicy();
  const [present, setPresent] = useState(open);
  useEffect(() => {
    if (open || !enabled) setPresent(open);
  }, [open, enabled]);
  return (
    <Drawer
      title={title}
      open={enabled ? open || present : open}
      onClose={onCancel}
      width={560}
      destroyOnHidden
      drawerRender={(node) =>
        enabled ? (
          <Suspense fallback={node}>
            <Frame open={open} duration={duration} onExit={() => setPresent(false)}>
              {node}
            </Frame>
          </Suspense>
        ) : (
          node
        )
      }
      footer={
        <Space>
          <Button onClick={onCancel}>Close</Button>
          <Button type="primary" loading={loading} onClick={onSave}>
            {saveLabel}
          </Button>
        </Space>
      }
    >
      {children}
    </Drawer>
  );
}
