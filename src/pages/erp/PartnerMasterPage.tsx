import { useMemo, useState, type ReactNode } from 'react';
import { Button, Descriptions, Form, Input, Select, Tabs, type TableColumnsType } from 'antd';
import { ShopOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons';
import { EnterpriseDataTable } from '../../components/data/EnterpriseDataTable';
import { ActionMenu, EntityCell, KpiStrip, SemanticStatus } from '../../components/erp/ErpPrimitives';
import { CreateModal, EditModal, RecordDrawer } from '../../components/overlays';
import { IconChip } from '../../components/primitives';
import { PageHeader } from '../../components/shell/PageHeader';
import { useFeedback } from '../../components/feedback';
import { useWorkspace } from '../../data/WorkspaceProvider';
import type { RecordData } from '../../data/modules';
import { MotionSurface } from '../../lib/motion';

export type PartnerMasterKind = 'customers' | 'suppliers';

type PartnerDefinition = {
  title: string;
  singular: string;
  group: 'Sales' | 'Purchasing';
  description: string;
  icon: ReactNode;
  contextTab: string;
  contextDescription: string;
};

const definitions: Record<PartnerMasterKind, PartnerDefinition> = {
  customers: {
    title: 'Customers',
    singular: 'customer',
    group: 'Sales',
    description: 'Customer master data, contact context and account activity without leaving the list.',
    icon: <TeamOutlined />,
    contextTab: 'Receivables',
    contextDescription: 'Invoices, payments and account balance belong here through the accounting adapter.',
  },
  suppliers: {
    title: 'Suppliers',
    singular: 'supplier',
    group: 'Purchasing',
    description: 'Supplier master data, purchasing context and relationship activity in one workspace.',
    icon: <ShopOutlined />,
    contextTab: 'Purchasing',
    contextDescription: 'Purchase orders, receipts and supplier balances belong here through the purchasing adapter.',
  },
};

export default function PartnerMasterPage({ kind }: { kind: PartnerMasterKind }) {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const definition = definitions[kind];
  const rows = workspace.records[kind];
  const [selected, setSelected] = useState<RecordData | null>(null);
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    {
      key: 'name',
      title: definition.singular === 'customer' ? 'Customer' : 'Supplier',
      dataIndex: 'name',
      width: 260,
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
      render: (value, row) => <EntityCell title={value} subtitle={row.location} onClick={() => setSelected(row)} />,
    },
    { key: 'contact', title: 'Contact', dataIndex: 'contact', width: 190, sorter: (a, b) => String(a.contact).localeCompare(String(b.contact)) },
    { key: 'email', title: 'Email', dataIndex: 'email', width: 240 },
    { key: 'phone', title: 'Phone', dataIndex: 'phone', width: 160 },
    { key: 'location', title: 'Location', dataIndex: 'location', width: 170, sorter: (a, b) => String(a.location).localeCompare(String(b.location)) },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, sorter: (a, b) => String(a.status).localeCompare(String(b.status)), render: (value) => <SemanticStatus value={String(value)} /> },
  ], [definition.singular]);

  const openEditor = (row?: RecordData) => {
    setEditing(row ?? null);
    form.resetFields();
    form.setFieldsValue(row ?? { status: 'Active' });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const save = async () => {
    const values = await form.validateFields();
    workspace.save(kind, { id: editing?.id ?? crypto.randomUUID(), ...values });
    feedback.success(`${definition.singular[0].toUpperCase()}${definition.singular.slice(1)} ${editing ? 'updated' : 'created'}`);
    closeEditor();
  };

  const activeCount = rows.filter((row) => row.status === 'Active').length;
  const EditorModal = editing ? EditModal : CreateModal;

  return (
    <MotionSurface page>
      <PageHeader
        title={definition.title}
        group={definition.group}
        description={definition.description}
        action={<Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>New {definition.singular}</Button>}
      />
      <KpiStrip items={[
        { label: definition.title, value: rows.length, hint: 'master records' },
        { label: 'Active', value: activeCount, hint: 'available for transactions' },
        { label: 'Inactive', value: rows.length - activeCount, hint: 'retained for history' },
        { label: 'Locations', value: new Set(rows.map((row) => row.location)).size, hint: 'represented locations' },
      ]} />
      <EnterpriseDataTable<RecordData>
        workspaceKey={kind}
        rows={rows}
        columns={columns}
        searchPlaceholder={`Search ${definition.title.toLowerCase()}, contacts or locations…`}
        exportName={kind}
        onOpen={setSelected}
        onRefresh={() => feedback.success(`${definition.title} refreshed`)}
        filters={[
          { key: 'status', label: 'Status', options: ['Active', 'Inactive'].map((value) => ({ value, label: value })) },
          { key: 'location', label: 'Location', options: [...new Set(rows.map((row) => String(row.location)))].map((value) => ({ value, label: value })) },
        ]}
        savedViews={[
          { key: 'active', label: 'Active', query: { filters: { status: 'Active' } } },
          { key: 'inactive', label: 'Inactive', query: { filters: { status: 'Inactive' } } },
        ]}
        rowActions={(row) => (
          <ActionMenu
            primary={{ label: 'View', onClick: () => setSelected(row) }}
            overflow={[
              { key: 'edit', label: `Edit ${definition.singular}`, onClick: () => openEditor(row) },
              { key: 'activity', label: 'View activity', onClick: () => setSelected(row) },
              {
                key: 'toggle',
                label: row.status === 'Active' ? 'Deactivate' : 'Reactivate',
                danger: row.status === 'Active',
                onClick: () => workspace.save(kind, { ...row, status: row.status === 'Active' ? 'Inactive' : 'Active' }),
              },
            ]}
          />
        )}
      />

      <RecordDrawer
        open={!!selected}
        size="lg"
        title={String(selected?.name ?? definition.singular)}
        subtitle={selected ? `${selected.location} · ${selected.contact}` : undefined}
        status={selected ? <SemanticStatus value={String(selected.status)} /> : undefined}
        leading={<IconChip icon={definition.icon} tone="primary" size="lg" />}
        actions={selected ? <Button onClick={() => { openEditor(selected); setSelected(null); }}>Edit {definition.singular}</Button> : undefined}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <Tabs items={[
            {
              key: 'overview',
              label: 'Overview',
              children: <Descriptions column={{ xs: 1, sm: 2 }} items={[
                { key: 'contact', label: 'Contact person', children: selected.contact },
                { key: 'email', label: 'Email', children: selected.email },
                { key: 'phone', label: 'Phone', children: selected.phone },
                { key: 'location', label: 'Location', children: selected.location },
                { key: 'status', label: 'Status', children: <SemanticStatus value={String(selected.status)} /> },
              ]} />,
            },
            { key: 'context', label: definition.contextTab, children: <p className="muted">{definition.contextDescription}</p> },
            { key: 'activity', label: 'Activity', children: <p className="muted">Changes, communications and audit history will appear here through the repository adapter.</p> },
          ]} />
        ) : null}
      </RecordDrawer>

      <EditorModal
        open={editorOpen}
        title={editing ? `Edit ${definition.singular}` : `New ${definition.singular}`}
        description={editing ? `Update ${definition.singular} master data without losing list context.` : `Create a ${definition.singular} master record for future transactions.`}
        icon={definition.icon}
        width={720}
        submitLabel={editing ? `Save ${definition.singular}` : `Create ${definition.singular}`}
        onCancel={closeEditor}
        onSubmit={() => void save()}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <div className="form-grid">
            <Form.Item name="name" label={definition.singular === 'customer' ? 'Company name' : 'Supplier name'} rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>
            <Form.Item name="contact" label="Contact person" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>
            <Form.Item name="location" label="Location" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>
            <Form.Item name="status" label="Status"><Select options={['Active', 'Inactive'].map((value) => ({ value, label: value }))} /></Form.Item>
          </div>
        </Form>
      </EditorModal>
    </MotionSurface>
  );
}
