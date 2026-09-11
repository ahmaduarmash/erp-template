import { Popconfirm } from 'antd';
import type { ReactNode } from 'react';
export function ConfirmPopover({
  children,
  onConfirm,
  title = 'Delete this record?',
  description = 'This removes the record from this demo workspace.',
}: {
  children: ReactNode;
  onConfirm: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      okText="Delete"
      okButtonProps={{ danger: true }}
      cancelText="Keep record"
    >
      {children}
    </Popconfirm>
  );
}
