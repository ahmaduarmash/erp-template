import { useMemo } from 'react';
import type { TableColumnsType } from 'antd';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable, StatusBadge } from '../../components/data/DataTable';
import { useWorkspace } from '../../data/WorkspaceProvider';
import type { RecordData } from '../../data/modules';
import { MotionSurface } from '../../lib/motion';
export default function AuditLog() {
  const { activity } = useWorkspace();
  const columns = useMemo<TableColumnsType<RecordData>>(
    () => [
      { key: 'name', dataIndex: 'name', title: 'Actor', width: 160 },
      { key: 'action', dataIndex: 'action', title: 'Activity', width: 340 },
      {
        key: 'module',
        dataIndex: 'module',
        title: 'Module',
        width: 160,
        filters: [...new Set(activity.map((a) => a.module))].map((v) => ({ text: v, value: v })),
        onFilter: (v, r) => r.module === v,
      },
      {
        key: 'date',
        dataIndex: 'date',
        title: 'Time',
        width: 210,
        sorter: (a, b) => String(a.date).localeCompare(String(b.date)),
        render: (v) => new Date(v).toLocaleString(),
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: 'Result',
        width: 120,
        render: (v) => <StatusBadge status={v} />,
      },
    ],
    [activity],
  );
  return (
    <MotionSurface page>
      <PageHeader
        title="Audit log"
        group="System"
        description="A traceable record of changes in your demo workspace."
      />
      <DataTable rows={activity as unknown as RecordData[]} columns={columns} name="audit-log" />
    </MotionSurface>
  );
}
