import { cloneElement, useState, type ReactElement, type ReactNode } from 'react';
import { Button, Space } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons';
import { AnimatedDrawer, AnimatedModal, AnimatedPopover } from '../../lib/motion/overlays';
import { CommandBar, IconChip, ObjectHeader, type SemanticTone } from '../primitives';

export type ModalIntentProps = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  width?: number | string;
  footerExtra?: ReactNode;
};

function EntityModal({
  open,
  title,
  description,
  icon,
  children,
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel = 'Cancel',
  loading,
  danger,
  width = 640,
  footerExtra,
  intent,
}: ModalIntentProps & { intent: 'create' | 'edit' }) {
  const resolvedIcon = icon ?? (intent === 'create' ? <PlusOutlined /> : <FormOutlined />);
  return (
    <AnimatedModal
      open={open}
      onCancel={onCancel}
      width={width}
      destroyOnHidden
      className="intent-modal"
      title={
        <div className="intent-modal-title">
          <IconChip icon={resolvedIcon} tone={danger ? 'danger' : 'primary'} />
          <div>
            <strong>{title}</strong>
            {description ? <small>{description}</small> : null}
          </div>
        </div>
      }
      footer={
        <div className="intent-modal-footer">
          <div>{footerExtra}</div>
          <Space>
            <Button onClick={onCancel}>{cancelLabel}</Button>
            <Button type="primary" danger={danger} loading={loading} onClick={onSubmit}>
              {submitLabel ?? (intent === 'create' ? 'Create' : 'Save changes')}
            </Button>
          </Space>
        </div>
      }
    >
      <div className="intent-modal-body">{children}</div>
    </AnimatedModal>
  );
}

export function CreateModal(props: ModalIntentProps) {
  return <EntityModal {...props} intent="create" />;
}

export function EditModal(props: ModalIntentProps) {
  return <EntityModal {...props} intent="edit" />;
}

export type RecordDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  leading?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  destroyOnClose?: boolean;
};

const drawerWidths = {
  sm: 'var(--drawer-width-sm)',
  md: 'var(--drawer-width-md)',
  lg: 'var(--drawer-width-lg)',
};

export function RecordDrawer({
  open,
  onClose,
  title,
  subtitle,
  status,
  leading,
  meta,
  actions,
  children,
  footer,
  size = 'md',
  destroyOnClose = true,
}: RecordDrawerProps) {
  return (
    <AnimatedDrawer
      open={open}
      onClose={onClose}
      width={drawerWidths[size]}
      destroyOnHidden={destroyOnClose}
      className="record-drawer"
      title={null}
      closable={false}
      footer={footer}
    >
      <div className="record-drawer-toolbar">
        <ActionClose onClose={onClose} />
      </div>
      <ObjectHeader
        title={title}
        subtitle={subtitle}
        status={status}
        leading={leading}
        meta={meta}
        actions={actions}
      />
      <div className="record-drawer-body">{children}</div>
    </AnimatedDrawer>
  );
}

function ActionClose({ onClose }: { onClose: () => void }) {
  return (
    <Button type="text" size="small" icon={<CloseOutlined />} aria-label="Close details" onClick={onClose} />
  );
}

export function ApprovalDrawer({
  workflow,
  actionPanel,
  ...props
}: RecordDrawerProps & { workflow?: ReactNode; actionPanel?: ReactNode }) {
  return (
    <RecordDrawer
      {...props}
      footer={
        actionPanel ? (
          <CommandBar primary={actionPanel} />
        ) : props.footer
      }
    >
      {props.children}
      {workflow ? <div className="approval-drawer-workflow">{workflow}</div> : null}
    </RecordDrawer>
  );
}

export function ConfirmActionPopover({
  children,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'warning',
  danger = false,
  onConfirm,
  disabled,
}: {
  children: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: SemanticTone;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };
  const trigger = cloneElement(children, {
    ...children.props,
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      if (!event.defaultPrevented && !disabled) setOpen(true);
    },
  });
  return (
    <AnimatedPopover
      open={open}
      onOpenChange={(next) => !disabled && setOpen(next)}
      trigger="click"
      placement="bottomRight"
      content={
        <div className="confirm-action-content">
          <div className="confirm-action-copy">
            <IconChip icon={danger ? <ExclamationCircleOutlined /> : <CheckOutlined />} tone={danger ? 'danger' : tone} size="sm" />
            <div>
              <strong>{title}</strong>
              {description ? <p>{description}</p> : null}
            </div>
          </div>
          <div className="confirm-action-buttons">
            <Button size="small" onClick={() => setOpen(false)}>{cancelLabel}</Button>
            <Button size="small" type="primary" danger={danger} loading={loading} onClick={() => void confirm()}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      }
    >
      {trigger}
    </AnimatedPopover>
  );
}
