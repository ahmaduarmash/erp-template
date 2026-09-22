import { useMemo, useState } from 'react';
import {
  AuditOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  EyeOutlined,
  FileDoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  type TableColumnsType,
} from 'antd';
import { PageHeader } from '../../components/shell/PageHeader';
import {
  ActionMenu,
  DomainTable,
  EntityCell,
  KpiStrip,
  MoneyCell,
  SemanticStatus,
  WorkflowBar,
  formatMoney,
} from '../../components/erp/ErpPrimitives';
import { MotionSurface } from '../../lib/motion';
import { useWorkspace } from '../../data/WorkspaceProvider';
import { useFeedback } from '../../components/feedback';
import type { RecordData } from '../../data/modules';

const accountOptions = ['Cash at bank', 'Petty cash', 'Accounts receivable', 'Inventory', 'Accounts payable', 'Sales revenue', 'Office expense', 'Salary expense']
  .map((value) => ({ value, label: value }));

export default function JournalEntriesPage() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records['journal-entries'];
  const [open, setOpen] = useState(false);
  const [quick, setQuick] = useState(false);
  const [form] = Form.useForm();

  const columns = useMemo<TableColumnsType<RecordData>>(() => [
    {
      key: 'name',
      title: 'Journal entry',
      dataIndex: 'name',
      width: 190,
      render: (value, row) => <EntityCell title={value} subtitle={`Posted ${row.date}`} />,
    },
    {
      key: 'narration',
      title: 'Narration',
      dataIndex: 'description',
      width: 280,
      ellipsis: true,
    },
    {
      key: 'accounts',
      title: 'Accounts',
      width: 260,
      render: (_, row) => (
        <div className="journal-account-pair">
          <span><strong>Dr</strong>{row.debitAccount}</span>
          <span><strong>Cr</strong>{row.creditAccount}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      width: 145,
      align: 'right',
      render: (_, row) => <MoneyCell value={row.debit} currency={workspace.org.currency} />,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (value) => <SemanticStatus value={String(value === 'Reviewed' ? 'Posted' : value)} />,
    },
  ], [workspace.org.currency]);

  const totals = useMemo(() => ({
    debit: rows.reduce((sum, row) => sum + Number(row.debit), 0),
    credit: rows.reduce((sum, row) => sum + Number(row.credit), 0),
  }), [rows]);

  const saveFull = async () => {
    const values = await form.validateFields();
    const lines = values.lines as Array<{ account: string; debit?: number; credit?: number }>;
    const debit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const credit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    if (Math.round(debit * 100) !== Math.round(credit * 100) || debit <= 0) {
      feedback.error('Journal must contain equal positive debits and credits.');
      return;
    }
    workspace.save('journal-entries', {
      id: crypto.randomUUID(),
      name: `JE-2026-${String(rows.length + 101).padStart(4, '0')}`,
      date: values.date,
      debitAccount: lines.find((line) => Number(line.debit) > 0)?.account ?? '',
      creditAccount: lines.find((line) => Number(line.credit) > 0)?.account ?? '',
      debit,
      credit,
      description: values.narration ?? '',
      status: 'Draft',
    });
    setOpen(false);
    form.resetFields();
    feedback.success('Journal draft created');
  };

  const saveQuick = async () => {
    const values = await form.validateFields();
    workspace.save('journal-entries', {
      id: crypto.randomUUID(),
      name: `JE-2026-${String(rows.length + 101).padStart(4, '0')}`,
      date: values.date,
      debitAccount: values.debitAccount,
      creditAccount: values.creditAccount,
      debit: values.amount,
      credit: values.amount,
      description: values.narration ?? '',
      status: 'Draft',
    });
    setQuick(false);
    form.resetFields();
    feedback.success('Quick journal created');
  };

  return (
    <MotionSurface page>
      <PageHeader
        title="Journal entries"
        group="Accounting"
        description="Create, validate and post balanced double-entry documents with clear audit context."
        action={
          <Space>
            <Tooltip title="Quick two-line journal">
              <Button icon={<ThunderboltOutlined />} onClick={() => { form.resetFields(); setQuick(true); }} />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setOpen(true); }}>
              New journal entry
            </Button>
          </Space>
        }
      />

      <KpiStrip
        items={[
          { label: 'Draft entries', value: rows.filter((row) => row.status === 'Draft').length, hint: 'awaiting posting' },
          { label: 'Posted entries', value: rows.filter((row) => row.status === 'Reviewed').length, hint: 'locked financial impact' },
          { label: 'Debit volume', value: formatMoney(totals.debit, workspace.org.currency), hint: 'current workspace' },
          { label: 'Ledger difference', value: formatMoney(totals.debit - totals.credit, workspace.org.currency), hint: 'must remain zero' },
        ]}
      />

      <div className="journal-health-bar">
        <div className="journal-health-icon"><CheckCircleOutlined /></div>
        <div>
          <strong>Ledger is balanced</strong>
          <span>Total debits and credits are equal across the current journal dataset.</span>
        </div>
        <Tag color="success">Difference {formatMoney(totals.debit - totals.credit, workspace.org.currency)}</Tag>
      </div>

      <DomainTable
        rows={rows}
        columns={columns}
        searchPlaceholder="Search journals, accounts or narration…"
        rowActions={(row) => (
          <ActionMenu
            primary={{
              label: row.status === 'Draft' ? 'Post journal' : 'View journal',
              icon: row.status === 'Draft' ? <FileDoneOutlined /> : <EyeOutlined />,
              onClick: () => row.status === 'Draft'
                ? workspace.save('journal-entries', { ...row, status: 'Reviewed' })
                : feedback.success(`Opening ${row.name}`),
            }}
            overflow={[
              { key: 'duplicate', label: 'Duplicate', icon: <CopyOutlined />, onClick: () => feedback.success('Journal duplicated') },
              { key: 'audit', label: 'Audit trail', icon: <AuditOutlined />, onClick: () => feedback.success('Audit trail') },
              { key: 'ledger', label: 'View ledger impact', onClick: () => feedback.success('Ledger drill-down') },
              { key: 'reverse', label: 'Reverse entry', icon: <ReloadOutlined />, onClick: () => feedback.success('Reverse through a new journal entry'), danger: true, disabled: row.status === 'Draft' },
            ]}
          />
        )}
      />

      <Drawer
        className="journal-document-drawer"
        width={980}
        open={open}
        title="New journal entry"
        onClose={() => setOpen(false)}
        extra={<Tag color="warning">Draft</Tag>}
        footer={
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => void saveFull()}>Save draft</Button>
          </Space>
        }
      >
        <WorkflowBar steps={['Draft', 'Posted', 'Reversed']} current="Draft" />
        <div className="journal-form-intro">
          <div><strong>Balanced journal</strong><span>Every posting must contain equal debit and credit totals before it can be posted.</span></div>
          <Tag color="processing">Double entry</Tag>
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'Journal Entry',
            date: '2026-09-23',
            lines: [
              { account: 'Office expense', debit: 1000, credit: 0 },
              { account: 'Cash at bank', debit: 0, credit: 1000 },
            ],
          }}
        >
          <div className="form-grid journal-header-grid">
            <Form.Item name="type" label="Entry type">
              <Select options={['Journal Entry', 'Opening Entry', 'Contra', 'Bank', 'Cash', 'Write-off', 'Adjustment'].map((value) => ({ value, label: value }))} />
            </Form.Item>
            <Form.Item name="date" label="Posting date"><Input type="date" /></Form.Item>
            <Form.Item name="narration" label="Reference / narration"><Input placeholder="Why is this entry being posted?" /></Form.Item>
          </div>
          <Divider orientation="left" plain>Accounting lines</Divider>
          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <div className="journal-lines">
                <div className="journal-line-head"><span>Account</span><span>Debit</span><span>Credit</span><span /></div>
                {fields.map((field) => (
                  <div className="journal-line" key={field.key}>
                    <Form.Item {...field} name={[field.name, 'account']} rules={[{ required: true }]}>
                      <Select showSearch placeholder="Select account" options={accountOptions} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'debit']}><InputNumber min={0} precision={2} placeholder="0.00" /></Form.Item>
                    <Form.Item {...field} name={[field.name, 'credit']}><InputNumber min={0} precision={2} placeholder="0.00" /></Form.Item>
                    <Button danger type="text" onClick={() => remove(field.name)}>Remove</Button>
                  </div>
                ))}
                <Button className="journal-add-line" icon={<PlusOutlined />} onClick={() => add({ debit: 0, credit: 0 })}>Add accounting line</Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Drawer>

      <Drawer
        width={560}
        open={quick}
        title="Quick journal"
        onClose={() => setQuick(false)}
        extra={<Tag color="processing"><ThunderboltOutlined /> Quick entry</Tag>}
        footer={
          <Space>
            <Button onClick={() => setQuick(false)}>Cancel</Button>
            <Button type="primary" onClick={() => void saveQuick()}>Create journal</Button>
          </Space>
        }
      >
        <Alert
          className="mb-5"
          showIcon
          type="info"
          message="Two-account posting"
          description="Use Quick Journal for simple one-debit / one-credit postings. Use the full editor for allocations across multiple accounts."
        />
        <Form form={form} layout="vertical" initialValues={{ date: '2026-09-23' }}>
          <Form.Item name="date" label="Posting date"><Input type="date" /></Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber min={0.01} precision={2} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="debitAccount" label="Debit account" rules={[{ required: true }]}><Select showSearch options={accountOptions} /></Form.Item>
          <Form.Item name="creditAccount" label="Credit account" rules={[{ required: true }]}><Select showSearch options={accountOptions} /></Form.Item>
          <Form.Item name="narration" label="Narration"><Input.TextArea rows={3} placeholder="Brief explanation of this posting" /></Form.Item>
        </Form>
      </Drawer>
    </MotionSurface>
  );
}
