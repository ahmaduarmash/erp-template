import { memo, useCallback, useEffect, useMemo, useState, type Key } from 'react';
import { Button, Input, Space, Table, Tag, Tooltip, type TableColumnsType } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { ConfirmPopover } from './ConfirmPopover';
import { EmptyState, PageSkeleton } from '../feedback';
import { useTemplate } from '../../theme/ThemeProvider';
import { AnimatedDropdown } from '../../lib/motion/overlays';
import { downloadCsv } from '../../lib/csv';
import type { RecordData } from '../../data/modules';

const danger = ['Overdue', 'Failed', 'Suspended', 'Rejected', 'Out of stock'];
const success = ['Active', 'Paid', 'Completed', 'Received', 'Approved', 'In stock', 'Success'];

export const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  return (
    <Tag
      bordered={false}
      color={danger.includes(status) ? 'error' : success.includes(status) ? 'success' : 'default'}
    >
      <span className="status-dot" />
      {status}
    </Tag>
  );
});

export interface DataTableProps {
  rows: RecordData[];
  columns: TableColumnsType<RecordData>;
  name: string;
  onEdit?: (row: RecordData) => void;
  onView?: (row: RecordData) => void;
  onDelete?: (ids: string[]) => void;
  loading?: boolean;
  searchPlaceholder?: string;
}

const rowKey = (row: RecordData) => row.id;

export const DataTable = memo(function DataTable({
  rows,
  columns,
  name,
  onEdit,
  onView,
  onDelete,
  loading,
  searchPlaceholder = 'Search records…',
}: DataTableProps) {
  const { config } = useTemplate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Key[]>([]);
  const [hidden, setHidden] = useState<string[]>(config.table.hiddenColumns);
  const [pageSize, setPageSize] = useState(config.table.defaultPageSize);
  const [page, setPage] = useState(1);
  const [filteredRows, setFilteredRows] = useState<RecordData[] | null>(null);

  useEffect(() => setPageSize(config.table.defaultPageSize), [config.table.defaultPageSize]);
  useEffect(() => setHidden(config.table.hiddenColumns), [config.table.hiddenColumns]);
  useEffect(() => {
    setSelected([]);
    setFilteredRows(null);
  }, [rows]);

  const searched = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? rows.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(term)))
      : rows;
  }, [rows, query]);

  const actions = useMemo<TableColumnsType<RecordData>>(
    () =>
      onView || onEdit || onDelete
        ? [
            {
              key: 'actions',
              title: '',
              width: 112,
              fixed: 'right',
              render: (_, row) => (
                <Space size={2}>
                  {onView && (
                    <Tooltip title="View">
                      <Button
                        type="text"
                        size="small"
                        aria-label={`View ${row.name}`}
                        icon={<EyeOutlined />}
                        onClick={() => onView(row)}
                      />
                    </Tooltip>
                  )}
                  {onEdit && (
                    <Tooltip title="Edit">
                      <Button
                        type="text"
                        size="small"
                        aria-label={`Edit ${row.name}`}
                        icon={<EditOutlined />}
                        onClick={() => onEdit(row)}
                      />
                    </Tooltip>
                  )}
                  {onDelete && (
                    <ConfirmPopover onConfirm={() => onDelete([row.id])}>
                      <Button
                        type="text"
                        danger
                        size="small"
                        aria-label={`Delete ${row.name}`}
                        icon={<DeleteOutlined />}
                      />
                    </ConfirmPopover>
                  )}
                </Space>
              ),
            },
          ]
        : [],
    [onEdit, onDelete, onView],
  );

  const visible = useMemo(
    () => [...columns.filter((c) => !hidden.includes(String(c.key))), ...actions],
    [columns, hidden, actions],
  );
  const selection = useMemo(
    () => (onDelete ? { selectedRowKeys: selected, onChange: setSelected } : undefined),
    [selected, onDelete],
  );
  const pagination = useMemo(
    () => ({
      current: page,
      pageSize,
      showSizeChanger: true,
      pageSizeOptions: [10, 20, 50, 100, 250, 500],
      showTotal: (total: number) => `${total} records`,
    }),
    [page, pageSize],
  );
  const change = useCallback<
    NonNullable<React.ComponentProps<typeof Table<RecordData>>['onChange']>
  >((p, _filters, _sorter, extra) => {
    setPage(p.current || 1);
    setPageSize(p.pageSize || 10);
    setFilteredRows(extra.currentDataSource);
  }, []);

  const exportRows = () => {
    const source = filteredRows || searched;
    const data = selected.length ? source.filter((r) => selected.includes(r.id)) : source;
    const exportColumns = visible.filter((c) => c.key !== 'actions');
    downloadCsv(
      name,
      exportColumns.map((c) => String(c.title)),
      data.map((row) => exportColumns.map((c) => row[String(c.key)])),
    );
  };

  if (loading)
    return (
      <section className="panel">
        <PageSkeleton />
      </section>
    );

  return (
    <section className="panel table-panel">
      <div className="table-toolbar">
        <Input
          allowClear
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
            setFilteredRows(null);
            setSelected([]);
          }}
          prefix={<SearchOutlined />}
          placeholder={searchPlaceholder}
          aria-label="Search table"
          style={{ maxWidth: 320 }}
        />
        <Space wrap>
          {selected.length > 0 && onDelete && (
            <ConfirmPopover
              title={`Delete ${selected.length} selected records?`}
              onConfirm={() => {
                onDelete(selected.map(String));
                setSelected([]);
              }}
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete ({selected.length})
              </Button>
            </ConfirmPopover>
          )}
          <AnimatedDropdown
            trigger={['click']}
            menu={{
              items: columns.map((c) => ({
                key: String(c.key),
                label: (
                  <span>
                    {!hidden.includes(String(c.key)) ? '✓ ' : ''}
                    {String(c.title)}
                  </span>
                ),
              })),
              onClick: ({ key }) =>
                setHidden((h) => (h.includes(key) ? h.filter((k) => k !== key) : [...h, key])),
            }}
          >
            <Button icon={<SettingOutlined />}>Columns</Button>
          </AnimatedDropdown>
          <Button icon={<DownloadOutlined />} onClick={exportRows}>
            Export
          </Button>
        </Space>
      </div>
      <Table<RecordData>
        rowKey={rowKey}
        columns={visible}
        dataSource={searched}
        loading={loading}
        rowSelection={selection}
        pagination={pagination}
        onChange={change}
        virtual={searched.length > 200}
        scroll={{
          x: Math.max(900, visible.length * 150),
          y: searched.length > 200 ? 520 : undefined,
        }}
        locale={{ emptyText: <EmptyState /> }}
        size={config.layout.density === 'compact' ? 'small' : 'middle'}
      />
    </section>
  );
});