import type { ReactNode } from 'react';
import { Button } from 'antd';
import type { CrudShellProps } from './CrudModal';
import { RecordDrawer } from '../overlays';

type CrudDrawerProps = CrudShellProps & { subtitle?: ReactNode };

export function CrudDrawer({
  open,
  title,
  onCancel,
  onSave,
  children,
  loading,
  saveLabel = 'Edit record',
  subtitle = 'Inspect this record without leaving the current list context.',
}: CrudDrawerProps) {
  return (
    <RecordDrawer
      title={title}
      subtitle={subtitle}
      open={open}
      onClose={onCancel}
      size="md"
      footer={
        <div className="record-drawer-footer-actions">
          <Button onClick={onCancel}>Close</Button>
          <Button type="primary" loading={loading} onClick={onSave}>
            {saveLabel}
          </Button>
        </div>
      }
    >
      {children}
    </RecordDrawer>
  );
}
