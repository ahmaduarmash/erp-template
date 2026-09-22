import type { ReactNode } from 'react';
import { AnimatedModal } from '../../lib/motion/overlays';

export interface CrudShellProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
  loading?: boolean;
  saveLabel?: string;
}

export function CrudModal({
  open,
  title,
  onCancel,
  onSave,
  children,
  loading,
  saveLabel = 'Save changes',
}: CrudShellProps) {
  return (
    <AnimatedModal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={onSave}
      confirmLoading={loading}
      okText={saveLabel}
      width={600}
      destroyOnHidden
    >
      {children}
    </AnimatedModal>
  );
}
