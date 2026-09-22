import { Button, Space } from 'antd';
import type { CrudShellProps } from './CrudModal';
import { AnimatedDrawer } from '../../lib/motion/overlays';

export function CrudDrawer({
  open,
  title,
  onCancel,
  onSave,
  children,
  loading,
  saveLabel = 'Save changes',
}: CrudShellProps) {
  return (
    <AnimatedDrawer
      title={title}
      open={open}
      onClose={onCancel}
      width={560}
      destroyOnHidden
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
    </AnimatedDrawer>
  );
}
