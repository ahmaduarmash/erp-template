import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tree,
  Typography,
  type TableColumnsType,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
  WorkflowBar,
  formatMoney,
} from '../../components/erp/ErpPrimitives';

const accountOptions = ['Cash at bank', 'Petty cash', 'Accounts receivable', 'Inventory', 'Accounts payable', 'Sales revenue', 'Office expense', 'Salary expense'].map((value) => ({ value, label: value }));
const productOptions = ['Arc desk lamp', 'Contour office chair', 'Studio monitor 27″', 'Wireless keyboard'].map((value) => ({ value, label: value }));

function AccountTree({ rows, selectedId, onSelect }: { rows: RecordData[]; selectedId: string; onSelect: (id: string) => void }) {
  const groups = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  const treeData = groups.map((type) => ({
    title: type,
    key: `type-${type}`,
    children: rows.filter((row) => row.type === type).map((row) => ({ title: `${row.code} · ${row.name}`, key: row.id })),
  }));
  return <Tree defaultExpandAll selectedKeys={[selectedId]} treeData={treeData} onSelect={(keys) => { const key = String(keys[0] ?? ''); if (!key.startsWith('type-')) onSelect(key); }} />;
}

export function AccountsWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['chart-of-accounts'];
  const [selectedId, setSelectedId] = useState(String(rows[0]?.id ?? ''));
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const save = async () => {
    const values = await form.validateFields();
    workspace.save('chart-of-accounts', { id: crypto.randomUUID(), name: values.name, code: values.code, type: values.type, parent: values.parent ?? '', status: values.active === false ? 'Inactive' : 'Active' });
    setOpen(false); form.resetFields(); feedback.success('Account created');
  };
  return (
    <MotionSurface page>
      <PageHeader title="Chart of accounts" group="Accounting" description="Hierarchical financial structure with group and posting-account behavior." action={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>New account</Button>} />
      <KpiStrip items={[{ label: 'Accounts', value: rows.length, hint: 'ledger and groups' }, { label: 'Assets', value: rows.filter((row) => row.type === 'Asset').length }, { label: 'Expenses', value: rows.filter((row) => row.type === 'Expense').length }, { label: 'Inactive', value: rows.filter((row) => row.status === 'Inactive').length }]} />
      <div className="erp-split-layout">
        <section className="panel erp-tree-panel"><div className="widget-heading"><div><h2>Account tree</h2><p className="muted">Group hierarchy and posting accounts</p></div></div><AccountTree rows={rows} selectedId={selectedId} onSelect={setSelectedId} /></section>
        <section className="panel erp-detail-panel">{selected ? <><div className="erp-object-heading"><div><span className="muted">{selected.code}</span><h2>{selected.name}</h2><p>{selected.type} account</p></div><SemanticStatus value={String(selected.status)} /></div><Descriptions column={2} items={[{ key: 'type', label: 'Account type', children: selected.type }, { key: 'parent', label: 'Parent', children: selected.parent || 'Root account' }, { key: 'kind', label: 'Posting mode', children: Number(String(selected.code).slice(-1)) % 2 === 0 ? 'Group account' : 'Posting account' }, { key: 'reconciliation', label: 'Reconciliation', children: Number(String(selected.code).slice(-1)) % 3 === 0 ? 'Allowed' : 'No' }]} /><KpiStrip items={[{ label: 'Current balance', value: formatMoney(Number(String(selected.code).replace(/\D/g, '')) * 13, workspace.org.currency) }, { label: 'Entries this month', value: 18 }, { label: 'Children', value: 3 }]} /><Space wrap><Button>View ledger</Button><Button>Add child</Button><Button>Edit account</Button><Button danger onClick={() => workspace.save('chart-of-accounts', { ...selected, status: 'Inactive' })}>Deactivate</Button></Space></> : null}</section>
      </div>
      <Drawer width={680} open={open} title="New account" onClose={() => setOpen(false)} extra={<Button type="primary" onClick={() => void save()}>Create account</Button>}><Form form={form} layout="vertical" initialValues={{ type: 'Asset', active: true, isGroup: false }}><div className="form-grid"><Form.Item name="name" label="Account name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="code" label="Account code" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="type" label="Account type"><Select options={['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="parent" label="Parent account"><Select allowClear showSearch options={rows.map((row) => ({ value: row.name, label: `${row.code} · ${row.name}` }))} /></Form.Item><Form.Item name="isGroup" label="Group account" valuePropName="checked"><Switch /></Form.Item><Form.Item name="reconcile" label="Allow reconciliation" valuePropName="checked"><Switch /></Form.Item><Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item></div></Form></Drawer>
    </MotionSurface>
  );
}

export function JournalsWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['journal-entries'];
  const [open, setOpen] = useState(false);
  const [quick, setQuick] = useState(false);
  const [form] = Form.useForm();
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Journal', dataIndex: 'name', width: 190, render: (value, row) => <EntityCell title={value} subtitle={row.date} /> },
    { key: 'narration', title: 'Narration', dataIndex: 'description', width: 280, ellipsis: true },
    { key: 'amount', title: 'Amount', width: 150, align: 'right', render: (_, row) => <MoneyCell value={row.debit} currency={workspace.org.currency} /> },
    { key: 'accounts', title: 'Accounts', width: 240, render: (_, row) => <span>{row.debitAccount} → {row.creditAccount}</span> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value === 'Reviewed' ? 'Posted' : value)} /> },
  ], [workspace.org.currency]);
  const saveFull = async () => {
    const values = await form.validateFields();
    const lines = values.lines as Array<{ account: string; debit?: number; credit?: number }>;
    const debit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const credit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    if (Math.round(debit * 100) !== Math.round(credit * 100) || debit <= 0) { feedback.error('Journal must contain equal positive debits and credits.'); return; }
    workspace.save('journal-entries', { id: crypto.randomUUID(), name: `JE-2026-${String(rows.length + 101).padStart(4, '0')}`, date: values.date, debitAccount: lines.find((line) => Number(line.debit) > 0)?.account ?? '', creditAccount: lines.find((line) => Number(line.credit) > 0)?.account ?? '', debit, credit, description: values.narration ?? '', status: 'Draft' });
    setOpen(false); form.resetFields(); feedback.success('Journal draft created');
  };
  const saveQuick = async () => {
    const values = await form.validateFields();
    workspace.save('journal-entries', { id: crypto.randomUUID(), name: `JE-2026-${String(rows.length + 101).padStart(4, '0')}`, date: values.date, debitAccount: values.debitAccount, creditAccount: values.creditAccount, debit: values.amount, credit: values.amount, description: values.narration ?? '', status: 'Draft' });
    setQuick(false); form.resetFields(); feedback.success('Quick journal created');
  };
  return (
    <MotionSurface page>
      <PageHeader title="Journal entries" group="Accounting" description="Multi-line double-entry documents with balance validation and posting workflow." action={<Space><Button onClick={() => { form.resetFields(); setQuick(true); }}>Quick journal</Button><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setOpen(true); }}>New journal entry</Button></Space>} />
      <KpiStrip items={[{ label: 'Draft', value: rows.filter((row) => row.status === 'Draft').length }, { label: 'Posted / reviewed', value: rows.filter((row) => row.status === 'Reviewed').length }, { label: 'Debit volume', value: formatMoney(rows.reduce((sum, row) => sum + Number(row.debit), 0), workspace.org.currency) }, { label: 'Difference', value: formatMoney(rows.reduce((sum, row) => sum + Number(row.debit) - Number(row.credit), 0), workspace.org.currency), hint: 'should remain zero' }]} />
      <DomainTable rows={rows} columns={columns} rowActions={(row) => <ActionMenu primary={{ label: row.status === 'Draft' ? 'Post' : 'View', onClick: () => row.status === 'Draft' ? workspace.save('journal-entries', { ...row, status: 'Reviewed' }) : feedback.success(`Journal ${row.name}`) }} overflow={[{ key: 'duplicate', label: 'Duplicate', onClick: () => feedback.success('Duplicate journal') }, { key: 'ledger', label: 'View ledger impact', onClick: () => feedback.success('Ledger drill-down') }, { key: 'reverse', label: 'Reverse entry', onClick: () => feedback.success('A posted entry should reverse through a new journal, not destructive editing'), danger: true, disabled: row.status === 'Draft' }]} />} />
      <Drawer width={980} open={open} title="New journal entry" onClose={() => setOpen(false)} extra={<Button type="primary" onClick={() => void saveFull()}>Save draft</Button>}><WorkflowBar steps={['Draft', 'Posted', 'Reversed']} current="Draft" /><Form form={form} layout="vertical" initialValues={{ type: 'Journal Entry', date: '2026-09-23', lines: [{ account: 'Office expense', debit: 1000, credit: 0 }, { account: 'Cash at bank', debit: 0, credit: 1000 }] }}><div className="form-grid"><Form.Item name="type" label="Entry type"><Select options={['Journal Entry', 'Opening Entry', 'Contra', 'Bank', 'Cash', 'Write-off', 'Adjustment'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="date" label="Posting date"><Input type="date" /></Form.Item><Form.Item name="narration" label="Narration"><Input /></Form.Item></div><Typography.Title level={5}>Accounting entries</Typography.Title><Form.List name="lines">{(fields, { add, remove }) => <>{fields.map((field) => <Space key={field.key} align="start" className="erp-line-editor erp-line-editor-wide"><Form.Item {...field} name={[field.name, 'account']} rules={[{ required: true }]}><Select showSearch placeholder="Account" options={accountOptions} style={{ width: 280 }} /></Form.Item><Form.Item {...field} name={[field.name, 'debit']}><InputNumber min={0} precision={2} placeholder="Debit" /></Form.Item><Form.Item {...field} name={[field.name, 'credit']}><InputNumber min={0} precision={2} placeholder="Credit" /></Form.Item><Button danger type="text" onClick={() => remove(field.name)}>Remove</Button></Space>)}<Button icon={<PlusOutlined />} onClick={() => add({ debit: 0, credit: 0 })}>Add line</Button></>}</Form.List></Form></Drawer>
      <Drawer width={600} open={quick} title="Quick journal" onClose={() => setQuick(false)} extra={<Button type="primary" onClick={() => void saveQuick()}>Create journal</Button>}><Alert showIcon type="info" message="Quick two-line journal" description="Use the full journal editor for allocations across three or more ledger accounts." /><Form form={form} layout="vertical" initialValues={{ date: '2026-09-23' }}><Form.Item name="date" label="Posting date"><Input type="date" /></Form.Item><Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber min={0.01} precision={2} style={{ width: '100%' }} /></Form.Item><Form.Item name="debitAccount" label="Debit account" rules={[{ required: true }]}><Select showSearch options={accountOptions} /></Form.Item><Form.Item name="creditAccount" label="Credit account" rules={[{ required: true }]}><Select showSearch options={accountOptions} /></Form.Item><Form.Item name="narration" label="Narration"><Input.TextArea rows={3} /></Form.Item></Form></Drawer>
    </MotionSurface>
  );
}

export function InvoicesWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['sales-invoices'];
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('all');
  const [form] = Form.useForm();
  const visible = rows.filter((row) => view === 'all' || String(row.status).toLowerCase() === view);
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Invoice', dataIndex: 'name', width: 190, render: (value, row) => <EntityCell title={value} subtitle={`Issued ${row.date}`} /> },
    { key: 'customer', title: 'Customer', dataIndex: 'customer', width: 220 },
    { key: 'due', title: 'Due date', dataIndex: 'due', width: 130 },
    { key: 'total', title: 'Total', dataIndex: 'amount', width: 140, align: 'right', render: (value) => <MoneyCell value={value} currency={workspace.org.currency} /> },
    { key: 'outstanding', title: 'Outstanding', width: 140, align: 'right', render: (_, row) => <MoneyCell value={row.status === 'Paid' ? 0 : Number(row.amount) * (row.status === 'Sent' ? 1 : 0.55)} currency={workspace.org.currency} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace.org.currency]);
  const save = async () => {
    const values = await form.validateFields();
    const lines = values.lines as Array<{ item: string; quantity: number; rate: number; discount: number; tax: number }>;
    const amount = lines.reduce((sum, line) => { const gross = Number(line.quantity) * Number(line.rate); return sum + gross * (1 - Number(line.discount || 0) / 100) * (1 + Number(line.tax || 0) / 100); }, 0);
    workspace.save('sales-invoices', { id: crypto.randomUUID(), name: `INV-2026-${String(rows.length + 101).padStart(4, '0')}`, customer: values.customer, amount: Number(amount.toFixed(2)), date: values.date, due: values.due, status: 'Draft' });
    setOpen(false); form.resetFields(); feedback.success('Invoice draft created');
  };
  return (
    <MotionSurface page>
      <PageHeader title="Sales invoices" group="Accounting" description="Customer billing documents with item lines, due dates and receivable status." action={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>New invoice</Button>} />
      <KpiStrip items={[{ label: 'Total invoiced', value: formatMoney(rows.reduce((sum, row) => sum + Number(row.amount), 0), workspace.org.currency) }, { label: 'Outstanding', value: formatMoney(rows.filter((row) => row.status !== 'Paid').reduce((sum, row) => sum + Number(row.amount), 0), workspace.org.currency) }, { label: 'Overdue', value: rows.filter((row) => row.status === 'Overdue').length }, { label: 'Paid', value: rows.filter((row) => row.status === 'Paid').length }]} />
      <QuickViews value={view} onChange={setView} items={[{ value: 'all', label: 'All' }, { value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' }]} />
      <DomainTable rows={visible} columns={columns} rowActions={(row) => <ActionMenu primary={{ label: row.status === 'Draft' ? 'Send' : row.status === 'Paid' ? 'View' : 'Record payment', onClick: () => row.status === 'Draft' ? workspace.save('sales-invoices', { ...row, status: 'Sent' }) : feedback.success(row.status === 'Paid' ? `Invoice ${row.name}` : 'Payment allocation flow opened') }} overflow={[{ key: 'pdf', label: 'Download PDF', onClick: () => feedback.success('Invoice PDF layout ready for integration') }, { key: 'credit', label: 'Create credit note', onClick: () => feedback.success('Credit note workflow') }, { key: 'duplicate', label: 'Duplicate', onClick: () => feedback.success('Duplicate invoice') }, { key: 'ledger', label: 'View ledger', onClick: () => feedback.success('Receivable ledger drill-down') }]} />} />
      <Drawer width={980} open={open} title="New sales invoice" onClose={() => setOpen(false)} extra={<Button type="primary" onClick={() => void save()}>Save draft</Button>}><WorkflowBar steps={['Draft', 'Sent', 'Paid']} current="Draft" /><Form form={form} layout="vertical" initialValues={{ date: '2026-09-23', due: '2026-10-23', lines: [{ item: 'Arc desk lamp', quantity: 1, rate: 149, discount: 0, tax: 5 }] }}><div className="form-grid"><Form.Item name="customer" label="Customer" rules={[{ required: true }]}><Select options={workspace.records.customers.map((row) => ({ value: row.name, label: row.name }))} /></Form.Item><Form.Item name="date" label="Issue date"><Input type="date" /></Form.Item><Form.Item name="due" label="Due date"><Input type="date" /></Form.Item><Form.Item label="Currency"><Select defaultValue={workspace.org.currency} options={[workspace.org.currency, 'USD', 'EUR'].filter((value, index, array) => array.indexOf(value) === index).map((value) => ({ value, label: value }))} /></Form.Item></div><Typography.Title level={5}>Invoice items</Typography.Title><Form.List name="lines">{(fields, { add, remove }) => <>{fields.map((field) => <Space key={field.key} align="start" className="erp-line-editor erp-line-editor-wide"><Form.Item {...field} name={[field.name, 'item']}><Select options={productOptions} style={{ width: 220 }} /></Form.Item><Form.Item {...field} name={[field.name, 'quantity']}><InputNumber min={0.01} placeholder="Qty" /></Form.Item><Form.Item {...field} name={[field.name, 'rate']}><InputNumber min={0} placeholder="Rate" /></Form.Item><Form.Item {...field} name={[field.name, 'discount']}><InputNumber min={0} max={100} placeholder="Disc %" /></Form.Item><Form.Item {...field} name={[field.name, 'tax']}><InputNumber min={0} max={100} placeholder="Tax %" /></Form.Item><Button danger type="text" onClick={() => remove(field.name)}>Remove</Button></Space>)}<Button icon={<PlusOutlined />} onClick={() => add({ quantity: 1, rate: 0, discount: 0, tax: 0 })}>Add item</Button></>}</Form.List></Form></Drawer>
    </MotionSurface>
  );
}

export function PaymentsWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records.payments;
  const [open, setOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('Receive');
  const [form] = Form.useForm();
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Payment', dataIndex: 'name', width: 190, render: (value, row) => <EntityCell title={value} subtitle={row.date} /> },
    { key: 'direction', title: 'Direction', width: 110, render: (_, row) => <span>{Number(String(row.id).replace(/\D/g, '').slice(-1) || 0) % 2 === 0 ? '↓ Receive' : '↑ Pay'}</span> },
    { key: 'party', title: 'Party', dataIndex: 'party', width: 220 },
    { key: 'method', title: 'Method', dataIndex: 'method', width: 150 },
    { key: 'amount', title: 'Amount', dataIndex: 'amount', width: 140, align: 'right', render: (value) => <MoneyCell value={value} currency={workspace.org.currency} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace.org.currency]);
  const save = async () => {
    const values = await form.validateFields();
    workspace.save('payments', { id: crypto.randomUUID(), name: `PAY-2026-${String(rows.length + 101).padStart(4, '0')}`, party: values.party ?? `${values.fromAccount} → ${values.toAccount}`, amount: values.amount, method: values.method, date: values.date, status: 'Completed' });
    setOpen(false); form.resetFields(); feedback.success('Payment recorded');
  };
  return (
    <MotionSurface page>
      <PageHeader title="Payments" group="Accounting" description="Receive, pay and transfer money with invoice-allocation context." action={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>New payment</Button>} />
      <KpiStrip items={[{ label: 'Completed', value: rows.filter((row) => row.status === 'Completed').length }, { label: 'Pending', value: rows.filter((row) => row.status === 'Pending').length }, { label: 'Payment volume', value: formatMoney(rows.reduce((sum, row) => sum + Number(row.amount), 0), workspace.org.currency) }, { label: 'Failed', value: rows.filter((row) => row.status === 'Failed').length }]} />
      <DomainTable rows={rows} columns={columns} rowActions={(row) => <ActionMenu primary={{ label: 'View', onClick: () => feedback.success(`Payment ${row.name}`) }} overflow={[{ key: 'receipt', label: 'Payment receipt', onClick: () => feedback.success('Receipt layout ready') }, { key: 'allocations', label: 'View allocations', onClick: () => feedback.success('Invoice allocations') }, { key: 'ledger', label: 'View ledger', onClick: () => feedback.success('Ledger drill-down') }]} />} />
      <Drawer width={760} open={open} title="New payment" onClose={() => setOpen(false)} extra={<Button type="primary" onClick={() => void save()}>Record payment</Button>}><Segmented block value={paymentType} onChange={(value) => setPaymentType(String(value))} options={['Receive', 'Pay', 'Internal Transfer']} /><Form form={form} layout="vertical" initialValues={{ date: '2026-09-23', method: 'Bank transfer' }} className="erp-form-top"><div className="form-grid">{paymentType !== 'Internal Transfer' ? <Form.Item name="party" label={paymentType === 'Receive' ? 'Customer' : 'Supplier'} rules={[{ required: true }]}><Select options={(paymentType === 'Receive' ? workspace.records.customers : workspace.records.suppliers).map((row) => ({ value: row.name, label: row.name }))} /></Form.Item> : <><Form.Item name="fromAccount" label="From account" rules={[{ required: true }]}><Select options={accountOptions} /></Form.Item><Form.Item name="toAccount" label="To account" rules={[{ required: true }]}><Select options={accountOptions} /></Form.Item></>}<Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber min={0.01} precision={2} style={{ width: '100%' }} /></Form.Item><Form.Item name="method" label="Payment method"><Select options={['Bank transfer', 'Card', 'Cash'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="date" label="Posting date"><Input type="date" /></Form.Item></div>{paymentType !== 'Internal Transfer' ? <><Typography.Title level={5}>Outstanding references</Typography.Title><Table pagination={false} rowKey="reference" columns={[{ title: 'Invoice', dataIndex: 'reference' }, { title: 'Outstanding', dataIndex: 'outstanding', render: (value) => formatMoney(value, workspace.org.currency) }, { title: 'Allocate', dataIndex: 'allocation', render: (value) => <InputNumber defaultValue={value} min={0} precision={2} /> }]} dataSource={[{ reference: 'INV-2026-0104', outstanding: 6500, allocation: 6500 }, { reference: 'INV-2026-0107', outstanding: 4800, allocation: 3500 }]} /></> : null}</Form></Drawer>
    </MotionSurface>
  );
}

export function ExpensesWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const [view, setView] = useState('pending');
  const rows = workspace.records.expenses.filter((row) => view === 'all' || (view === 'mine' ? row.owner === workspace.profile.name : String(row.status).toLowerCase() === view));
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Expense', dataIndex: 'name', width: 250, render: (value, row) => <EntityCell title={value} subtitle={row.category} /> },
    { key: 'owner', title: 'Submitted by', dataIndex: 'owner', width: 180 },
    { key: 'date', title: 'Date', dataIndex: 'date', width: 130 },
    { key: 'amount', title: 'Amount', dataIndex: 'amount', width: 140, align: 'right', render: (value) => <MoneyCell value={value} currency={workspace.org.currency} /> },
    { key: 'receipt', title: 'Receipt', width: 90, render: () => 'Attached' },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace.org.currency]);
  return (
    <MotionSurface page>
      <PageHeader title="Expenses" group="Accounting" description="Expense submission and approval queue with evidence and financial context." action={<Button type="primary" icon={<PlusOutlined />}>New expense</Button>} />
      <QuickViews value={view} onChange={setView} items={[{ value: 'mine', label: 'My expenses' }, { value: 'pending', label: 'Pending approval' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'all', label: 'All' }]} />
      <DomainTable rows={rows} columns={columns} rowActions={(row) => <ActionMenu primary={row.status === 'Pending' ? { label: 'Approve', onClick: () => workspace.save('expenses', { ...row, status: 'Approved' }) } : { label: 'View', onClick: () => feedback.success(`Expense ${row.name}`) }} overflow={[{ key: 'changes', label: 'Request changes', onClick: () => feedback.success('Request changes workflow') }, { key: 'reject', label: 'Reject', onClick: () => workspace.save('expenses', { ...row, status: 'Rejected' }), danger: true, disabled: row.status !== 'Pending' }, { key: 'audit', label: 'Approval history', onClick: () => feedback.success('Approval timeline') }]} />} />
    </MotionSurface>
  );
}

export function CustomersWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records.customers;
  const [selected, setSelected] = useState<RecordData | null>(null);
  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    { key: 'name', title: 'Customer', dataIndex: 'name', width: 250, render: (value, row) => <EntityCell title={value} subtitle={row.email} initials={String(value).split(' ').map((part) => part[0]).join('').slice(0, 2)} /> },
    { key: 'contact', title: 'Contact', dataIndex: 'contact', width: 180 },
    { key: 'outstanding', title: 'Outstanding', width: 150, align: 'right', render: (_, row) => <MoneyCell value={workspace.records['sales-invoices'].filter((invoice) => invoice.customer === row.name && invoice.status !== 'Paid').reduce((sum, invoice) => sum + Number(invoice.amount), 0)} currency={workspace.org.currency} /> },
    { key: 'overdue', title: 'Overdue', width: 130, align: 'right', render: (_, row) => <MoneyCell value={workspace.records['sales-invoices'].filter((invoice) => invoice.customer === row.name && invoice.status === 'Overdue').reduce((sum, invoice) => sum + Number(invoice.amount), 0)} currency={workspace.org.currency} /> },
    { key: 'location', title: 'Location', dataIndex: 'location', width: 170 },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 110, render: (value) => <SemanticStatus value={String(value)} /> },
  ], [workspace]);
  return (
    <MotionSurface page>
      <PageHeader title="Customers" group="Accounting" description="Customer financial relationship workspace with receivables and activity context." action={<Button type="primary" icon={<PlusOutlined />}>New customer</Button>} />
      <DomainTable rows={rows} columns={columns} rowActions={(row) => <ActionMenu primary={{ label: 'View', onClick: () => setSelected(row) }} overflow={[{ key: 'invoice', label: 'Create invoice', onClick: () => feedback.success('Create invoice from customer context') }, { key: 'payment', label: 'Record payment', onClick: () => feedback.success('Record customer payment') }, { key: 'edit', label: 'Edit customer', onClick: () => setSelected(row) }, { key: 'hold', label: 'Place on hold', onClick: () => workspace.save('customers', { ...row, status: 'Inactive' }), danger: true }]} />} />
      <Drawer width={720} open={!!selected} title={selected?.name ? String(selected.name) : 'Customer'} onClose={() => setSelected(null)}>{selected ? <><KpiStrip items={[{ label: 'Receivable', value: formatMoney(31800, workspace.org.currency) }, { label: 'Overdue', value: formatMoney(4200, workspace.org.currency) }, { label: 'Credit limit', value: formatMoney(50000, workspace.org.currency), hint: '64% utilized' }]} /><Tabs items={[{ key: 'overview', label: 'Overview', children: <Descriptions column={2} items={[{ key: 'contact', label: 'Contact', children: selected.contact }, { key: 'email', label: 'Email', children: selected.email }, { key: 'phone', label: 'Phone', children: selected.phone }, { key: 'location', label: 'Location', children: selected.location }]} /> }, { key: 'contacts', label: 'Contacts & addresses', children: <Alert type="info" showIcon message="Business-party contacts" description="Production adapters can expose multiple billing/shipping addresses and contacts here." /> }, { key: 'invoices', label: 'Invoices', children: <Typography.Paragraph className="muted">Invoice history and receivable aging stay in customer context.</Typography.Paragraph> }, { key: 'payments', label: 'Payments', children: <Typography.Paragraph className="muted">Allocated and unallocated receipts appear here.</Typography.Paragraph> }, { key: 'activity', label: 'Activity', children: <Typography.Paragraph className="muted">Audit history, communications and status changes.</Typography.Paragraph> }]} /></> : null}</Drawer>
    </MotionSurface>
  );
}
