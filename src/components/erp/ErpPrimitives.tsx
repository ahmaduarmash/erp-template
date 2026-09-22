import { useMemo, useState, type ReactNode } from 'react';
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Progress,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  type MenuProps,
  type TableColumnsType,
} from 'antd';
import {
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DollarOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  MoreOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  StopOutlined,
  SwapOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { RecordData } from '../../data/modules';

export type RowAction = {
  key: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

function actionIcon(key: string): ReactNode {
  const normalized = key.toLowerCase();
  if (normalized.includes('edit')) return <EditOutlined />;
  if (normalized.includes('delete') || normalized.includes('remove')) return <DeleteOutlined />;
  if (normalized.includes('duplicate') || normalized.includes('copy')) return <CopyOutlined />;
  if (normalized.includes('print') || normalized.includes('pdf')) return <PrinterOutlined />;
  if (normalized.includes('send') || normalized.includes('invite')) return <SendOutlined />;
  if (normalized.includes('ledger') || normalized.includes('history') || normalized.includes('audit')) return <AuditOutlined />;
  if (normalized.includes('transfer')) return <SwapOutlined />;
  if (normalized.includes('payment') || normalized.includes('pay')) return <DollarOutlined />;
  if (normalized.includes('post') || normalized.includes('approve') || normalized.includes('receive')) return <FileDoneOutlined />;
  if (normalized.includes('reverse') || normalized.includes('reset')) return <ReloadOutlined />;
  if (normalized.includes('cancel') || normalized.includes('archive') || normalized.includes('suspend')) return <StopOutlined />;
  if (normalized.includes('view') || normalized.includes('open')) return <EyeOutlined />;
  if (normalized.includes('download') || normalized.includes('export')) return <DownloadOutlined />;
  return <FileTextOutlined />;
}

export function formatMoney(value: number | string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function MoneyCell({ value, currency = 'USD', muted }: { value: number | string; currency?: string; muted?: boolean }) {
  return <span className={muted ? 'erp-money muted' : 'erp-money'}>{formatMoney(value, currency)}</span>;
}

export function EntityCell({
  title,
  subtitle,
  initials,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  initials?: string;
}) {
  return (
    <div className="erp-entity-cell">
      {initials ? <Avatar size={30}>{initials}</Avatar> : null}
      <div>
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </div>
    </div>
  );
}

const successStatuses = new Set(['Active', 'Paid', 'Completed', 'Received', 'Approved', 'Posted', 'In stock', 'Available']);
const warningStatuses = new Set(['Draft', 'Pending', 'Partly Paid', 'Low stock', 'In transit', 'Invited', 'Reviewed']);
const dangerStatuses = new Set(['Overdue', 'Failed', 'Rejected', 'Cancelled', 'Out of stock', 'Suspended']);
const infoStatuses = new Set(['Sent', 'Submitted', 'Unpaid']);

export function SemanticStatus({ value }: { value: string }) {
  const color = successStatuses.has(value)
    ? 'success'
    : warningStatuses.has(value)
      ? 'warning'
      : dangerStatuses.has(value)
        ? 'error'
        : infoStatuses.has(value)
          ? 'processing'
          : 'default';
  return (
    <Tag className="erp-status" bordered={false} color={color}>
      <span className="status-dot" /> {value}
    </Tag>
  );
}

export function ActionMenu({
  primary,
  overflow,
}: {
  primary?: { label: string; onClick: () => void; icon?: ReactNode };
  overflow: RowAction[];
}) {
  const items: MenuProps['items'] = overflow.map((action) => ({
    key: action.key,
    label: action.label,
    icon: action.icon ?? actionIcon(action.key),
    danger: action.danger,
    disabled: action.disabled,
    onClick: action.onClick,
  }));
  return (
    <Space size={3}>
      {primary ? (
        <Tooltip title={primary.label} mouseEnterDelay={0.35}>
          <Button
            className="erp-row-action erp-row-action-primary"
            size="small"
            type="text"
            aria-label={primary.label}
            icon={primary.icon ?? <EyeOutlined />}
            onClick={primary.onClick}
          />
        </Tooltip>
      ) : null}
      {overflow.length ? (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <Tooltip title="More actions" mouseEnterDelay={0.35}>
            <Button
              className="erp-row-action erp-row-action-more"
              size="small"
              type="text"
              aria-label="More actions"
              icon={<MoreOutlined />}
            />
          </Tooltip>
        </Dropdown>
      ) : null}
    </Space>
  );
}

export function KpiStrip({
  items,
}: {
  items: Array<{ label: string; value: ReactNode; hint?: string }>;
}) {
  return (
    <div className="erp-kpi-strip">
      {items.map((item) => (
        <div className="erp-kpi" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.hint ? <small>{item.hint}</small> : null}
        </div>
      ))}
    </div>
  );
}

export function DomainTable({
  rows,
  columns,
  searchPlaceholder = 'Search records…',
  rowActions,
  toolbar,
  pageSize = 10,
}: {
  rows: RecordData[];
  columns: TableColumnsType<RecordData>;
  searchPlaceholder?: string;
  rowActions?: (row: RecordData) => ReactNode;
  toolbar?: ReactNode;
  pageSize?: number;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term)));
  }, [query, rows]);
  const resolvedColumns = useMemo<TableColumnsType<RecordData>>(
    () =>
      rowActions
        ? [
            ...columns,
            {
              key: 'erp-actions',
              title: '',
              fixed: 'right',
              width: 82,
              align: 'right',
              render: (_, row) => rowActions(row),
            },
          ]
        : columns,
    [columns, rowActions],
  );
  return (
    <section className="panel erp-table-panel">
      <div className="erp-table-toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          style={{ maxWidth: 340 }}
        />
        <Space wrap>{toolbar}</Space>
      </div>
      <Table<RecordData>
        rowKey="id"
        columns={resolvedColumns}
        dataSource={filtered}
        pagination={{ pageSize, showSizeChanger: true, showTotal: (total) => `${total} records` }}
        scroll={{ x: Math.max(980, resolvedColumns.length * 150) }}
      />
    </section>
  );
}

export function QuickViews({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (value: string) => void;
  items: Array<{ label: ReactNode; value: string }>;
}) {
  return (
    <div className="erp-quick-views">
      <Segmented value={value} onChange={(next) => onChange(String(next))} options={items} />
    </div>
  );
}

export function WorkflowBar({ steps, current }: { steps: string[]; current: string }) {
  const currentIndex = Math.max(0, steps.indexOf(current));
  return (
    <div className="erp-workflow">
      {steps.map((step, index) => (
        <div className={`erp-workflow-step ${index <= currentIndex ? 'done' : ''} ${step === current ? 'current' : ''}`} key={step}>
          <span>{index < currentIndex ? <CheckCircleOutlined /> : index + 1}</span>
          <strong>{step}</strong>
        </div>
      ))}
    </div>
  );
}

export function StockProgress({ current, target }: { current: number; target: number }) {
  const percent = Math.min(100, Math.round((current / Math.max(target, 1)) * 100));
  return (
    <div className="erp-progress-cell">
      <Progress percent={percent} size="small" showInfo={false} status={current <= target ? 'exception' : 'normal'} />
      <small>{current} / {target}</small>
    </div>
  );
}

export function DocumentSummary({
  items,
}: {
  items: Array<{ label: string; value: number | string; prefix?: string }>;
}) {
  return (
    <div className="erp-document-summary">
      {items.map((item) => (
        <Statistic key={item.label} title={item.label} value={item.value} prefix={item.prefix} />
      ))}
    </div>
  );
}

export function EmptyActionState({ message }: { message: string }) {
  return (
    <div className="erp-empty-inline">
      <CloseCircleOutlined />
      <span>{message}</span>
    </div>
  );
}

export const ListIcon = UnorderedListOutlined;
