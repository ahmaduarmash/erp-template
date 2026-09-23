import { useMemo, useState } from 'react';
import { Avatar, Button, Checkbox, Descriptions, Form, Input, Select, Space, Tabs, Tag, type TableColumnsType } from 'antd';
import { PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/shell/PageHeader';
import { MotionSurface } from '../../lib/motion';
import { useWorkspace } from '../../data/WorkspaceProvider';
import type { RecordData } from '../../data/modules';
import { ActionMenu, DomainTable, EntityCell, KpiStrip, SemanticStatus } from '../../components/erp/ErpPrimitives';
import { useFeedback } from '../../components/feedback';
import { ConfirmActionPopover, CreateModal, EditModal, RecordDrawer } from '../../components/overlays';
import { IconChip } from '../../components/primitives';

const permissionColumns = ['View', 'Create', 'Edit', 'Delete', 'Submit', 'Approve', 'Export'];
const permissionModules = ['Products', 'Stock levels', 'Stock transfers', 'Purchase orders', 'Suppliers', 'Chart of accounts', 'Journal entries', 'Sales invoices', 'Payments', 'Expenses', 'Customers'];

export function SecurityWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records.users;
  const [selected, setSelected] = useState<RecordData | null>(null);
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activeRole, setActiveRole] = useState('Manager');
  const [matrix, setMatrix] = useState<Record<string, string[]>>(() => Object.fromEntries(permissionModules.map((module, index) => [module, index < 6 ? ['View', 'Create', 'Edit', 'Export'] : ['View']])));
  const [inviteForm] = Form.useForm();
  const [accessForm] = Form.useForm();

  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'User', dataIndex: 'name', width: 260, render: (value, row) => <EntityCell title={value} subtitle={row.email} initials={String(value).split(' ').map((part) => part[0]).join('').slice(0, 2)} onClick={() => setSelected(row)} /> },
    { key: 'role', title: 'Role', dataIndex: 'role', width: 150, render: (value) => <Tag bordered={false}>{value}</Tag> },
    { key: 'department', title: 'Department', dataIndex: 'department', width: 160 },
    { key: 'scope', title: 'Scope', width: 180, render: () => 'All warehouses' },
    { key: 'mfa', title: '2FA', width: 90, render: (_, row) => Number(String(row.id).replace(/\D/g, '').slice(-1) || 0) % 2 === 0 ? 'On' : 'Off' },
    { key: 'lastActive', title: 'Last active', width: 150, render: (_, row) => Number(String(row.id).replace(/\D/g, '').slice(-1) || 0) % 3 === 0 ? '2 days ago' : 'Today' },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value)} /> },
  ], []);

  const openAccessEditor = (row: RecordData) => {
    setSelected(null);
    setEditing(row);
    accessForm.setFieldsValue({ role: row.role, department: row.department, warehouseScope: ['Central warehouse'] });
  };

  const invite = async () => {
    const values = await inviteForm.validateFields();
    workspace.save('users', { id: crypto.randomUUID(), ...values, status: 'Invited' });
    setInviteOpen(false);
    inviteForm.resetFields();
    feedback.success('User invitation created');
  };

  const saveAccess = async () => {
    if (!editing) return;
    const values = await accessForm.validateFields();
    workspace.save('users', { ...editing, role: values.role, department: values.department, warehouseScope: values.warehouseScope });
    setEditing(null);
    accessForm.resetFields();
    feedback.success('User access updated');
  };

  return (
    <MotionSurface page>
      <PageHeader title="Team & access" group="Organization" description="Identity, role permissions, scoped access and user lifecycle in one security workspace." action={<Button type="primary" icon={<PlusOutlined />} onClick={() => setInviteOpen(true)}>Invite user</Button>} />
      <KpiStrip items={[{ label: 'Users', value: rows.length }, { label: 'Active', value: rows.filter((row) => row.status === 'Active').length }, { label: 'Invited', value: rows.filter((row) => row.status === 'Invited').length }, { label: 'Suspended', value: rows.filter((row) => row.status === 'Suspended').length }]} />
      <Tabs items={[
        {
          key: 'users',
          label: 'Users',
          children: <DomainTable rows={rows} columns={columns} rowActions={(row) => <ActionMenu primary={{ label: 'View', onClick: () => setSelected(row) }} overflow={[
            { key: 'edit', label: 'Edit access', onClick: () => openAccessEditor(row) },
            { key: 'resend', label: 'Resend invitation', onClick: () => feedback.success('Invitation resent'), disabled: row.status !== 'Invited' },
            { key: 'sessions', label: 'Reset sessions', onClick: () => feedback.success('Session reset belongs in the production auth adapter') },
            { key: 'audit', label: 'View audit history', onClick: () => setSelected(row) },
          ]} />} />,
        },
        {
          key: 'roles',
          label: 'Roles & permissions',
          children: <section className="panel erp-security-panel"><div className="erp-security-toolbar"><Space><span className="muted">Role</span><Select value={activeRole} onChange={setActiveRole} style={{ width: 180 }} options={['Admin', 'Manager', 'Member'].map((value) => ({ value, label: value }))} /></Space><Button type="primary" onClick={() => { const flattened = Array.from(new Set(Object.values(matrix).flat())); workspace.updateRole(activeRole, flattened); feedback.success(`${activeRole} permission matrix saved`); }}>Save permissions</Button></div><div className="erp-permission-table"><div className="erp-permission-row erp-permission-head"><strong>Module</strong>{permissionColumns.map((column) => <strong key={column}>{column}</strong>)}</div>{permissionModules.map((module) => <div className="erp-permission-row" key={module}><span>{module}</span>{permissionColumns.map((permission) => <Checkbox key={permission} aria-label={`${module} ${permission}`} checked={matrix[module]?.includes(permission)} onChange={(event) => setMatrix((current) => ({ ...current, [module]: event.target.checked ? [...(current[module] ?? []), permission] : (current[module] ?? []).filter((item) => item !== permission) }))} />)}</div>)}</div></section>,
        },
        {
          key: 'scope',
          label: 'Scoped access',
          children: <section className="panel p-6"><div className="widget-heading"><div><h2>Data scope</h2><p className="muted">Restrict roles and users beyond action permissions.</p></div></div><div className="form-grid"><div><label className="muted">Companies</label><Select mode="multiple" defaultValue={['Aster Operations']} options={[{ value: 'Aster Operations', label: 'Aster Operations' }]} style={{ width: '100%' }} /></div><div><label className="muted">Warehouses</label><Select mode="multiple" defaultValue={['Central warehouse', 'North fulfillment']} options={workspace.records.warehouses.map((row) => ({ value: row.name, label: row.name }))} style={{ width: '100%' }} /></div><div><label className="muted">Departments</label><Select mode="multiple" defaultValue={['Operations', 'Finance']} options={['Operations', 'Finance', 'People', 'Engineering'].map((value) => ({ value, label: value }))} style={{ width: '100%' }} /></div><div><label className="muted">Customer groups</label><Input defaultValue="All customer groups" /></div></div></section>,
        },
      ]} />

      <RecordDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={String(selected?.name ?? 'User')}
        subtitle={selected ? String(selected.email) : undefined}
        status={selected ? <SemanticStatus value={String(selected.status)} /> : undefined}
        leading={<IconChip icon={<SafetyCertificateOutlined />} tone="primary" size="lg" />}
        size="md"
        actions={selected ? <Button onClick={() => openAccessEditor(selected)}>Edit access</Button> : undefined}
      >
        {selected ? <><div className="erp-user-profile"><Avatar size={56}>{String(selected.name).split(' ').map((part) => part[0]).join('').slice(0, 2)}</Avatar><div><h3>{selected.name}</h3><p className="muted">{selected.email}</p></div></div><Descriptions column={{ xs: 1, sm: 2 }} items={[
          { key: 'role', label: 'Role', children: selected.role },
          { key: 'department', label: 'Department', children: selected.department },
          { key: 'scope', label: 'Warehouse scope', children: 'All warehouses' },
          { key: 'mfa', label: '2FA', children: Number(String(selected.id).replace(/\D/g, '').slice(-1) || 0) % 2 === 0 ? 'Enabled' : 'Not enabled' },
        ]} /><div className="erp-section-actions"><Button onClick={() => feedback.success('Session reset belongs in the production auth adapter')}>Reset sessions</Button><ConfirmActionPopover title={selected.status === 'Suspended' ? 'Reactivate user' : 'Suspend user'} description={selected.status === 'Suspended' ? 'Restore access for this user.' : 'The user will lose workspace access until reactivated.'} confirmLabel={selected.status === 'Suspended' ? 'Reactivate' : 'Suspend'} danger={selected.status !== 'Suspended'} onConfirm={() => { workspace.save('users', { ...selected, status: selected.status === 'Suspended' ? 'Active' : 'Suspended' }); setSelected((current) => current ? { ...current, status: current.status === 'Suspended' ? 'Active' : 'Suspended' } : current); }}><Button danger={selected.status !== 'Suspended'}>{selected.status === 'Suspended' ? 'Reactivate' : 'Suspend'}</Button></ConfirmActionPopover></div></> : null}
      </RecordDrawer>

      <CreateModal open={inviteOpen} title="Invite user" description="Create a workspace identity and assign an initial role. The invitation remains pending until accepted." icon={<PlusOutlined />} width={620} submitLabel="Send invitation" onCancel={() => { setInviteOpen(false); inviteForm.resetFields(); }} onSubmit={() => void invite()}>
        <Form form={inviteForm} layout="vertical"><div className="form-grid"><Form.Item name="name" label="Full name" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item><Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item><Form.Item name="role" label="Role" initialValue="Member" rules={[{ required: true }]}><Select options={['Admin', 'Manager', 'Member'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="department" label="Department" initialValue="Operations" rules={[{ required: true }]}><Select options={['Operations', 'Finance', 'People', 'Engineering'].map((value) => ({ value, label: value }))} /></Form.Item></div></Form>
      </CreateModal>

      <EditModal open={!!editing} title="Edit user access" description="Change role and scope without mixing inspection and editing in the same drawer." icon={<SafetyCertificateOutlined />} width={640} submitLabel="Save access" onCancel={() => { setEditing(null); accessForm.resetFields(); }} onSubmit={() => void saveAccess()}>
        <Form form={accessForm} layout="vertical"><div className="form-grid"><Form.Item name="role" label="Role" rules={[{ required: true }]}><Select options={['Admin', 'Manager', 'Member'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="department" label="Department" rules={[{ required: true }]}><Select options={['Operations', 'Finance', 'People', 'Engineering'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="warehouseScope" label="Warehouse scope"><Select mode="multiple" options={workspace.records.warehouses.map((row) => ({ value: row.name, label: row.name }))} /></Form.Item></div></Form>
      </EditModal>
    </MotionSurface>
  );
}
