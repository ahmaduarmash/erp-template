import { Button } from 'antd';
import type { CrudShellProps } from './CrudModal';
import { RecordDrawer } from '../overlays';

export function CrudDrawer({
  open,
  title,
  onCancel,
  onSave,
  children,
  loading,
  saveLabel = 'Edit record',
}: CrudShellProps) {
  return (
    <RecordDrawer
      title={title}
      subtitle="Inspect this record without leaving the current list context."
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
