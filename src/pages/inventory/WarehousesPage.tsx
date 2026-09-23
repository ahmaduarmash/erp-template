import { useState } from 'react';
import { ApartmentOutlined, EditOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import { Button, Descriptions, Form, Input, Select, Space, Tree } from 'antd';
import { CreateModal, EditModal } from '../../components/overlays';
import { KpiStrip, SemanticStatus, formatMoney } from '../../components/erp/ErpPrimitives';
import { PageHeader } from '../../components/shell/PageHeader';
import { useFeedback } from '../../components/feedback';
import { useWorkspace } from '../../data/WorkspaceProvider';
import type { RecordData } from '../../data/modules';
import { MotionSurface } from '../../lib/motion';

export default function WarehousesPage() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records.warehouses;
  const [selectedId, setSelectedId] = useState(String(rows[0]?.id ?? ''));
  const [editor, setEditor] = useState<RecordData | 'new' | null>(null);
  const [form] = Form.useForm();
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];
  const editing = editor && editor !== 'new' ? editor : null;
  const EditorModal = editing ? EditModal : CreateModal;
  const treeData = rows.map((row) => ({ title: `${row.name} · ${row.code}`, key: row.id, icon: <ApartmentOutlined />, children: [{ title: 'Receiving', key: `${row.id}-receiving` }, { title: 'Main storage', key: `${row.id}-storage` }, { title: 'Dispatch', key: `${row.id}-dispatch` }] }));

  const openEditor = (row?: RecordData) => {
    setEditor(row ?? 'new');
    form.resetFields();
    form.setFieldsValue(row ?? { status: 'Active' });
  };

  const save = async () => {
    const values = await form.validateFields();
    const id = editing?.id ?? crypto.randomUUID();
    workspace.save('warehouses', { ...(editing ?? {}), id, ...values });
    setSelectedId(String(id));
    setEditor(null);
    form.resetFields();
    feedback.success(`Warehouse ${editing ? 'updated' : 'created'}`);
  };

  return (
    <MotionSurface page>
      <PageHeader title="Warehouses" group="Inventory" description="Hierarchical warehouse structure with operational stock context." action={<Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>New warehouse</Button>} />
      <div className="erp-split-layout">
        <section className="panel erp-tree-panel">
          <div className="widget-heading"><div><h2>Warehouse tree</h2><p className="muted">Sites and internal locations</p></div></div>
          <Tree showIcon defaultExpandAll selectedKeys={[selectedId]} treeData={treeData} onSelect={(keys) => { const key = String(keys[0] ?? ''); if (!key.includes('-receiving') && !key.includes('-storage') && !key.includes('-dispatch')) setSelectedId(key); }} />
        </section>
        <section className="panel erp-detail-panel">
          {selected ? <>
            <div className="erp-object-heading"><div><span className="muted">{selected.code}</span><h2>{selected.name}</h2><p>{selected.location}</p></div><SemanticStatus value={String(selected.status)} /></div>
            <KpiStrip items={[{ label: 'Products', value: 128, hint: 'stocked SKUs' }, { label: 'Units', value: '4,280', hint: 'on hand' }, { label: 'Stock value', value: formatMoney(384200, workspace.org.currency), hint: 'illustrative' }, { label: 'Incoming', value: 240, hint: 'open receipts' }]} />
            <Descriptions column={2} items={[{ key: 'manager', label: 'Manager', children: selected.manager }, { key: 'location', label: 'Location', children: selected.location }, { key: 'type', label: 'Warehouse type', children: 'Storage & fulfillment' }, { key: 'account', label: 'Inventory account', children: 'Inventory - 1200' }]} />
            <Space wrap className="erp-section-actions"><Button>View stock</Button><Button>View ledger</Button><Button icon={<SwapOutlined />}>Transfer stock</Button><Button onClick={() => feedback.success('Child locations belong to the production warehouse-location adapter')}>Add child location</Button><Button icon={<EditOutlined />} onClick={() => openEditor(selected)}>Edit warehouse</Button></Space>
          </> : null}
        </section>
      </div>
      <EditorModal open={editor !== null} title={editing ? 'Edit warehouse' : 'New warehouse'} description="Maintain warehouse identity and operational ownership while preserving the hierarchy workspace." icon={<ApartmentOutlined />} width={680} submitLabel={editing ? 'Save warehouse' : 'Create warehouse'} onCancel={() => { setEditor(null); form.resetFields(); }} onSubmit={() => void save()}>
        <Form form={form} layout="vertical"><div className="form-grid"><Form.Item name="name" label="Warehouse name" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item><Form.Item name="code" label="Code" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item><Form.Item name="location" label="Location" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item><Form.Item name="manager" label="Manager" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item><Form.Item name="status" label="Status"><Select options={['Active', 'Inactive'].map((value) => ({ value, label: value }))} /></Form.Item></div></Form>
      </EditorModal>
    </MotionSurface>
  );
}
