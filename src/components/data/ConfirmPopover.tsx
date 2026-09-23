import type { ReactElement } from 'react';
import { ConfirmActionPopover } from '../overlays';

export function ConfirmPopover({
  children,
  onConfirm,
  title = 'Delete this record?',
  description = 'This removes the record from this demo workspace.',
}: {
  children: ReactElement;
  onConfirm: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <ConfirmActionPopover
      title={title}
      description={description}
      confirmLabel="Delete"
      cancelLabel="Keep record"
      danger
      onConfirm={onConfirm}
    >
      {children}
    </ConfirmActionPopover>
  );
}
