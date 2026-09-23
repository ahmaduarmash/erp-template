import { useMemo, useState } from 'react';
import { Button, Descriptions, Form, Input, InputNumber, Select, Switch, Tabs, type TableColumnsType } from 'antd';
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/shell/PageHeader';
import { MotionSurface } from '../../lib/motion';
import { useWorkspace } from '../../data/WorkspaceProvider';
import type { RecordData } from '../../data/modules';
import { useFeedback } from '../../components/feedback';
import { ActionMenu, EntityCell, KpiStrip, MoneyCell, SemanticStatus, StockProgress, formatMoney } from '../../components/erp/ErpPrimitives';
import { CreateModal, EditModal, RecordDrawer } from '../../components/overlays';
import { EnterpriseDataTable } from '../../components/data/EnterpriseDataTable';
import { IconChip } from '../../components/primitives';

export default function ProductsPage() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records.products;
  const [selected, setSelected] = useState<RecordData | null>(null);
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    {
      key: 'name',
      title: 'Product',
      dataIndex: 'name',
      width: 260,
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
      render: (_, row) => <EntityCell title={row.name} subtitle={row.sku} onClick={() => setSelected(row)} />,
    },
    { key: 'category', title: 'Category', dataIndex: 'category', width: 150, sorter: (a, b) => String(a.category).localeCompare(String(b.category)) },
    { key: 'quantity', title: 'Stock / reorder', width: 170, sorter: (a, b) => Number(a.quantity) - Number(b.quantity), render: (_, row) => <StockProgress current={Number(row.quantity)} target={20} /> },
    { key: 'available', title: 'Available', width: 110, align: 'right', render: (_, row) => Math.max(0, Number(row.quantity) - 6) },
    { key: 'price', title: 'Unit price', dataIndex: 'price', width: 130, align: 'right', sorter: (a, b) => Number(a.price) - Number(b.price), render: (value) => <MoneyCell value={value} currency={workspace.org.currency} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, sorter: (a, b) => String(a.status).localeCompare(String(b.status)), render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace.org.currency]);

  const openEditor = (row?: RecordData) => {
    setEditing(row ?? null);
    form.resetFields();
    form.setFieldsValue(row ?? { status: 'Active', category: 'Electronics', quantity: 0, price: 0, reorder: 20, uom: 'Nos', trackInventory: true });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const save = async () => {
    const values = await form.validateFields();
    workspace.save('products', { id: editing?.id ?? crypto.randomUUID(), ...values });
    feedback.success(`Product ${editing ? 'updated' : 'created'}`);
    closeEditor();
  };

  const EditorModal = editing ? EditModal : CreateModal;

  return (
    <MotionSurface page>
      <PageHeader
        title="Products"
        group="Inventory"
        description="Catalog, availability, pricing and replenishment in one product workspace."
        action={<Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>New product</Button>}
      />
      <KpiStrip items={[
        { label: 'Products', value: rows.length, hint: 'catalog items' },
        { label: 'Units on hand', value: rows.reduce((sum, row) => sum + Number(row.quantity), 0).toLocaleString(), hint: 'across warehouses' },
        { label: 'Low stock', value: rows.filter((row) => Number(row.quantity) <= 20).length, hint: 'at or below reorder point' },
        { label: 'Inventory value', value: formatMoney(rows.reduce((sum, row) => sum + Number(row.quantity) * Number(row.price), 0), workspace.org.currency), hint: 'illustrative valuation' },
      ]} />
      <EnterpriseDataTable<RecordData>
        workspaceKey="products"
        rows={rows}
        columns={columns}
        searchPlaceholder="Search products or SKUs…"
        exportName="products"
        onOpen={setSelected}
        onRefresh={() => feedback.success('Product workspace refreshed')}
        filters={[
          {
            key: 'category',
            label: 'Category',
            options: ['Electronics', 'Furniture', 'Accessories', 'Office'].map((value) => ({ value, label: value })),
          },
          {
            key: 'status',
            label: 'Status',
            options: ['Active', 'Draft', 'Archived'].map((value) => ({ value, label: value })),
          },
        ]}
        savedViews={[
          { key: 'active', label: 'Active', query: { filters: { status: 'Active' } } },
          { key: 'low-stock', label: 'Low stock', query: { page: 1 } },
        ]}
        rowActions={(row) => <ActionMenu primary={{ label: 'View', onClick: () => setSelected(row) }} overflow={[
          { key: 'edit', label: 'Edit product', onClick: () => openEditor(row) },
          { key: 'adjust', label: 'Adjust stock', onClick: () => feedback.success('Stock adjustments should create inventory movements, not edit balances directly.') },
          { key: 'transfer', label: 'Transfer stock', onClick: () => feedback.success('Create a stock transfer document from the Stock transfers workspace.') },
          { key: 'ledger', label: 'View stock ledger', onClick: () => setSelected(row) },
          { key: 'archive', label: 'Archive', onClick: () => workspace.save('products', { ...row, status: 'Archived' }), danger: true },
        ]} />}
      />

      <RecordDrawer
        size="lg"
        open={!!selected}
        title={String(selected?.name ?? 'Product')}
        subtitle={selected ? `SKU ${selected.sku}` : undefined}
        status={selected ? <SemanticStatus value={String(selected.status)} /> : undefined}
        leading={<IconChip icon={<AppstoreOutlined />} tone="primary" size="lg" />}
        actions={selected ? <Button onClick={() => { openEditor(selected); setSelected(null); }}>Edit product</Button> : undefined}
        onClose={() => setSelected(null)}
      >
        {selected ? <Tabs items={[
          { key: 'overview', label: 'Overview', children: <Descriptions column={2} items={[
            { key: 'sku', label: 'SKU', children: selected.sku },
            { key: 'category', label: 'Category', children: selected.category },
            { key: 'price', label: 'Unit price', children: formatMoney(selected.price, workspace.org.currency) },
            { key: 'status', label: 'Status', children: <SemanticStatus value={String(selected.status)} /> },
          ]} /> },
          { key: 'inventory', label: 'Inventory', children: <Descriptions column={2} items={[
            { key: 'onhand', label: 'On hand', children: selected.quantity },
            { key: 'available', label: 'Available', children: Math.max(0, Number(selected.quantity) - 6) },
            { key: 'reorder', label: 'Reorder point', children: selected.reorder ?? 20 },
            { key: 'uom', label: 'Default UOM', children: selected.uom ?? 'Nos' },
          ]} /> },
          { key: 'activity', label: 'Activity', children: <p className="muted">Stock movements, price changes and audit history will appear here through the repository adapter.</p> },
        ]} /> : null}
      </RecordDrawer>

      <EditorModal
        open={editorOpen}
        title={editing ? 'Edit product' : 'New product'}
        description={editing ? 'Update product master data and keep the catalog context intact.' : 'Create a product without leaving the catalog workspace.'}
        icon={<AppstoreOutlined />}
        onCancel={closeEditor}
        onSubmit={() => void save()}
        submitLabel={editing ? 'Save product' : 'Create product'}
        width={760}
      >
        <Form form={form} layout="vertical">
          <Tabs items={[
            { key: 'general', label: 'General', children: <div className="form-grid">
              <Form.Item name="name" label="Product name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="category" label="Category"><Select options={['Electronics', 'Furniture', 'Accessories', 'Office'].map((value) => ({ value, label: value }))} /></Form.Item>
              <Form.Item name="status" label="Status"><Select options={['Active', 'Draft', 'Archived'].map((value) => ({ value, label: value }))} /></Form.Item>
            </div> },
            { key: 'inventory', label: 'Inventory', children: <div className="form-grid">
              <Form.Item name="trackInventory" label="Track inventory" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name="uom" label="Default UOM"><Select options={['Nos', 'Box', 'Kg', 'Litre'].map((value) => ({ value, label: value }))} /></Form.Item>
              <Form.Item name="quantity" label="Opening / demo stock"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="reorder" label="Reorder point"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            </div> },
            { key: 'pricing', label: 'Pricing', children: <div className="form-grid">
              <Form.Item name="price" label="Standard selling price"><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="purchaseUom" label="Purchasing UOM"><Select options={['Nos', 'Box', 'Kg'].map((value) => ({ value, label: value }))} /></Form.Item>
            </div> },
          ]} />
        </Form>
      </EditorModal>
    </MotionSurface>
  );
}
