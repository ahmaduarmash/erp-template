import type { ReactNode } from 'react';
import { CreateModal, EditModal } from '../overlays';

export type CrudIntent = 'create' | 'edit';

export interface CrudShellProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
  loading?: boolean;
  saveLabel?: string;
  intent?: CrudIntent;
  description?: ReactNode;
}

export function CrudModal({
  open,
  title,
  onCancel,
  onSave,
  children,
  loading,
  saveLabel,
  intent,
  description,
}: CrudShellProps) {
  // Explicit intent is the stable contract. Title inference remains only for legacy callers.
  const editing = intent ? intent === 'edit' : /^edit\b/i.test(title);
  const Modal = editing ? EditModal : CreateModal;
  const defaultDescription = editing
    ? 'Update the record without leaving your current workspace.'
    : 'Add a record without losing your current list context.';

  return (
    <Modal
      open={open}
      title={title}
      description={description ?? defaultDescription}
      onCancel={onCancel}
      onSubmit={onSave}
      loading={loading}
      submitLabel={saveLabel}
      width={640}
    >
      {children}
    </Modal>
  );
}
