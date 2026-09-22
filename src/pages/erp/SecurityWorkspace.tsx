import { useMemo, useState } from 'react';
import { Avatar, Button, Checkbox, Drawer, Input, Select, Space, Tabs, Tag, type TableColumnsType } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/shell/PageHeader';
import { MotionSurface } from '../../lib/motion';
import { useWorkspace } from '../../data/WorkspaceProvider';
import type { RecordData } from '../../data/modules';
import { ActionMenu, DomainTable, EntityCell, KpiStrip, SemanticStatus } from '../../components/erp/ErpPrimitives';
import { useFeedback } from '../../components/feedback';

const permissionColumns = ['View', 'Create', 'Edit', 'Delete', 'Submit', 'Approve', 'Export'];
const permissionModules = ['Products', 'Stock levels', 'Stock transfers', 'Purchase orders', 'Suppliers', 'Chart of accounts', 'Journal entries', 'Sales invoices', 'Payments', 'Expenses', 'Customers'];

export function SecurityWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records.users;
  const [selected, setSelected] = useState<RecordData | null>(null);
  const [activeRole, setActiveRole] = useState('Manager');
  const [matrix, setMatrix] = useState<Record<string, string[]>>(() => Object.fromEntries(permissionModules.map((module, index) => [module, index < 6 ? ['View', 'Create', 'Edit', 'Export'] : ['View']])));
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    {
      key: 'name',
      title: 'User',
      dataIndex: 'name',
      width: 260,
      render: (value, row) => (
        <EntityCell
          title={value}
          subtitle={row.email}
          initials={String(value).split(' ').map((part) => part[0]).join('').slice(0, 2)}
        />
      ),
    },
    { key: 'role', title: 'Role', dataIndex: 'role', width: 150, render: (value) => <Tag bordered={false}>{value}</Tag> },
    { key: 'department', title: 'Department', dataIndex: 'department', width: 160 },
    { key: 'scope', title: 'Scope', width: 180, render: () => 'All warehouses' },
    { key: 'mfa', title: '2FA', width: 90, render: (_, row) => Number(String(row.id).replace(/\D/g, '').slice(-1) || 0) % 2 === 0 ? 'On' : 'Off' },
    { key: 'lastActive', title: 'Last active', width: 150, render: (_, row) => Number(String(row.id).replace(/\D/g, '').slice(-1) || 0) % 3 === 0 ? '2 days ago' : 'Today' },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value)} /> },
  ], []);
  return (
    <MotionSurface page>
      <PageHeader title="Team & access" group="System" description="Identity, role permissions, scoped access and user lifecycle in one security workspace." action={<Button type="primary" icon={<PlusOutlined />}>Invite user</Button>} />
      <KpiStrip items={[{ label: 'Users', value: rows.length }, { label: 'Active', value: rows.filter((row) => row.status === 'Active').length }, { label: 'Invited', value: rows.filter((row) => row.status === 'Invited').length }, { label: 'Suspended', value: rows.filter((row) => row.status === 'Suspended').length }]} />
      <Tabs items={[
        {
          key: 'users',
          label: 'Users',
          children: <DomainTable rows={rows} columns={columns} rowActions={(row) => <ActionMenu primary={{ label: 'View', onClick: () => setSelected(row) }} overflow={[{ key: 'edit', label: 'Edit access', onClick: () => setSelected(row) }, { key: 'resend', label: 'Resend invitation', onClick: () => feedback.success('Invitation resent'), disabled: row.status !== 'Invited' }, { key: 'sessions', label: 'Reset sessions', onClick: () => feedback.success('Session reset belongs in the production auth adapter') }, { key: 'audit', label: 'View audit history', onClick: () => feedback.success('User audit history') }, { key: 'suspend', label: row.status === 'Suspended' ? 'Reactivate' : 'Suspend', onClick: () => workspace.save('users', { ...row, status: row.status === 'Suspended' ? 'Active' : 'Suspended' }), danger: row.status !== 'Suspended' }]} />} />,
        },
        {
          key: 'roles',
          label: 'Roles & permissions',
          children: <section className="panel erp-security-panel"><div className="erp-security-toolbar"><Space><span className="muted">Role</span><Select value={activeRole} onChange={setActiveRole} style={{ width: 180 }} options={['Admin', 'Manager', 'Member'].map((value) => ({ value, label: value }))} /></Space><Button type="primary" onClick={() => { const flattened = Array.from(new Set(Object.values(matrix).flat())); workspace.updateRole(activeRole, flattened); feedback.success(`${activeRole} permission matrix saved`); }}>Save permissions</Button></div><div className="erp-permission-table"><div className="erp-permission-row erp-permission-head"><strong>Module</strong>{permissionColumns.map((column) => <strong key={column}>{column}</strong>)}</div>{permissionModules.map((module) => <div className="erp-permission-row" key={module}><span>{module}</span>{permissionColumns.map((permission) => <Checkbox key={permission} checked={matrix[module]?.includes(permission)} onChange={(event) => setMatrix((current) => ({ ...current, [module]: event.target.checked ? [...(current[module] ?? []), permission] : (current[module] ?? []).filter((item) => item !== permission) }))} />)}</div>)}</div></section>,
        },
        {
          key: 'scope',
          label: 'Scoped access',
          children: <section className="panel p-6"><div className="widget-heading"><div><h2>Data scope</h2><p className="muted">Restrict roles and users beyond action permissions.</p></div></div><div className="form-grid"><div><label className="muted">Companies</label><Select mode="multiple" defaultValue={['Aster Operations']} options={[{ value: 'Aster Operations', label: 'Aster Operations' }]} style={{ width: '100%' }} /></div><div><label className="muted">Warehouses</label><Select mode="multiple" defaultValue={['Central warehouse', 'North fulfillment']} options={workspace.records.warehouses.map((row) => ({ value: row.name, label: row.name }))} style={{ width: '100%' }} /></div><div><label className="muted">Departments</label><Select mode="multiple" defaultValue={['Operations', 'Finance']} options={['Operations', 'Finance', 'People', 'Engineering'].map((value) => ({ value, label: value }))} style={{ width: '100%' }} /></div><div><label className="muted">Customer groups</label><Input defaultValue="All customer groups" /></div></div></section>,
        },
      ]} />
      <Drawer width={560} open={!!selected} title={selected?.name ? String(selected.name) : 'User'} onClose={() => setSelected(null)}>{selected ? <><div className="erp-user-profile"><Avatar size={56}>{String(selected.name).split(' ').map((part) => part[0]).join('').slice(0, 2)}</Avatar><div><h3>{selected.name}</h3><p className="muted">{selected.email}</p></div><SemanticStatus value={String(selected.status)} /></div><div className="form-grid"><div><label className="muted">Role</label><Select defaultValue={selected.role} options={['Admin', 'Manager', 'Member'].map((value) => ({ value, label: value }))} style={{ width: '100%' }} /></div><div><label className="muted">Department</label><Select defaultValue={selected.department} options={['Operations', 'Finance', 'People', 'Engineering'].map((value) => ({ value, label: value }))} style={{ width: '100%' }} /></div><div><label className="muted">Warehouse scope</label><Select mode="multiple" defaultValue={['Central warehouse']} options={workspace.records.warehouses.map((row) => ({ value: row.name, label: row.name }))} style={{ width: '100%' }} /></div></div></> : null}</Drawer>
    </MotionSurface>
  );
}
