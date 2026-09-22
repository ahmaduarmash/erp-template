import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tree,
  Typography,
  type TableColumnsType,
} from 'antd';
import {
  ApartmentOutlined,
  PlusOutlined,
  SwapOutlined,
} from '@ant-design/icons';
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
  MoneyCell,
  QuickViews,
  SemanticStatus,
  StockProgress,
  WorkflowBar,
  formatMoney,
} from '../../components/erp/ErpPrimitives';

const warehouseOptions = ['Central warehouse', 'North fulfillment', 'South storage'].map((value) => ({ value, label: value }));
const productOptions = ['Arc desk lamp', 'Contour office chair', 'Studio monitor 27″', 'Wireless keyboard'].map((value) => ({ value, label: value }));

function DetailsDrawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return <Drawer width={680} open={open} title={title} onClose={onClose}>{children}</Drawer>;
}

export function ProductsWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records.products;
  const [selected, setSelected] = useState<RecordData | null>(null);
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [form] = Form.useForm();
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Product', dataIndex: 'name', width: 260, render: (_, row) => <EntityCell title={row.name} subtitle={row.sku} /> },
    { key: 'category', title: 'Category', dataIndex: 'category', width: 150 },
    { key: 'quantity', title: 'Stock / reorder', width: 170, render: (_, row) => <StockProgress current={Number(row.quantity)} target={20} /> },
    { key: 'available', title: 'Available', width: 110, render: (_, row) => Math.max(0, Number(row.quantity) - 6) },
    { key: 'price', title: 'Unit price', dataIndex: 'price', width: 130, align: 'right', render: (value) => <MoneyCell value={value} currency={workspace.org.currency} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace.org.currency]);
  const openEditor = (row?: RecordData) => {
    setEditing(row ?? null);
    form.setFieldsValue(row ?? { status: 'Active', category: 'Electronics', quantity: 0, price: 0 });
  };
  const save = async () => {
    const values = await form.validateFields();
    workspace.save('products', { id: editing?.id ?? crypto.randomUUID(), ...values });
    setEditing(null);
    form.resetFields();
    feedback.success(`Product ${editing ? 'updated' : 'created'}`);
  };
  return (
    <MotionSurface page>
      <PageHeader title="Products" group="Inventory" description="Catalog, availability, pricing and replenishment in one product workspace." action={<Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>New product</Button>} />
      <KpiStrip items={[
        { label: 'Products', value: rows.length, hint: 'catalog items' },
        { label: 'Units on hand', value: rows.reduce((sum, row) => sum + Number(row.quantity), 0).toLocaleString(), hint: 'across warehouses' },
        { label: 'Low stock', value: rows.filter((row) => Number(row.quantity) <= 20).length, hint: 'at or below reorder point' },
        { label: 'Inventory value', value: formatMoney(rows.reduce((sum, row) => sum + Number(row.quantity) * Number(row.price), 0), workspace.org.currency), hint: 'illustrative valuation' },
      ]} />
      <DomainTable
        rows={rows}
        columns={columns}
        searchPlaceholder="Search products or SKUs…"
        rowActions={(row) => <ActionMenu primary={{ label: 'View', onClick: () => setSelected(row) }} overflow={[
          { key: 'edit', label: 'Edit product', onClick: () => openEditor(row) },
          { key: 'adjust', label: 'Adjust stock', onClick: () => feedback.success('Stock adjustment flow ready for API integration') },
          { key: 'transfer', label: 'Transfer stock', onClick: () => feedback.success('Start a stock transfer from Inventory → Stock transfers') },
          { key: 'ledger', label: 'View stock ledger', onClick: () => setSelected(row) },
          { key: 'archive', label: 'Archive', onClick: () => workspace.save('products', { ...row, status: 'Archived' }), danger: true },
        ]} />}
      />
      <DetailsDrawer open={!!selected} title={selected?.name ? String(selected.name) : 'Product'} onClose={() => setSelected(null)}>
        {selected ? <Tabs items={[
          { key: 'overview', label: 'Overview', children: <Descriptions column={2} items={[
            { key: 'sku', label: 'SKU', children: selected.sku },
            { key: 'category', label: 'Category', children: selected.category },
            { key: 'price', label: 'Unit price', children: formatMoney(selected.price, workspace.org.currency) },
            { key: 'status', label: 'Status', children: <SemanticStatus value={String(selected.status)} /> },
          ]} /> },
          { key: 'inventory', label: 'Inventory', children: <Table pagination={false} rowKey="warehouse" columns={[{ title: 'Warehouse', dataIndex: 'warehouse' }, { title: 'On hand', dataIndex: 'onHand' }, { title: 'Reserved', dataIndex: 'reserved' }, { title: 'Available', dataIndex: 'available' }]} dataSource={warehouseOptions.map((item, index) => ({ warehouse: item.value, onHand: Math.max(0, Number(selected.quantity) - index * 5), reserved: 2 + index, available: Math.max(0, Number(selected.quantity) - index * 5 - 2 - index) }))} /> },
          { key: 'pricing', label: 'Pricing', children: <Alert type="info" showIcon message="Pricing layer" description="Connect price lists, currencies and customer-specific pricing through the project repository adapter." /> },
          { key: 'activity', label: 'Activity', children: <Typography.Paragraph className="muted">Product-related audit and stock movements will appear here when the backend adapter is connected.</Typography.Paragraph> },
        ]} /> : null}
      </DetailsDrawer>
      <Drawer width={720} open={editing !== null} title={editing?.id ? 'Edit product' : 'New product'} onClose={() => setEditing(null)} extra={<Button type="primary" onClick={() => void save()}>Save product</Button>}>
        <Form form={form} layout="vertical">
          <Tabs items={[
            { key: 'general', label: 'General', children: <div className="form-grid"><Form.Item name="name" label="Product name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="sku" label="SKU" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="category" label="Category"><Select options={['Electronics', 'Furniture', 'Accessories', 'Office'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="status" label="Status"><Select options={['Active', 'Draft', 'Archived'].map((value) => ({ value, label: value }))} /></Form.Item></div> },
            { key: 'inventory', label: 'Inventory', children: <div className="form-grid"><Form.Item name="quantity" label="Opening / demo stock"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item><Form.Item label="Track inventory"><Switch defaultChecked /></Form.Item><Form.Item label="Default UOM"><Select defaultValue="Nos" options={['Nos', 'Box', 'Kg', 'Litre'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item label="Reorder point"><InputNumber defaultValue={20} min={0} style={{ width: '100%' }} /></Form.Item></div> },
            { key: 'pricing', label: 'Pricing', children: <div className="form-grid"><Form.Item name="price" label="Standard selling price"><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item><Form.Item label="Purchasing UOM"><Select defaultValue="Nos" options={['Nos', 'Box', 'Kg'].map((value) => ({ value, label: value }))} /></Form.Item></div> },
          ]} />
        </Form>
      </Drawer>
    </MotionSurface>
  );
}

export function StockLevelsWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const [view, setView] = useState('all');
  const source = workspace.records['stock-levels'];
  const rows = source.filter((row) => view === 'all' || (view === 'low' && Number(row.quantity) <= Number(row.reorder)) || (view === 'out' && Number(row.quantity) === 0));
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Product', dataIndex: 'name', width: 240, render: (value) => <EntityCell title={value} subtitle="Tracked item" /> },
    { key: 'warehouse', title: 'Warehouse', dataIndex: 'warehouse', width: 190 },
    { key: 'actual', title: 'Actual', width: 90, align: 'right', render: (_, row) => row.quantity },
    { key: 'reserved', title: 'Reserved', width: 90, align: 'right', render: (_, row) => Math.min(8, Math.floor(Number(row.quantity) * 0.15)) },
    { key: 'incoming', title: 'Incoming', width: 90, align: 'right', render: (_, row) => Number(row.reorder) + 6 },
    { key: 'available', title: 'Available', width: 100, align: 'right', render: (_, row) => Math.max(0, Number(row.quantity) - Math.min(8, Math.floor(Number(row.quantity) * 0.15))) },
    { key: 'projected', title: 'Projected', width: 100, align: 'right', render: (_, row) => Number(row.quantity) + Number(row.reorder) + 6 - Math.min(8, Math.floor(Number(row.quantity) * 0.15)) },
    { key: 'reorder', title: 'Reorder', width: 150, render: (_, row) => <StockProgress current={Number(row.quantity)} target={Number(row.reorder)} /> },
    { key: 'status', title: 'Status', width: 120, render: (_, row) => <SemanticStatus value={Number(row.quantity) === 0 ? 'Out of stock' : Number(row.quantity) <= Number(row.reorder) ? 'Low stock' : 'In stock'} /> },
  ], []);
  return (
    <MotionSurface page>
      <PageHeader title="Inventory availability" group="Inventory" description="A derived operational view of actual, reserved, incoming, available and projected stock." />
      <KpiStrip items={[
        { label: 'Units on hand', value: source.reduce((sum, row) => sum + Number(row.quantity), 0).toLocaleString(), hint: 'actual quantity' },
        { label: 'Low stock', value: source.filter((row) => Number(row.quantity) <= Number(row.reorder) && Number(row.quantity) > 0).length, hint: 'needs replenishment' },
        { label: 'Out of stock', value: source.filter((row) => Number(row.quantity) === 0).length, hint: 'zero available' },
        { label: 'Warehouses', value: new Set(source.map((row) => row.warehouse)).size, hint: 'stock locations' },
      ]} />
      <QuickViews value={view} onChange={setView} items={[{ value: 'all', label: `All (${source.length})` }, { value: 'low', label: `Low stock (${source.filter((row) => Number(row.quantity) <= Number(row.reorder)).length})` }, { value: 'out', label: `Out of stock (${source.filter((row) => Number(row.quantity) === 0).length})` }]} />
      <DomainTable rows={rows} columns={columns} searchPlaceholder="Search availability…" rowActions={(row) => <ActionMenu primary={{ label: 'Ledger', onClick: () => feedback.success(`Stock ledger: ${row.name}`) }} overflow={[{ key: 'adjust', label: 'Adjust stock', onClick: () => feedback.success('Open a stock adjustment transaction') }, { key: 'transfer', label: 'Transfer stock', onClick: () => feedback.success('Create a stock transfer document') }, { key: 'replenish', label: 'Create purchase request', onClick: () => feedback.success('Replenishment workflow ready for integration') }]} />} />
    </MotionSurface>
  );
}

export function WarehousesWorkspace() {
  const workspace = useWorkspace();
  const rows = workspace.records.warehouses;
  const [selectedId, setSelectedId] = useState(String(rows[0]?.id ?? ''));
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];
  const treeData = rows.map((row) => ({ title: `${row.name} · ${row.code}`, key: row.id, icon: <ApartmentOutlined />, children: [{ title: 'Receiving', key: `${row.id}-receiving` }, { title: 'Main storage', key: `${row.id}-storage` }, { title: 'Dispatch', key: `${row.id}-dispatch` }] }));
  return (
    <MotionSurface page>
      <PageHeader title="Warehouses" group="Inventory" description="Hierarchical warehouse structure with operational stock context." action={<Button type="primary" icon={<PlusOutlined />}>New warehouse</Button>} />
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
            <Space wrap className="erp-section-actions"><Button>View stock</Button><Button>View ledger</Button><Button icon={<SwapOutlined />}>Transfer stock</Button><Button>Add child location</Button></Space>
          </> : null}
        </section>
      </div>
    </MotionSurface>
  );
}

export function StockTransfersWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['stock-transfers'];
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Transfer', dataIndex: 'name', width: 180, render: (value, row) => <EntityCell title={value} subtitle={row.date} /> },
    { key: 'route', title: 'Route', width: 310, render: (_, row) => <span>{row.source} → {row.destination}</span> },
    { key: 'product', title: 'Primary item', dataIndex: 'product', width: 200 },
    { key: 'quantity', title: 'Units', dataIndex: 'quantity', align: 'right', width: 90 },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 130, render: (value) => <SemanticStatus value={String(value)} /> },
  ], []);
  const save = async () => {
    const values = await form.validateFields();
    const lines = values.lines as Array<{ product: string; quantity: number; uom: string }>;
    workspace.save('stock-transfers', { id: crypto.randomUUID(), name: `STR-${String(rows.length + 101).padStart(4, '0')}`, product: lines[0]?.product ?? 'Multiple items', source: values.source, destination: values.destination, quantity: lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0), date: values.date, status: 'Draft' });
    setOpen(false); form.resetFields(); feedback.success('Stock transfer created');
  };
  return (
    <MotionSurface page>
      <PageHeader title="Stock transfers" group="Inventory" description="Controlled multi-line inventory movement between warehouse locations." action={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>New transfer</Button>} />
      <KpiStrip items={[{ label: 'Draft', value: rows.filter((row) => row.status === 'Draft').length }, { label: 'In transit', value: rows.filter((row) => row.status === 'In transit').length }, { label: 'Received', value: rows.filter((row) => row.status === 'Received').length }, { label: 'Units moving', value: rows.filter((row) => row.status === 'In transit').reduce((sum, row) => sum + Number(row.quantity), 0) }]} />
      <DomainTable rows={rows} columns={columns} rowActions={(row) => <ActionMenu primary={{ label: row.status === 'In transit' ? 'Receive' : 'View', onClick: () => feedback.success(row.status === 'In transit' ? 'Receipt workflow opened' : `Transfer ${row.name}`) }} overflow={[{ key: 'edit', label: 'Edit draft', onClick: () => feedback.success('Only draft transfers should be editable'), disabled: row.status !== 'Draft' }, { key: 'print', label: 'Print transfer', onClick: () => feedback.success('Print layout ready for integration') }, { key: 'cancel', label: 'Cancel transfer', onClick: () => workspace.save('stock-transfers', { ...row, status: 'Cancelled' }), danger: true, disabled: row.status === 'Received' }]} />} />
      <Drawer width={900} open={open} title="New stock transfer" onClose={() => setOpen(false)} extra={<Button type="primary" onClick={() => void save()}>Save draft</Button>}>
        <WorkflowBar steps={['Draft', 'In transit', 'Received']} current="Draft" />
        <Form form={form} layout="vertical" initialValues={{ type: 'Internal Transfer', date: '2026-09-23', lines: [{ product: 'Arc desk lamp', quantity: 1, uom: 'Nos' }] }}>
          <div className="form-grid"><Form.Item name="type" label="Transfer type"><Select options={['Internal Transfer', 'Issue', 'Receipt'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="date" label="Posting date"><Input type="date" /></Form.Item><Form.Item name="source" label="From warehouse" rules={[{ required: true }]}><Select options={warehouseOptions} /></Form.Item><Form.Item name="destination" label="To warehouse" rules={[{ required: true }]}><Select options={warehouseOptions} /></Form.Item></div>
          <Typography.Title level={5}>Items</Typography.Title>
          <Form.List name="lines">{(fields, { add, remove }) => <>{fields.map((field) => <Space key={field.key} align="start" className="erp-line-editor"><Form.Item {...field} name={[field.name, 'product']} rules={[{ required: true }]}><Select placeholder="Product" options={productOptions} style={{ width: 280 }} /></Form.Item><Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}><InputNumber min={0.01} placeholder="Qty" /></Form.Item><Form.Item {...field} name={[field.name, 'uom']}><Select style={{ width: 110 }} options={['Nos', 'Box', 'Kg'].map((value) => ({ value, label: value }))} /></Form.Item><Button danger type="text" onClick={() => remove(field.name)}>Remove</Button></Space>)}<Button onClick={() => add({ quantity: 1, uom: 'Nos' })} icon={<PlusOutlined />}>Add item</Button></>}</Form.List>
        </Form>
      </Drawer>
    </MotionSurface>
  );
}

export function PurchaseOrdersWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['purchase-orders'];
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Purchase order', dataIndex: 'name', width: 190, render: (value, row) => <EntityCell title={value} subtitle={row.date} /> },
    { key: 'supplier', title: 'Supplier', dataIndex: 'supplier', width: 220 },
    { key: 'amount', title: 'Total', dataIndex: 'amount', width: 140, align: 'right', render: (value) => <MoneyCell value={value} currency={workspace.org.currency} /> },
    { key: 'receipt', title: 'Receipt', width: 170, render: (_, row) => <StockProgress current={row.status === 'Received' ? 100 : row.status === 'Ordered' ? 45 : 0} target={100} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 130, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace.org.currency]);
  const save = async () => {
    const values = await form.validateFields();
    const lines = values.lines as Array<{ item: string; quantity: number; rate: number; discount: number; tax: number }>;
    const amount = lines.reduce((sum, line) => { const gross = Number(line.quantity) * Number(line.rate); return sum + gross * (1 - Number(line.discount || 0) / 100) * (1 + Number(line.tax || 0) / 100); }, 0);
    workspace.save('purchase-orders', { id: crypto.randomUUID(), name: `PO-2026-${String(rows.length + 101).padStart(4, '0')}`, supplier: values.supplier, amount: Number(amount.toFixed(2)), date: values.date, status: 'Draft' });
    setOpen(false); form.resetFields(); feedback.success('Purchase order created');
  };
  return (
    <MotionSurface page>
      <PageHeader title="Purchase orders" group="Inventory" description="Purchasing documents with line items, receipt progress and contextual workflow actions." action={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>New purchase order</Button>} />
      <KpiStrip items={[{ label: 'Open orders', value: rows.filter((row) => !['Received', 'Cancelled'].includes(String(row.status))).length }, { label: 'Ordered value', value: formatMoney(rows.reduce((sum, row) => sum + Number(row.amount), 0), workspace.org.currency) }, { label: 'Awaiting receipt', value: rows.filter((row) => row.status === 'Ordered').length }, { label: 'Received', value: rows.filter((row) => row.status === 'Received').length }]} />
      <DomainTable rows={rows} columns={columns} rowActions={(row) => <ActionMenu primary={{ label: row.status === 'Ordered' ? 'Receive' : 'View', onClick: () => feedback.success(row.status === 'Ordered' ? 'Goods receipt workflow opened' : `Purchase order ${row.name}`) }} overflow={[{ key: 'send', label: 'Send PO', onClick: () => workspace.save('purchase-orders', { ...row, status: 'Ordered' }), disabled: row.status !== 'Draft' }, { key: 'bill', label: 'Create bill', onClick: () => feedback.success('Supplier bill flow is an integration point') }, { key: 'duplicate', label: 'Duplicate', onClick: () => feedback.success('Duplicate purchase order') }, { key: 'cancel', label: 'Cancel', onClick: () => workspace.save('purchase-orders', { ...row, status: 'Cancelled' }), danger: true, disabled: row.status === 'Received' }]} />} />
      <Drawer width={980} open={open} title="New purchase order" onClose={() => setOpen(false)} extra={<Button type="primary" onClick={() => void save()}>Save draft</Button>}>
        <WorkflowBar steps={['Draft', 'Ordered', 'Received']} current="Draft" />
        <Form form={form} layout="vertical" initialValues={{ date: '2026-09-23', expectedDate: '2026-09-30', warehouse: 'Central warehouse', lines: [{ item: 'Arc desk lamp', quantity: 1, rate: 149, discount: 0, tax: 5 }] }}>
          <div className="form-grid"><Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}><Select options={workspace.records.suppliers.map((row) => ({ value: row.name, label: row.name }))} /></Form.Item><Form.Item name="date" label="Order date"><Input type="date" /></Form.Item><Form.Item name="expectedDate" label="Expected date"><Input type="date" /></Form.Item><Form.Item name="warehouse" label="Deliver to"><Select options={warehouseOptions} /></Form.Item></div>
          <Typography.Title level={5}>Items</Typography.Title>
          <Form.List name="lines">{(fields, { add, remove }) => <>{fields.map((field) => <Space key={field.key} align="start" className="erp-line-editor erp-line-editor-wide"><Form.Item {...field} name={[field.name, 'item']} rules={[{ required: true }]}><Select placeholder="Item" options={productOptions} style={{ width: 220 }} /></Form.Item><Form.Item {...field} name={[field.name, 'quantity']}><InputNumber min={0.01} placeholder="Qty" /></Form.Item><Form.Item {...field} name={[field.name, 'rate']}><InputNumber min={0} placeholder="Rate" /></Form.Item><Form.Item {...field} name={[field.name, 'discount']}><InputNumber min={0} max={100} placeholder="Disc %" /></Form.Item><Form.Item {...field} name={[field.name, 'tax']}><InputNumber min={0} max={100} placeholder="Tax %" /></Form.Item><Button danger type="text" onClick={() => remove(field.name)}>Remove</Button></Space>)}<Button icon={<PlusOutlined />} onClick={() => add({ quantity: 1, rate: 0, discount: 0, tax: 0 })}>Add item</Button></>}</Form.List>
        </Form>
      </Drawer>
    </MotionSurface>
  );
}

export function SuppliersWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records.suppliers;
  const [selected, setSelected] = useState<RecordData | null>(null);
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Supplier', dataIndex: 'name', width: 250, render: (value, row) => <EntityCell title={value} subtitle={row.email} initials={String(value).split(' ').map((part) => part[0]).join('').slice(0, 2)} /> },
    { key: 'contact', title: 'Contact', dataIndex: 'contact', width: 180 },
    { key: 'open', title: 'Open POs', width: 100, align: 'right', render: (_, row) => workspace.records['purchase-orders'].filter((po) => po.supplier === row.name && po.status !== 'Received').length },
    { key: 'outstanding', title: 'Open value', width: 140, align: 'right', render: (_, row) => <MoneyCell value={workspace.records['purchase-orders'].filter((po) => po.supplier === row.name && po.status !== 'Received').reduce((sum, po) => sum + Number(po.amount), 0)} currency={workspace.org.currency} /> },
    { key: 'location', title: 'Location', dataIndex: 'location', width: 170 },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 110, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace]);
  return (
    <MotionSurface page>
      <PageHeader title="Suppliers" group="Inventory" description="Supplier relationships with purchasing context, contacts and outstanding commitments." action={<Button type="primary" icon={<PlusOutlined />}>New supplier</Button>} />
      <DomainTable rows={rows} columns={columns} rowActions={(row) => <ActionMenu primary={{ label: 'View', onClick: () => setSelected(row) }} overflow={[{ key: 'po', label: 'Create purchase order', onClick: () => feedback.success('Create PO from supplier context') }, { key: 'edit', label: 'Edit supplier', onClick: () => setSelected(row) }, { key: 'deactivate', label: 'Deactivate', onClick: () => workspace.save('suppliers', { ...row, status: 'Inactive' }), danger: true }]} />} />
      <DetailsDrawer open={!!selected} title={selected?.name ? String(selected.name) : 'Supplier'} onClose={() => setSelected(null)}>{selected ? <Tabs items={[{ key: 'overview', label: 'Overview', children: <><KpiStrip items={[{ label: 'Open PO value', value: formatMoney(84300, workspace.org.currency) }, { label: 'Outstanding', value: formatMoney(31200, workspace.org.currency) }, { label: 'Last order', value: 'Sep 18' }]} /><Descriptions column={2} items={[{ key: 'contact', label: 'Primary contact', children: selected.contact }, { key: 'email', label: 'Email', children: selected.email }, { key: 'phone', label: 'Phone', children: selected.phone }, { key: 'location', label: 'Location', children: selected.location }]} /></> }, { key: 'contacts', label: 'Contacts & addresses', children: <Alert showIcon type="info" message="Multiple contacts and addresses" description="The production repository can expose normalized supplier contacts and addresses here." /> }, { key: 'orders', label: 'Purchase orders', children: <Typography.Paragraph className="muted">Related purchase orders are surfaced in supplier context rather than forcing navigation back to a generic list.</Typography.Paragraph> }, { key: 'activity', label: 'Activity', children: <Typography.Paragraph className="muted">Audit and supplier communication history.</Typography.Paragraph> }]} /> : null}</DetailsDrawer>
    </MotionSurface>
  );
}
