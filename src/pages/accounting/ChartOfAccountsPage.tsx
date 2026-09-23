import { useMemo, useState } from 'react';
import {
  BankOutlined,
  BarsOutlined,
  BookOutlined,
  BranchesOutlined,
  EditOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Form,
  Input,
  Segmented,
  Select,
  Switch,
  Tag,
  Tooltip,
  Tree,
  Typography,
} from 'antd';
import { ConfirmActionPopover, CreateModal, EditModal } from '../../components/overlays';
import { PageHeader } from '../../components/shell/PageHeader';
import { KpiStrip, SemanticStatus, formatMoney } from '../../components/erp/ErpPrimitives';
import { MotionSurface } from '../../lib/motion';
import { useWorkspace } from '../../data/WorkspaceProvider';
import { useFeedback } from '../../components/feedback';
import type { RecordData } from '../../data/modules';

const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] as const;
const typeIcon = {
  Asset: <WalletOutlined />,
  Liability: <BankOutlined />,
  Equity: <SafetyCertificateOutlined />,
  Revenue: <BarsOutlined />,
  Expense: <BookOutlined />,
};

function isGroupAccount(row: RecordData) {
  return Boolean(row.isGroup) || Number(String(row.code).slice(-1)) % 2 === 0;
}

function allowReconciliation(row: RecordData) {
  return Boolean(row.reconcile) || Number(String(row.code).slice(-1)) % 3 === 0;
}

export default function ChartOfAccountsPage() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['chart-of-accounts'];
  const [selectedId, setSelectedId] = useState(String(rows[0]?.id ?? ''));
  const [view, setView] = useState<'tree' | 'list'>('tree');
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<RecordData | 'new' | null>(null);
  const [form] = Form.useForm();

  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => `${row.code} ${row.name} ${row.type}`.toLowerCase().includes(term));
  }, [query, rows]);

  const treeData = accountTypes.map((type) => ({
    key: `type-${type}`,
    title: (
      <div className="coa-tree-group">
        <span className="coa-tree-group-icon">{typeIcon[type]}</span>
        <strong>{type}</strong>
        <span>{filtered.filter((row) => row.type === type).length}</span>
      </div>
    ),
    children: filtered.filter((row) => row.type === type).map((row) => ({
      key: row.id,
      title: (
        <div className="coa-tree-account">
          <span className="coa-tree-code">{row.code}</span>
          <span className="coa-tree-name">{row.name}</span>
          {isGroupAccount(row) ? <Tag bordered={false}>Group</Tag> : null}
        </div>
      ),
    })),
  }));

  const openEditor = (row?: RecordData, parent?: RecordData) => {
    const target = row ?? 'new';
    setEditor(target);
    form.resetFields();
    form.setFieldsValue(row ?? {
      type: parent?.type ?? 'Asset',
      parent: parent?.name ?? undefined,
      active: true,
      isGroup: false,
      reconcile: false,
    });
  };

  const closeEditor = () => {
    setEditor(null);
    form.resetFields();
  };

  const saveAccount = async () => {
    const values = await form.validateFields();
    const existing = editor && editor !== 'new' ? editor : null;
    const id = existing?.id ?? crypto.randomUUID();
    workspace.save('chart-of-accounts', {
      ...(existing ?? {}),
      id,
      name: values.name,
      code: values.code,
      type: values.type,
      parent: values.parent ?? '',
      isGroup: values.isGroup,
      reconcile: values.reconcile,
      status: values.active === false ? 'Inactive' : 'Active',
    });
    setSelectedId(String(id));
    closeEditor();
    feedback.success(`Account ${existing ? 'updated' : 'created'}`);
  };

  const balance = selected ? Number(String(selected.code).replace(/\D/g, '')) * 13 : 0;
  const editing = editor && editor !== 'new' ? editor : null;
  const EditorModal = editing ? EditModal : CreateModal;

  return (
    <MotionSurface page>
      <PageHeader
        title="Chart of accounts"
        group="Accounting"
        description="Structure financial reporting with a clear hierarchy of group and posting accounts."
        action={<Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>New account</Button>}
      />
      <KpiStrip items={[
        { label: 'Total accounts', value: rows.length, hint: 'groups + posting ledgers' },
        { label: 'Posting accounts', value: rows.filter((row) => !isGroupAccount(row)).length, hint: 'transaction-ready' },
        { label: 'Group accounts', value: rows.filter(isGroupAccount).length, hint: 'reporting hierarchy' },
        { label: 'Inactive', value: rows.filter((row) => row.status === 'Inactive').length, hint: 'not available for posting' },
      ]} />

      <div className="coa-workspace">
        <aside className="panel coa-browser">
          <div className="coa-browser-head">
            <div><span className="coa-eyebrow">Account structure</span><h2>Ledger hierarchy</h2></div>
            <Segmented size="small" value={view} onChange={(next) => setView(next as 'tree' | 'list')} options={[
              { value: 'tree', icon: <BranchesOutlined />, label: 'Tree' },
              { value: 'list', icon: <BarsOutlined />, label: 'List' },
            ]} />
          </div>
          <Input.Search allowClear value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search account or code…" className="coa-search" />
          {view === 'tree' ? (
            <Tree blockNode defaultExpandAll selectedKeys={[selectedId]} treeData={treeData} onSelect={(keys) => {
              const key = String(keys[0] ?? '');
              if (!key.startsWith('type-')) setSelectedId(key);
            }} />
          ) : (
            <div className="coa-list">
              {filtered.map((row) => (
                <button type="button" key={row.id} className={`coa-list-row ${row.id === selectedId ? 'selected' : ''}`} onClick={() => setSelectedId(row.id)}>
                  <span className="coa-type-icon">{typeIcon[row.type as keyof typeof typeIcon]}</span>
                  <span className="coa-list-main"><strong>{row.name}</strong><small>{row.code} · {row.type}</small></span>
                  <SemanticStatus value={String(row.status)} />
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="panel coa-detail">
          {selected ? (
            <>
              <div className="coa-detail-head">
                <div className="coa-account-identity">
                  <div className="coa-account-icon">{typeIcon[selected.type as keyof typeof typeIcon]}</div>
                  <div>
                    <div className="coa-account-meta"><span>{selected.code}</span><span>•</span><span>{selected.type}</span><span>•</span><span>{isGroupAccount(selected) ? 'Group account' : 'Posting account'}</span></div>
                    <h2>{selected.name}</h2>
                    <p>{selected.parent ? `Under ${selected.parent}` : 'Top-level account'}</p>
                  </div>
                </div>
                <SemanticStatus value={String(selected.status)} />
              </div>
              <div className="coa-command-bar">
                <Tooltip title="View ledger"><Button aria-label="View ledger" icon={<FileSearchOutlined />} onClick={() => feedback.success(`Opening ledger for ${selected.name}`)} /></Tooltip>
                <Tooltip title="Add child account"><Button aria-label="Add child account" icon={<PlusOutlined />} onClick={() => openEditor(undefined, selected)} /></Tooltip>
                <Tooltip title="Edit account"><Button aria-label="Edit account" icon={<EditOutlined />} onClick={() => openEditor(selected)} /></Tooltip>
                <ConfirmActionPopover title="Deactivate account" description="The account remains in the hierarchy and history but cannot be selected for new postings." confirmLabel="Deactivate" danger onConfirm={() => workspace.save('chart-of-accounts', { ...selected, status: 'Inactive' })}>
                  <Tooltip title="Deactivate"><Button aria-label="Deactivate account" danger icon={<StopOutlined />} disabled={selected.status === 'Inactive'} /></Tooltip>
                </ConfirmActionPopover>
              </div>
              <div className="coa-balance-card"><div><span>Current balance</span><strong>{formatMoney(balance, workspace.org.currency)}</strong><small>Demo balance from the workspace adapter</small></div><div className="coa-balance-icon"><WalletOutlined /></div></div>
              <div className="coa-detail-grid">
                <div className="coa-info-card"><span>Posting mode</span><strong>{isGroupAccount(selected) ? 'Group account' : 'Posting account'}</strong><small>{isGroupAccount(selected) ? 'Organizes child accounts for reporting.' : 'Accepts journal postings.'}</small></div>
                <div className="coa-info-card"><span>Reconciliation</span><strong>{allowReconciliation(selected) ? 'Allowed' : 'Not enabled'}</strong><small>{allowReconciliation(selected) ? 'Suitable for open-item matching.' : 'Standard ledger behavior.'}</small></div>
                <div className="coa-info-card"><span>Entries this month</span><strong>18</strong><small>Illustrative activity</small></div>
              </div>
              <div className="coa-section">
                <div className="coa-section-head"><div><span className="coa-eyebrow">Configuration</span><h3>Account properties</h3></div></div>
                <Descriptions column={2} items={[
                  { key: 'code', label: 'Account code', children: selected.code },
                  { key: 'type', label: 'Account type', children: selected.type },
                  { key: 'parent', label: 'Parent', children: selected.parent || 'Root account' },
                  { key: 'status', label: 'Status', children: <SemanticStatus value={String(selected.status)} /> },
                ]} />
              </div>
            </>
          ) : (
            <div className="coa-empty"><FolderOpenOutlined /><Typography.Title level={4}>Select an account</Typography.Title><Typography.Text type="secondary">Choose an account from the hierarchy to inspect its configuration and ledger context.</Typography.Text></div>
          )}
        </section>
      </div>

      <EditorModal
        open={editor !== null}
        title={editing ? 'Edit account' : 'New account'}
        description="Keep account codes predictable and use group accounts only for hierarchy—not for postings."
        icon={<BookOutlined />}
        width={680}
        submitLabel={editing ? 'Save account' : 'Create account'}
        onCancel={closeEditor}
        onSubmit={() => void saveAccount()}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <div className="form-grid">
            <Form.Item name="name" label="Account name" rules={[{ required: true, whitespace: true, message: 'Account name is required' }]}><Input placeholder="e.g. Main bank account" /></Form.Item>
            <Form.Item name="code" label="Account code" rules={[{ required: true, whitespace: true, message: 'Account code is required' }]}><Input placeholder="e.g. 1110" /></Form.Item>
            <Form.Item name="type" label="Account type" rules={[{ required: true }]}><Select options={accountTypes.map((value) => ({ value, label: value }))} /></Form.Item>
            <Form.Item name="parent" label="Parent account"><Select allowClear showSearch placeholder="Optional" options={rows.filter((row) => row.id !== editing?.id).map((row) => ({ value: row.name, label: `${row.code} · ${row.name}` }))} /></Form.Item>
          </div>
          <div className="form-switch-list">
            <div className="form-switch-row"><div><strong>Group account</strong><span>Use only to organize child accounts.</span></div><Form.Item name="isGroup" valuePropName="checked" noStyle><Switch /></Form.Item></div>
            <div className="form-switch-row"><div><strong>Allow reconciliation</strong><span>Enable open-item matching for this ledger.</span></div><Form.Item name="reconcile" valuePropName="checked" noStyle><Switch /></Form.Item></div>
            <div className="form-switch-row"><div><strong>Active</strong><span>Available for selection in financial documents.</span></div><Form.Item name="active" valuePropName="checked" noStyle><Switch /></Form.Item></div>
          </div>
        </Form>
      </EditorModal>
    </MotionSurface>
  );
}
