import { useEffect, useMemo, useState, type Key, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Input,
  Select,
  Space,
  Table,
  type TableColumnsType,
  type TableProps,
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { AnimatedDropdown } from '../../lib/motion/overlays';
import { downloadCsv } from '../../lib/csv';
import { useTemplate } from '../../theme/ThemeProvider';
import { EmptyState, FilterBar } from '../primitives';

export type DataWorkspaceQuery = {
  search: string;
  page: number;
  pageSize: number;
  sortKey?: string;
  sortOrder?: 'ascend' | 'descend';
  filters: Record<string, string | undefined>;
};

export type DataFilter<T> = {
  key: Extract<keyof T, string> | string;
  label: string;
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
  getValue?: (row: T) => unknown;
};

export type SavedDataView = {
  key: string;
  label: string;
  query: Partial<Omit<DataWorkspaceQuery, 'filters'>> & {
    filters?: Record<string, string | undefined>;
  };
};

export type BulkAction<T> = {
  key: string;
  label: string;
  danger?: boolean;
  onClick: (rows: T[]) => void;
};

export interface EnterpriseDataTableProps<T extends { id: string }> {
  rows: T[];
  columns: TableColumnsType<T>;
  workspaceKey: string;
  searchPlaceholder?: string;
  filters?: DataFilter<T>[];
  savedViews?: SavedDataView[];
  rowActions?: (row: T) => ReactNode;
  onOpen?: (row: T) => void;
  onRefresh?: () => void | Promise<void>;
  refreshLoading?: boolean;
  exportName?: string;
  bulkActions?: BulkAction<T>[];
  loading?: boolean;
  error?: ReactNode;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  mode?: 'client' | 'server';
  total?: number;
  onQueryChange?: (query: DataWorkspaceQuery) => void;
  urlState?: boolean;
  extraActions?: ReactNode;
}

function numberParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function EnterpriseDataTable<T extends { id: string }>({
  rows,
  columns,
  workspaceKey,
  searchPlaceholder = 'Search records…',
  filters = [],
  savedViews = [],
  rowActions,
  onOpen,
  onRefresh,
  refreshLoading,
  exportName,
  bulkActions = [],
  loading,
  error,
  emptyTitle = 'No records found',
  emptyDescription = 'Try changing the search or filters.',
  mode = 'client',
  total,
  onQueryChange,
  urlState = true,
  extraActions,
}: EnterpriseDataTableProps<T>) {
  const { config } = useTemplate();
  const [searchParams, setSearchParams] = useSearchParams();
  const prefix = `dw_${workspaceKey}_`;
  const initialFilters = Object.fromEntries(
    filters.map((filter) => [filter.key, urlState ? searchParams.get(`${prefix}f_${filter.key}`) ?? undefined : undefined]),
  );
  const [query, setQuery] = useState<DataWorkspaceQuery>({
    search: urlState ? searchParams.get(`${prefix}q`) ?? '' : '',
    page: urlState ? numberParam(searchParams.get(`${prefix}page`), 1) : 1,
    pageSize: urlState
      ? numberParam(searchParams.get(`${prefix}size`), config.table.defaultPageSize)
      : config.table.defaultPageSize,
    sortKey: urlState ? searchParams.get(`${prefix}sort`) ?? undefined : undefined,
    sortOrder: urlState
      ? (searchParams.get(`${prefix}order`) as DataWorkspaceQuery['sortOrder']) ?? undefined
      : undefined,
    filters: initialFilters,
  });
  const [selected, setSelected] = useState<Key[]>([]);
  const [hidden, setHidden] = useState<string[]>(config.table.hiddenColumns);

  useEffect(() => setHidden(config.table.hiddenColumns), [config.table.hiddenColumns]);
  useEffect(() => {
    setQuery((current) => ({ ...current, pageSize: config.table.defaultPageSize }));
  }, [config.table.defaultPageSize]);

  useEffect(() => {
    onQueryChange?.(query);
    if (!urlState) return;
    const next = new URLSearchParams(searchParams);
    const write = (key: string, value: string | number | undefined, defaultValue?: string | number) => {
      const param = `${prefix}${key}`;
      if (value === undefined || value === '' || value === defaultValue) next.delete(param);
      else next.set(param, String(value));
    };
    write('q', query.search);
    write('page', query.page, 1);
    write('size', query.pageSize, config.table.defaultPageSize);
    write('sort', query.sortKey);
    write('order', query.sortOrder);
    for (const filter of filters) write(`f_${filter.key}`, query.filters[String(filter.key)]);
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [query, onQueryChange, urlState, prefix, filters, searchParams, setSearchParams, config.table.defaultPageSize]);

  const filteredRows = useMemo(() => {
    if (mode === 'server') return rows;
    const term = query.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (term && !Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term))) return false;
      return filters.every((filter) => {
        const expected = query.filters[String(filter.key)];
        if (!expected) return true;
        const actual = filter.getValue ? filter.getValue(row) : (row as Record<string, unknown>)[String(filter.key)];
        return String(actual ?? '') === expected;
      });
    });
  }, [filters, mode, query.filters, query.search, rows]);

  const resolvedColumns = useMemo<TableColumnsType<T>>(() => {
    const visible = columns.filter((column) => !hidden.includes(String(column.key)));
    if (!rowActions) return visible;
    return [
      ...visible,
      {
        key: 'workspace-actions',
        title: '',
        fixed: 'right',
        width: 88,
        align: 'right',
        render: (_, row) => rowActions(row),
      },
    ];
  }, [columns, hidden, rowActions]);

  const selectedRows = useMemo(
    () => rows.filter((row) => selected.includes(row.id)),
    [rows, selected],
  );

  const updateQuery = (patch: Partial<DataWorkspaceQuery>) => {
    setQuery((current) => ({ ...current, ...patch }));
    setSelected([]);
  };

  const applySavedView = (key: string) => {
    const view = savedViews.find((item) => item.key === key);
    if (!view) return;
    setQuery((current) => ({
      ...current,
      ...view.query,
      filters: { ...current.filters, ...(view.query.filters ?? {}) },
      page: 1,
    }));
    setSelected([]);
  };

  const reset = () => {
    setQuery({
      search: '',
      page: 1,
      pageSize: config.table.defaultPageSize,
      filters: Object.fromEntries(filters.map((filter) => [filter.key, undefined])),
    });
    setSelected([]);
  };

  const exportRows = () => {
    const source = selectedRows.length ? selectedRows : filteredRows;
    const exportColumns = resolvedColumns.filter((column) => column.key !== 'workspace-actions');
    downloadCsv(
      exportName ?? workspaceKey,
      exportColumns.map((column) => String(column.title ?? column.key ?? '')),
      source.map((row) =>
        exportColumns.map((column) => {
          const key = String(column.dataIndex ?? column.key ?? '');
          return (row as Record<string, unknown>)[key];
        }),
      ),
    );
  };

  const handleChange: NonNullable<TableProps<T>['onChange']> = (pagination, _tableFilters, sorter) => {
    const sort = Array.isArray(sorter) ? sorter[0] : sorter;
    updateQuery({
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? query.pageSize,
      sortKey: sort?.field ? String(sort.field) : undefined,
      sortOrder: sort?.order ?? undefined,
    });
  };

  const hasFilters = Boolean(query.search.trim()) || Object.values(query.filters).some(Boolean);

  return (
    <section className="panel enterprise-data-workspace" aria-busy={loading || refreshLoading}>
      {error ? <Alert type="error" showIcon message="Unable to load records" description={error} /> : null}
      {savedViews.length ? (
        <div className="enterprise-saved-views" aria-label="Saved views">
          {savedViews.map((view) => (
            <Button key={view.key} size="small" onClick={() => applySavedView(view.key)}>
              {view.label}
            </Button>
          ))}
        </div>
      ) : null}
      <FilterBar
        search={
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={query.search}
            onChange={(event) => updateQuery({ search: event.target.value, page: 1 })}
            placeholder={searchPlaceholder}
            aria-label="Search table"
          />
        }
        filters={
          filters.length ? (
            <Space wrap size={8}>
              {filters.map((filter) => (
                <Select
                  allowClear
                  key={String(filter.key)}
                  aria-label={filter.label}
                  placeholder={filter.placeholder ?? filter.label}
                  value={query.filters[String(filter.key)]}
                  options={filter.options}
                  onChange={(value) =>
                    updateQuery({
                      page: 1,
                      filters: { ...query.filters, [String(filter.key)]: value },
                    })
                  }
                  style={{ minWidth: 132 }}
                />
              ))}
              {hasFilters ? <Button onClick={reset}>Reset</Button> : null}
            </Space>
          ) : null
        }
        actions={
          <Space wrap>
            {selectedRows.length && bulkActions.length
              ? bulkActions.map((action) => (
                  <Button
                    key={action.key}
                    danger={action.danger}
                    onClick={() => action.onClick(selectedRows)}
                  >
                    {action.label} ({selectedRows.length})
                  </Button>
                ))
              : null}
            {onRefresh ? (
              <Button icon={<ReloadOutlined />} loading={refreshLoading} onClick={() => void onRefresh()}>
                Refresh
              </Button>
            ) : null}
            <AnimatedDropdown
              trigger={['click']}
              menu={{
                selectable: false,
                items: columns.map((column) => ({
                  key: String(column.key),
                  label: `${hidden.includes(String(column.key)) ? '' : '✓ '} ${String(column.title ?? column.key)}`,
                })),
                onClick: ({ key }) =>
                  setHidden((current) =>
                    current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
                  ),
              }}
            >
              <Button icon={<SettingOutlined />} aria-label="Choose visible columns">
                Columns
              </Button>
            </AnimatedDropdown>
            {exportName ? (
              <Button icon={<DownloadOutlined />} onClick={exportRows}>
                Export
              </Button>
            ) : null}
            {extraActions}
          </Space>
        }
      />
      <Table<T>
        rowKey="id"
        sticky
        columns={resolvedColumns}
        dataSource={filteredRows}
        loading={loading}
        rowSelection={bulkActions.length ? { selectedRowKeys: selected, onChange: setSelected } : undefined}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total: mode === 'server' ? total : filteredRows.length,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100, 250],
          showTotal: (count) => `${count} records`,
        }}
        onChange={handleChange}
        onRow={onOpen ? (row) => ({ onDoubleClick: () => onOpen(row) }) : undefined}
        virtual={mode === 'client' && filteredRows.length > 200}
        scroll={{
          x: Math.max(960, resolvedColumns.length * 150),
          y: mode === 'client' && filteredRows.length > 200 ? 560 : undefined,
        }}
        locale={{
          emptyText: (
            <EmptyState
              title={emptyTitle}
              description={hasFilters ? emptyDescription : 'There are no records in this workspace yet.'}
            />
          ),
        }}
        size={config.layout.density === 'compact' ? 'small' : 'middle'}
      />
    </section>
  );
}
