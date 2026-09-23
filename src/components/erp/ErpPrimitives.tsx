import { useMemo, useState, type ReactNode } from 'react';
import {
  Avatar,
  Input,
  Space,
  Statistic,
  Table,
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
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  StopOutlined,
  SwapOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { RecordData } from '../../data/modules';
import {
  ActionIcon,
  EntityCell as SharedEntityCell,
  MoneyCell as SharedMoneyCell,
  OverflowMenu,
  ProgressCell,
  QuickFilterTabs,
  StatusPill,
  type OverflowAction,
  type SemanticTone,
} from '../primitives';

export type RowAction = OverflowAction;

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
  return <SharedMoneyCell value={value} currency={currency} muted={muted} />;
}

export function EntityCell({
  title,
  subtitle,
  initials,
  onClick,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  initials?: string;
  onClick?: () => void;
}) {
  return (
    <SharedEntityCell
      title={title}
      subtitle={subtitle}
      onClick={onClick}
      leading={initials ? <Avatar size={30}>{initials}</Avatar> : undefined}
    />
  );
}

const successStatuses = new Set(['Active', 'Paid', 'Completed', 'Received', 'Approved', 'Posted', 'In stock', 'Available']);
const warningStatuses = new Set(['Draft', 'Pending', 'Partly Paid', 'Low stock', 'In transit', 'Invited', 'Reviewed']);
const dangerStatuses = new Set(['Overdue', 'Failed', 'Rejected', 'Cancelled', 'Out of stock', 'Suspended']);
const infoStatuses = new Set(['Sent', 'Submitted', 'Unpaid']);

function statusTone(value: string): SemanticTone {
  if (successStatuses.has(value)) return 'success';
  if (warningStatuses.has(value)) return 'warning';
  if (dangerStatuses.has(value)) return 'danger';
  if (infoStatuses.has(value)) return 'info';
  return 'neutral';
}

export function SemanticStatus({ value }: { value: string }) {
  return <StatusPill tone={statusTone(value)}>{value}</StatusPill>;
}

export function ActionMenu({
  primary,
  overflow,
}: {
  primary?: { label: string; onClick: () => void; icon?: ReactNode };
  overflow: RowAction[];
}) {
  const actions = overflow.map((action) => ({ ...action, icon: action.icon ?? actionIcon(action.key) }));
  return (
    <Space size={3}>
      {primary ? (
        <ActionIcon
          label={primary.label}
          icon={primary.icon ?? <EyeOutlined />}
          onClick={primary.onClick}
        />
      ) : null}
      <OverflowMenu actions={actions} />
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
  return <QuickFilterTabs value={value} onChange={onChange} items={items} />;
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
  return <ProgressCell value={current} max={target} status={current <= target ? 'exception' : 'normal'} />;
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
