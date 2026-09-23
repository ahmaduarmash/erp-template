import { useMemo, useState } from 'react';
import type { TableColumnsType } from 'antd';
import { PageHeader } from '../../components/shell/PageHeader';
import { MotionSurface } from '../../lib/motion';
import { useWorkspace } from '../../data/WorkspaceProvider';
import type { RecordData } from '../../data/modules';
import { useFeedback } from '../../components/feedback';
import {
  ActionMenu,
  DomainTable,
  EntityCell,
  KpiStrip,
  QuickViews,
  SemanticStatus,
  StockProgress,
} from '../../components/erp/ErpPrimitives';

export function StockLevelsWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const [view, setView] = useState('all');
  const source = workspace.records['stock-levels'];
  const rows = source.filter(
    (row) =>
      view === 'all' ||
      (view === 'low' && Number(row.quantity) <= Number(row.reorder) && Number(row.quantity) > 0) ||
      (view === 'out' && Number(row.quantity) === 0),
  );

  const columns = useMemo<TableColumnsType<RecordData>>(
    () => [
      {
        key: 'name',
        title: 'Product',
        dataIndex: 'name',
        width: 240,
        render: (value) => <EntityCell title={value} subtitle="Tracked item" />,
      },
      { key: 'warehouse', title: 'Warehouse', dataIndex: 'warehouse', width: 190 },
      { key: 'actual', title: 'Actual', width: 90, align: 'right', render: (_, row) => row.quantity },
      {
        key: 'reserved',
        title: 'Reserved',
        width: 90,
        align: 'right',
        render: (_, row) => Math.min(8, Math.floor(Number(row.quantity) * 0.15)),
      },
      {
        key: 'incoming',
        title: 'Incoming',
        width: 90,
        align: 'right',
        render: (_, row) => Number(row.reorder) + 6,
      },
      {
        key: 'available',
        title: 'Available',
        width: 100,
        align: 'right',
        render: (_, row) =>
          Math.max(0, Number(row.quantity) - Math.min(8, Math.floor(Number(row.quantity) * 0.15))),
      },
      {
        key: 'projected',
        title: 'Projected',
        width: 100,
        align: 'right',
        render: (_, row) =>
          Number(row.quantity) +
          Number(row.reorder) +
          6 -
          Math.min(8, Math.floor(Number(row.quantity) * 0.15)),
      },
      {
        key: 'reorder',
        title: 'Reorder',
        width: 150,
        render: (_, row) => <StockProgress current={Number(row.quantity)} target={Number(row.reorder)} />,
      },
      {
        key: 'status',
        title: 'Status',
        width: 120,
        render: (_, row) => (
          <SemanticStatus
            value={
              Number(row.quantity) === 0
                ? 'Out of stock'
                : Number(row.quantity) <= Number(row.reorder)
                  ? 'Low stock'
                  : 'In stock'
            }
          />
        ),
      },
    ],
    [],
  );

  const lowCount = source.filter(
    (row) => Number(row.quantity) <= Number(row.reorder) && Number(row.quantity) > 0,
  ).length;
  const outCount = source.filter((row) => Number(row.quantity) === 0).length;

  return (
    <MotionSurface page>
      <PageHeader
        title="Inventory availability"
        group="Inventory"
        description="A derived operational view of actual, reserved, incoming, available and projected stock."
      />
      <KpiStrip
        items={[
          {
            label: 'Units on hand',
            value: source.reduce((sum, row) => sum + Number(row.quantity), 0).toLocaleString(),
            hint: 'actual quantity',
          },
          { label: 'Low stock', value: lowCount, hint: 'needs replenishment' },
          { label: 'Out of stock', value: outCount, hint: 'zero available' },
          {
            label: 'Warehouses',
            value: new Set(source.map((row) => row.warehouse)).size,
            hint: 'stock locations',
          },
        ]}
      />
      <QuickViews
        value={view}
        onChange={setView}
        items={[
          { value: 'all', label: `All (${source.length})` },
          { value: 'low', label: `Low stock (${lowCount})` },
          { value: 'out', label: `Out of stock (${outCount})` },
        ]}
      />
      <DomainTable
        rows={rows}
        columns={columns}
        searchPlaceholder="Search product or warehouse…"
        rowActions={(row) => (
          <ActionMenu
            primary={{ label: 'View stock ledger', onClick: () => feedback.success(`Stock ledger: ${row.name}`) }}
            overflow={[
              {
                key: 'adjust',
                label: 'Adjust stock',
                onClick: () => feedback.success('Open a stock adjustment transaction'),
              },
              {
                key: 'transfer',
                label: 'Transfer stock',
                onClick: () => feedback.success('Create a stock transfer document'),
              },
              {
                key: 'replenish',
                label: 'Create purchase request',
                onClick: () => feedback.success('Replenishment workflow ready for integration'),
              },
            ]}
          />
        )}
      />
    </MotionSurface>
  );
}
