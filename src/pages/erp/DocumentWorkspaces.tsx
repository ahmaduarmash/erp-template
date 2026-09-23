import { useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Select,
  type TableColumnsType,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DocumentSection, DocumentSummary, DocumentWorkspace } from '../../components/documents/DocumentWorkspace';
import { ActionMenu, DomainTable, EntityCell, KpiStrip, MoneyCell, SemanticStatus, WorkflowBar, formatMoney } from '../../components/erp/ErpPrimitives';
import { PageHeader } from '../../components/shell/PageHeader';
import { useFeedback } from '../../components/feedback';
import { useWorkspace } from '../../data/WorkspaceProvider';
import type { RecordData } from '../../data/modules';
import { MotionSurface } from '../../lib/motion';

const warehouses = ['Central warehouse', 'North fulfillment', 'South storage'];
const products = ['Arc desk lamp', 'Contour office chair', 'Studio monitor 27″', 'Wireless keyboard', 'USB-C docking station'];
const accounts = ['Cash at bank', 'Petty cash', 'Accounts receivable', 'Inventory', 'Accounts payable', 'Sales revenue', 'Office expense', 'Salary expense'];

function parseLines(value: unknown): Array<Record<string, string | number>> {
  if (typeof value !== 'string' || !value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((line) => line && typeof line === 'object') as Array<Record<string, string | number>> : [];
  } catch {
    return [];
  }
}

function DocumentList({
  title,
  group,
  description,
  rows,
  columns,
  onNew,
  onOpen,
  searchPlaceholder,
  metrics,
}: {
  title: string;
  group: string;
  description: string;
  rows: RecordData[];
  columns: TableColumnsType<RecordData>;
  onNew: () => void;
  onOpen: (row: RecordData) => void;
  searchPlaceholder: string;
  metrics: Array<{ label: string; value: string | number; hint?: string }>;
}) {
  return (
    <MotionSurface page>
      <PageHeader
        title={title}
        group={group}
        description={description}
        action={<Button type="primary" icon={<PlusOutlined />} onClick={onNew}>New {title.toLowerCase().replace(/s$/, '')}</Button>}
      />
      <KpiStrip items={metrics} />
      <DomainTable
        rows={rows}
        columns={columns}
        searchPlaceholder={searchPlaceholder}
        rowActions={(row) => <ActionMenu primary={{ label: 'Open document', onClick: () => onOpen(row) }} overflow={[
          { key: 'activity', label: 'Audit trail', onClick: () => onOpen(row) },
        ]} />}
      />
    </MotionSurface>
  );
}

function ReadOnlyLines({ lines, fallback }: { lines: Array<Record<string, string | number>>; fallback: React.ReactNode }) {
  if (!lines.length) return <>{fallback}</>;
  return (
    <table className="document-lines-table">
      <thead><tr>{Object.keys(lines[0]).map((key) => <th key={key}>{key}</th>)}</tr></thead>
      <tbody>{lines.map((line, index) => <tr key={index}>{Object.values(line).map((value, cell) => <td key={cell}>{String(value)}</td>)}</tr>)}</tbody>
    </table>
  );
}

export function StockTransfersWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['stock-transfers'];
  const [active, setActive] = useState<RecordData | 'new' | null>(null);
  const [form] = Form.useForm();

  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Transfer', dataIndex: 'name', width: 180, render: (value, row) => <EntityCell title={value} subtitle={row.date} onClick={() => setActive(row)} /> },
    { key: 'route', title: 'Movement', width: 300, render: (_, row) => `${row.source} → ${row.destination}` },
    { key: 'product', title: 'Product', dataIndex: 'product', width: 220 },
    { key: 'quantity', title: 'Units', dataIndex: 'quantity', width: 100, align: 'right' },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 130, render: (value) => <SemanticStatus value={String(value)} /> },
  ], []);

  if (!active) return <DocumentList title="Stock transfers" group="Inventory" description="Controlled warehouse-to-warehouse movement with an explicit dispatch and receipt lifecycle." rows={rows} columns={columns} onNew={() => { form.resetFields(); form.setFieldsValue({ date: new Date().toISOString().slice(0, 10), lines: [{ product: products[0], quantity: 1 }] }); setActive('new'); }} onOpen={setActive} searchPlaceholder="Search transfer, product or warehouse…" metrics={[
    { label: 'Draft', value: rows.filter((row) => row.status === 'Draft').length, hint: 'not yet dispatched' },
    { label: 'In transit', value: rows.filter((row) => row.status === 'In transit').length, hint: 'stock moving' },
    { label: 'Received', value: rows.filter((row) => row.status === 'Received').length, hint: 'completed transfers' },
    { label: 'Units moving', value: rows.filter((row) => row.status === 'In transit').reduce((sum, row) => sum + Number(row.quantity), 0), hint: 'in current transit' },
  ]} />;

  const existing = active === 'new' ? null : active;
  const lines = existing ? parseLines(existing.lines) : [];
  const advance = () => {
    if (!existing) return;
    const status = existing.status === 'Draft' ? 'In transit' : existing.status === 'In transit' ? 'Received' : existing.status;
    workspace.save('stock-transfers', { ...existing, status });
    setActive({ ...existing, status });
    feedback.success(status === 'In transit' ? 'Transfer dispatched' : 'Transfer received');
  };
  const save = async () => {
    const values = await form.validateFields();
    if (values.source === values.destination) return feedback.error('Source and destination warehouses must be different.');
    const documentLines = values.lines as Array<{ product: string; quantity: number }>;
    const quantity = documentLines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
    workspace.save('stock-transfers', { id: crypto.randomUUID(), name: `TR-${String(rows.length + 1).padStart(4, '0')}`, source: values.source, destination: values.destination, date: values.date, product: documentLines[0]?.product ?? '', quantity, lines: JSON.stringify(documentLines), status: 'Draft' });
    setActive(null);
    feedback.success('Transfer draft created');
  };

  return <DocumentWorkspace title={existing ? existing.name : 'New stock transfer'} subtitle="Inventory movement document" reference={existing ? `${existing.source} → ${existing.destination}` : 'Draft · reference assigned on save'} status={existing ? <SemanticStatus value={String(existing.status)} /> : <SemanticStatus value="Draft" />} onBack={() => setActive(null)} secondaryActions={existing ? <Button onClick={() => feedback.success('Audit trail is available through the repository adapter')}>Audit trail</Button> : undefined} primaryAction={existing && existing.status !== 'Received' ? <Button type="primary" onClick={advance}>{existing.status === 'Draft' ? 'Dispatch transfer' : 'Receive transfer'}</Button> : !existing ? <Button type="primary" onClick={() => void save()}>Save draft</Button> : undefined} sidebar={<DocumentSummary><div className="document-summary-row"><span>Lifecycle</span><strong>{existing?.status ?? 'Draft'}</strong></div><div className="document-summary-row"><span>Units</span><strong>{existing?.quantity ?? 'Calculated on save'}</strong></div><div className="document-summary-row is-total"><span>Inventory impact</span><strong>{existing?.status === 'Received' ? 'Posted' : 'Pending'}</strong></div></DocumentSummary>}>
    <DocumentSection title="Transfer header" description="Stock should move only through an explicit source/destination document.">{existing ? <Descriptions column={{ xs: 1, sm: 2 }} items={[{ key: 'source', label: 'From', children: existing.source }, { key: 'destination', label: 'To', children: existing.destination }, { key: 'date', label: 'Transfer date', children: existing.date }, { key: 'status', label: 'Status', children: <SemanticStatus value={String(existing.status)} /> }]} /> : <Form form={form} layout="vertical"><div className="form-grid"><Form.Item name="source" label="From warehouse" rules={[{ required: true }]}><Select options={warehouses.map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="destination" label="To warehouse" rules={[{ required: true }]}><Select options={warehouses.map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="date" label="Transfer date" rules={[{ required: true }]}><Input type="date" /></Form.Item></div></Form>}</DocumentSection>
    <DocumentSection title="Transfer lines" description="Products and quantities included in this movement.">{existing ? <ReadOnlyLines lines={lines} fallback={<Descriptions items={[{ key: 'product', label: 'Product', children: existing.product }, { key: 'quantity', label: 'Quantity', children: existing.quantity }]} />} /> : <Form form={form} component={false}><Form.List name="lines">{(fields, { add, remove }) => <><table className="document-lines-table"><thead><tr><th>Product</th><th>Quantity</th><th /></tr></thead><tbody>{fields.map((field) => <tr key={field.key}><td><Form.Item name={[field.name, 'product']} rules={[{ required: true }]}><Select options={products.map((value) => ({ value, label: value }))} /></Form.Item></td><td><Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}><InputNumber min={1} /></Form.Item></td><td><Button type="text" danger disabled={fields.length === 1} onClick={() => remove(field.name)}>Remove</Button></td></tr>)}</tbody></table><Button icon={<PlusOutlined />} onClick={() => add({ product: products[0], quantity: 1 })}>Add line</Button></>}</Form.List></Form>}</DocumentSection>
  </DocumentWorkspace>;
}

export function PurchaseOrdersWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['purchase-orders'];
  const suppliers = workspace.records.suppliers.filter((row) => row.status === 'Active').map((row) => String(row.name));
  const [active, setActive] = useState<RecordData | 'new' | null>(null);
  const [form] = Form.useForm();
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Purchase order', dataIndex: 'name', width: 190, render: (value, row) => <EntityCell title={value} subtitle={row.date} onClick={() => setActive(row)} /> },
    { key: 'supplier', title: 'Supplier', dataIndex: 'supplier', width: 240 },
    { key: 'amount', title: 'Amount', dataIndex: 'amount', width: 150, align: 'right', render: (value) => <MoneyCell value={value} currency={workspace.org.currency} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 130, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace.org.currency]);
  if (!active) return <DocumentList title="Purchase orders" group="Purchasing" description="Procurement documents with supplier, line-item, ordering and receiving context." rows={rows} columns={columns} onNew={() => { form.resetFields(); form.setFieldsValue({ date: new Date().toISOString().slice(0, 10), lines: [{ product: products[0], quantity: 1, rate: 100 }] }); setActive('new'); }} onOpen={setActive} searchPlaceholder="Search order or supplier…" metrics={[{ label: 'Draft', value: rows.filter((r) => r.status === 'Draft').length }, { label: 'Ordered', value: rows.filter((r) => r.status === 'Ordered').length }, { label: 'Received', value: rows.filter((r) => r.status === 'Received').length }, { label: 'Open value', value: formatMoney(rows.filter((r) => r.status !== 'Received' && r.status !== 'Cancelled').reduce((s, r) => s + Number(r.amount), 0), workspace.org.currency) }]} />;
  const existing = active === 'new' ? null : active;
  const lines = existing ? parseLines(existing.lines) : [];
  const advance = () => { if (!existing) return; const status = existing.status === 'Draft' ? 'Ordered' : existing.status === 'Ordered' ? 'Received' : existing.status; workspace.save('purchase-orders', { ...existing, status }); setActive({ ...existing, status }); feedback.success(status === 'Ordered' ? 'Purchase order issued' : 'Purchase order received'); };
  const save = async () => { const values = await form.validateFields(); const documentLines = values.lines as Array<{ product: string; quantity: number; rate: number }>; const amount = documentLines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.rate || 0), 0); workspace.save('purchase-orders', { id: crypto.randomUUID(), name: `PO-${String(rows.length + 1).padStart(4, '0')}`, supplier: values.supplier, date: values.date, amount, lines: JSON.stringify(documentLines), status: 'Draft' }); setActive(null); feedback.success('Purchase order draft created'); };
  return <DocumentWorkspace title={existing ? existing.name : 'New purchase order'} subtitle="Procurement document" reference={existing ? String(existing.supplier) : 'Draft · reference assigned on save'} status={<SemanticStatus value={String(existing?.status ?? 'Draft')} />} onBack={() => setActive(null)} primaryAction={existing && ['Draft', 'Ordered'].includes(String(existing.status)) ? <Button type="primary" onClick={advance}>{existing.status === 'Draft' ? 'Issue order' : 'Receive order'}</Button> : !existing ? <Button type="primary" onClick={() => void save()}>Save draft</Button> : undefined} sidebar={<DocumentSummary><div className="document-summary-row"><span>Supplier</span><strong>{existing?.supplier ?? 'Select supplier'}</strong></div><div className="document-summary-row is-total"><span>Total</span><strong>{existing ? formatMoney(existing.amount, workspace.org.currency) : 'Calculated on save'}</strong></div></DocumentSummary>}>
    <DocumentSection title="Order header" description="Supplier and order date are first-class purchasing context.">{existing ? <Descriptions column={2} items={[{ key: 'supplier', label: 'Supplier', children: existing.supplier }, { key: 'date', label: 'Order date', children: existing.date }, { key: 'status', label: 'Status', children: <SemanticStatus value={String(existing.status)} /> }]} /> : <Form form={form} layout="vertical"><div className="form-grid"><Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}><Select showSearch options={suppliers.map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="date" label="Order date" rules={[{ required: true }]}><Input type="date" /></Form.Item></div></Form>}</DocumentSection>
    <DocumentSection title="Order lines" description="Quantities and rates drive the document total.">{existing ? <ReadOnlyLines lines={lines} fallback={<p className="muted">Legacy seeded order does not contain persisted lines.</p>} /> : <Form form={form} component={false}><Form.List name="lines">{(fields, { add, remove }) => <><table className="document-lines-table"><thead><tr><th>Product</th><th>Quantity</th><th>Rate</th><th /></tr></thead><tbody>{fields.map((field) => <tr key={field.key}><td><Form.Item name={[field.name, 'product']} rules={[{ required: true }]}><Select options={products.map((value) => ({ value, label: value }))} /></Form.Item></td><td><Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}><InputNumber min={1} /></Form.Item></td><td><Form.Item name={[field.name, 'rate']} rules={[{ required: true }]}><InputNumber min={0} precision={2} /></Form.Item></td><td><Button type="text" danger disabled={fields.length === 1} onClick={() => remove(field.name)}>Remove</Button></td></tr>)}</tbody></table><Button icon={<PlusOutlined />} onClick={() => add({ product: products[0], quantity: 1, rate: 0 })}>Add line</Button></>}</Form.List></Form>}</DocumentSection>
  </DocumentWorkspace>;
}

export function InvoicesWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['sales-invoices'];
  const customers = workspace.records.customers.filter((row) => row.status === 'Active').map((row) => String(row.name));
  const [active, setActive] = useState<RecordData | 'new' | null>(null);
  const [form] = Form.useForm();
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Invoice', dataIndex: 'name', width: 190, render: (value, row) => <EntityCell title={value} subtitle={row.customer} onClick={() => setActive(row)} /> },
    { key: 'date', title: 'Issued', dataIndex: 'date', width: 130 },
    { key: 'due', title: 'Due', dataIndex: 'due', width: 130 },
    { key: 'amount', title: 'Amount', dataIndex: 'amount', width: 150, align: 'right', render: (value) => <MoneyCell value={value} currency={workspace.org.currency} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace.org.currency]);
  if (!active) return <DocumentList title="Sales invoices" group="Sales" description="Billing documents with customer, line, due-date and receivable context." rows={rows} columns={columns} onNew={() => { form.resetFields(); const date = new Date().toISOString().slice(0, 10); form.setFieldsValue({ date, due: date, lines: [{ description: 'Professional services', quantity: 1, rate: 1000 }] }); setActive('new'); }} onOpen={setActive} searchPlaceholder="Search invoice or customer…" metrics={[{ label: 'Outstanding', value: rows.filter((r) => ['Sent', 'Overdue'].includes(String(r.status))).length }, { label: 'Overdue', value: rows.filter((r) => r.status === 'Overdue').length }, { label: 'Paid', value: rows.filter((r) => r.status === 'Paid').length }, { label: 'Receivables', value: formatMoney(rows.filter((r) => ['Sent', 'Overdue'].includes(String(r.status))).reduce((s, r) => s + Number(r.amount), 0), workspace.org.currency) }]} />;
  const existing = active === 'new' ? null : active;
  const lines = existing ? parseLines(existing.lines) : [];
  const send = () => { if (!existing) return; const status = existing.status === 'Draft' ? 'Sent' : 'Paid'; workspace.save('sales-invoices', { ...existing, status }); setActive({ ...existing, status }); feedback.success(status === 'Sent' ? 'Invoice sent' : 'Invoice marked paid'); };
  const save = async () => { const values = await form.validateFields(); if (values.due < values.date) return feedback.error('Due date cannot be before issue date.'); const documentLines = values.lines as Array<{ description: string; quantity: number; rate: number }>; const amount = documentLines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.rate || 0), 0); workspace.save('sales-invoices', { id: crypto.randomUUID(), name: `INV-${String(rows.length + 1).padStart(4, '0')}`, customer: values.customer, date: values.date, due: values.due, amount, lines: JSON.stringify(documentLines), status: 'Draft' }); setActive(null); feedback.success('Invoice draft created'); };
  return <DocumentWorkspace title={existing ? existing.name : 'New sales invoice'} subtitle="Customer billing document" reference={existing ? String(existing.customer) : 'Draft · reference assigned on save'} status={<SemanticStatus value={String(existing?.status ?? 'Draft')} />} onBack={() => setActive(null)} primaryAction={existing && ['Draft', 'Sent', 'Overdue'].includes(String(existing.status)) ? <Button type="primary" onClick={send}>{existing.status === 'Draft' ? 'Send invoice' : 'Mark paid'}</Button> : !existing ? <Button type="primary" onClick={() => void save()}>Save draft</Button> : undefined} sidebar={<DocumentSummary><div className="document-summary-row"><span>Customer</span><strong>{existing?.customer ?? 'Select customer'}</strong></div><div className="document-summary-row"><span>Due</span><strong>{existing?.due ?? 'Set due date'}</strong></div><div className="document-summary-row is-total"><span>Total</span><strong>{existing ? formatMoney(existing.amount, workspace.org.currency) : 'Calculated on save'}</strong></div></DocumentSummary>}>
    <DocumentSection title="Invoice header" description="Customer and due date establish the receivable context.">{existing ? <Descriptions column={2} items={[{ key: 'customer', label: 'Customer', children: existing.customer }, { key: 'date', label: 'Issue date', children: existing.date }, { key: 'due', label: 'Due date', children: existing.due }, { key: 'status', label: 'Status', children: <SemanticStatus value={String(existing.status)} /> }]} /> : <Form form={form} layout="vertical"><div className="form-grid"><Form.Item name="customer" label="Customer" rules={[{ required: true }]}><Select showSearch options={customers.map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="date" label="Issue date" rules={[{ required: true }]}><Input type="date" /></Form.Item><Form.Item name="due" label="Due date" rules={[{ required: true }]}><Input type="date" /></Form.Item></div></Form>}</DocumentSection>
    <DocumentSection title="Invoice lines" description="Commercial lines drive the invoice total.">{existing ? <ReadOnlyLines lines={lines} fallback={<p className="muted">Legacy seeded invoice does not contain persisted lines.</p>} /> : <Form form={form} component={false}><Form.List name="lines">{(fields, { add, remove }) => <><table className="document-lines-table"><thead><tr><th>Description</th><th>Quantity</th><th>Rate</th><th /></tr></thead><tbody>{fields.map((field) => <tr key={field.key}><td><Form.Item name={[field.name, 'description']} rules={[{ required: true }]}><Input /></Form.Item></td><td><Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}><InputNumber min={1} /></Form.Item></td><td><Form.Item name={[field.name, 'rate']} rules={[{ required: true }]}><InputNumber min={0} precision={2} /></Form.Item></td><td><Button type="text" danger disabled={fields.length === 1} onClick={() => remove(field.name)}>Remove</Button></td></tr>)}</tbody></table><Button icon={<PlusOutlined />} onClick={() => add({ description: '', quantity: 1, rate: 0 })}>Add line</Button></>}</Form.List></Form>}</DocumentSection>
  </DocumentWorkspace>;
}

export function JournalEntriesWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['journal-entries'];
  const [active, setActive] = useState<RecordData | 'new' | null>(null);
  const [form] = Form.useForm();
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Journal entry', dataIndex: 'name', width: 190, render: (value, row) => <EntityCell title={value} subtitle={row.date} onClick={() => setActive(row)} /> },
    { key: 'description', title: 'Narration', dataIndex: 'description', width: 300, ellipsis: true },
    { key: 'accounts', title: 'Accounts', width: 260, render: (_, row) => `${row.debitAccount} / ${row.creditAccount}` },
    { key: 'amount', title: 'Amount', width: 150, align: 'right', render: (_, row) => <MoneyCell value={row.debit} currency={workspace.org.currency} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value === 'Reviewed' ? 'Posted' : value)} /> },
  ], [workspace.org.currency]);
  if (!active) return <DocumentList title="Journal entries" group="Accounting" description="Balanced double-entry documents with posting and audit context." rows={rows} columns={columns} onNew={() => { form.resetFields(); form.setFieldsValue({ date: new Date().toISOString().slice(0, 10), lines: [{ account: 'Office expense', debit: 1000, credit: 0 }, { account: 'Cash at bank', debit: 0, credit: 1000 }] }); setActive('new'); }} onOpen={setActive} searchPlaceholder="Search journal, account or narration…" metrics={[{ label: 'Draft', value: rows.filter((r) => r.status === 'Draft').length }, { label: 'Posted', value: rows.filter((r) => r.status === 'Reviewed').length }, { label: 'Debit volume', value: formatMoney(rows.reduce((s, r) => s + Number(r.debit), 0), workspace.org.currency) }, { label: 'Difference', value: formatMoney(rows.reduce((s, r) => s + Number(r.debit) - Number(r.credit), 0), workspace.org.currency) }]} />;
  const existing = active === 'new' ? null : active;
  const lines = existing ? parseLines(existing.journalLines) : [];
  const post = () => { if (!existing) return; workspace.save('journal-entries', { ...existing, status: 'Reviewed' }); setActive({ ...existing, status: 'Reviewed' }); feedback.success('Journal posted'); };
  const save = async () => { const values = await form.validateFields(); const documentLines = values.lines as Array<{ account: string; debit?: number; credit?: number }>; const debit = documentLines.reduce((sum, line) => sum + Number(line.debit || 0), 0); const credit = documentLines.reduce((sum, line) => sum + Number(line.credit || 0), 0); if (Math.round(debit * 100) !== Math.round(credit * 100) || debit <= 0) return feedback.error('Journal must contain equal positive debits and credits.'); workspace.save('journal-entries', { id: crypto.randomUUID(), name: `JE-2026-${String(rows.length + 101).padStart(4, '0')}`, date: values.date, debitAccount: documentLines.find((line) => Number(line.debit) > 0)?.account ?? '', creditAccount: documentLines.find((line) => Number(line.credit) > 0)?.account ?? '', debit, credit, description: values.narration ?? '', journalLines: JSON.stringify(documentLines), status: 'Draft' }); setActive(null); feedback.success('Journal draft created'); };
  return <DocumentWorkspace title={existing ? existing.name : 'New journal entry'} subtitle="Accounting document" reference={existing ? String(existing.date) : 'Draft · reference assigned on save'} status={<SemanticStatus value={String(existing?.status === 'Reviewed' ? 'Posted' : existing?.status ?? 'Draft')} />} onBack={() => setActive(null)} primaryAction={existing?.status === 'Draft' ? <Button type="primary" onClick={post}>Post journal</Button> : !existing ? <Button type="primary" onClick={() => void save()}>Save draft</Button> : undefined} sidebar={<><DocumentSummary><div className="document-summary-row"><span>Total debit</span><strong>{existing ? formatMoney(existing.debit, workspace.org.currency) : 'Calculated on save'}</strong></div><div className="document-summary-row"><span>Total credit</span><strong>{existing ? formatMoney(existing.credit, workspace.org.currency) : 'Calculated on save'}</strong></div><div className="document-summary-row is-total"><span>Difference</span><strong>{existing ? formatMoney(Number(existing.debit) - Number(existing.credit), workspace.org.currency) : 'Must be zero'}</strong></div></DocumentSummary>{existing ? <WorkflowBar steps={['Draft', 'Posted', 'Reversed']} current={existing.status === 'Reviewed' ? 'Posted' : 'Draft'} /> : null}</>}>
    <DocumentSection title="Journal header" description="Posting date and narration explain why the accounting entry exists.">{existing ? <Descriptions column={2} items={[{ key: 'date', label: 'Posting date', children: existing.date }, { key: 'narration', label: 'Narration', children: existing.description }, { key: 'status', label: 'Status', children: <SemanticStatus value={String(existing.status === 'Reviewed' ? 'Posted' : existing.status)} /> }]} /> : <Form form={form} layout="vertical"><div className="form-grid"><Form.Item name="date" label="Posting date" rules={[{ required: true }]}><Input type="date" /></Form.Item><Form.Item name="narration" label="Narration" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item></div></Form>}</DocumentSection>
    <DocumentSection title="Accounting lines" description="Every journal must remain balanced before posting.">{existing ? <ReadOnlyLines lines={lines} fallback={<table className="document-lines-table"><thead><tr><th>Account</th><th className="numeric">Debit</th><th className="numeric">Credit</th></tr></thead><tbody><tr><td>{existing.debitAccount}</td><td className="numeric">{formatMoney(existing.debit, workspace.org.currency)}</td><td /></tr><tr><td>{existing.creditAccount}</td><td /><td className="numeric">{formatMoney(existing.credit, workspace.org.currency)}</td></tr></tbody></table>} /> : <Form form={form} component={false}><Form.List name="lines">{(fields, { add, remove }) => <><table className="document-lines-table"><thead><tr><th>Account</th><th>Debit</th><th>Credit</th><th /></tr></thead><tbody>{fields.map((field) => <tr key={field.key}><td><Form.Item name={[field.name, 'account']} rules={[{ required: true }]}><Select showSearch options={accounts.map((value) => ({ value, label: value }))} /></Form.Item></td><td><Form.Item name={[field.name, 'debit']}><InputNumber min={0} precision={2} /></Form.Item></td><td><Form.Item name={[field.name, 'credit']}><InputNumber min={0} precision={2} /></Form.Item></td><td><Button type="text" danger disabled={fields.length <= 2} onClick={() => remove(field.name)}>Remove</Button></td></tr>)}</tbody></table><Button icon={<PlusOutlined />} onClick={() => add({ debit: 0, credit: 0 })}>Add accounting line</Button></>}</Form.List></Form>}</DocumentSection>
  </DocumentWorkspace>;
}

export function PaymentsWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records.payments;
  const [active, setActive] = useState<RecordData | 'new' | null>(null);
  const [form] = Form.useForm();
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Payment', dataIndex: 'name', width: 190, render: (value, row) => <EntityCell title={value} subtitle={row.date} onClick={() => setActive(row)} /> },
    { key: 'party', title: 'Party', dataIndex: 'party', width: 240 },
    { key: 'method', title: 'Method', dataIndex: 'method', width: 160 },
    { key: 'amount', title: 'Amount', dataIndex: 'amount', width: 150, align: 'right', render: (value) => <MoneyCell value={value} currency={workspace.org.currency} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace.org.currency]);
  if (!active) return <DocumentList title="Payments" group="Accounting" description="Receipts and disbursements with method, party and allocation context." rows={rows} columns={columns} onNew={() => { form.resetFields(); form.setFieldsValue({ date: new Date().toISOString().slice(0, 10), method: 'Bank transfer', direction: 'Receipt' }); setActive('new'); }} onOpen={setActive} searchPlaceholder="Search payment or party…" metrics={[{ label: 'Pending', value: rows.filter((r) => r.status === 'Pending').length }, { label: 'Completed', value: rows.filter((r) => r.status === 'Completed').length }, { label: 'Failed', value: rows.filter((r) => r.status === 'Failed').length }, { label: 'Completed value', value: formatMoney(rows.filter((r) => r.status === 'Completed').reduce((s, r) => s + Number(r.amount), 0), workspace.org.currency) }]} />;
  const existing = active === 'new' ? null : active;
  const complete = () => { if (!existing) return; workspace.save('payments', { ...existing, status: 'Completed' }); setActive({ ...existing, status: 'Completed' }); feedback.success('Payment completed'); };
  const save = async () => { const values = await form.validateFields(); workspace.save('payments', { id: crypto.randomUUID(), name: `PAY-${String(rows.length + 1).padStart(4, '0')}`, party: values.party, amount: values.amount, method: values.method, date: values.date, direction: values.direction, allocationNote: values.allocationNote ?? '', status: 'Pending' }); setActive(null); feedback.success('Payment draft recorded'); };
  return <DocumentWorkspace title={existing ? existing.name : 'New payment'} subtitle="Payment allocation document" reference={existing ? String(existing.party) : 'Pending · reference assigned on save'} status={<SemanticStatus value={String(existing?.status ?? 'Pending')} />} onBack={() => setActive(null)} primaryAction={existing?.status === 'Pending' ? <Button type="primary" onClick={complete}>Complete payment</Button> : !existing ? <Button type="primary" onClick={() => void save()}>Record payment</Button> : undefined} sidebar={<DocumentSummary><div className="document-summary-row"><span>Direction</span><strong>{existing?.direction ?? 'Set on record'}</strong></div><div className="document-summary-row"><span>Method</span><strong>{existing?.method ?? 'Select method'}</strong></div><div className="document-summary-row is-total"><span>Amount</span><strong>{existing ? formatMoney(existing.amount, workspace.org.currency) : 'Enter amount'}</strong></div></DocumentSummary>}>
    <DocumentSection title="Payment details" description="Party, direction, method and amount belong together as a financial document.">{existing ? <Descriptions column={{ xs: 1, sm: 2 }} items={[{ key: 'party', label: 'Party', children: existing.party }, { key: 'direction', label: 'Direction', children: existing.direction ?? 'Receipt' }, { key: 'method', label: 'Method', children: existing.method }, { key: 'date', label: 'Payment date', children: existing.date }, { key: 'status', label: 'Status', children: <SemanticStatus value={String(existing.status)} /> }]} /> : <Form form={form} layout="vertical"><div className="form-grid"><Form.Item name="direction" label="Direction" rules={[{ required: true }]}><Select options={['Receipt', 'Disbursement'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="party" label="Customer / supplier" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item><Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber min={0.01} precision={2} style={{ width: '100%' }} /></Form.Item><Form.Item name="method" label="Payment method" rules={[{ required: true }]}><Select options={['Bank transfer', 'Card', 'Cash'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="date" label="Payment date" rules={[{ required: true }]}><Input type="date" /></Form.Item><Form.Item name="allocationNote" label="Allocation / reference"><Input.TextArea rows={2} /></Form.Item></div></Form>}</DocumentSection>
    <DocumentSection title="Allocation context" description="Production adapters can expose invoice/bill allocations here without changing the document floorplan."><p className="muted">This starter keeps allocation data intentionally light while preserving the correct full-page transaction structure.</p></DocumentSection>
  </DocumentWorkspace>;
}
