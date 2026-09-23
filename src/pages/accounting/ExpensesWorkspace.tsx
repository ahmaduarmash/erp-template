import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Select,
  type TableColumnsType,
} from 'antd';
import { FileDoneOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/AuthProvider';
import { useFeedback } from '../../components/feedback';
import { ApprovalDrawer, CreateModal } from '../../components/overlays';
import { IconChip, StatusPill, type SemanticTone } from '../../components/primitives';
import {
  WorkflowAuditTrail,
  WorkflowDecisionBar,
  WorkflowSummary,
  WorkflowTimeline,
  type WorkflowDecision,
  type WorkflowStep,
} from '../../components/workflow';
import { PageHeader } from '../../components/shell/PageHeader';
import {
  ActionMenu,
  DomainTable,
  EntityCell,
  KpiStrip,
  MoneyCell,
  QuickViews,
  formatMoney,
} from '../../components/erp/ErpPrimitives';
import { useWorkspace } from '../../data/WorkspaceProvider';
import type { RecordData } from '../../data/modules';
import { MotionSurface } from '../../lib/motion';
import {
  formatWorkflowStatus,
  parseWorkflowAuditHistory,
  resolveWorkflowStatus,
  serializeWorkflowAuditHistory,
  transitionWorkflowStatus,
  type WorkflowAuditEvent,
  type WorkflowStatus,
} from '../../workflow/model';

function statusTone(status: WorkflowStatus): SemanticTone {
  if (status === 'approved' || status === 'settled') return 'success';
  if (status === 'rejected') return 'danger';
  if (status === 'forwarded') return 'info';
  if (status === 'pending') return 'warning';
  return 'neutral';
}

function submittedAt(row: RecordData) {
  const value = String(row.date ?? '');
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T09:00:00` : new Date().toISOString();
}

function currentOwner(row: RecordData, status: WorkflowStatus) {
  if (row.workflowOwner) return String(row.workflowOwner);
  if (status === 'forwarded') return 'Finance controller';
  if (status === 'approved') return 'Accounts payable';
  if (status === 'settled') return 'Completed';
  if (status === 'rejected') return String(row.owner ?? 'Requester');
  return 'Finance review queue';
}

function stageLabel(status: WorkflowStatus) {
  if (status === 'draft') return 'Draft';
  if (status === 'pending') return 'Finance review';
  if (status === 'forwarded') return 'Forwarded review';
  if (status === 'approved') return 'Awaiting settlement';
  if (status === 'rejected') return 'Closed — rejected';
  return 'Settled';
}

function syntheticHistory(row: RecordData): WorkflowAuditEvent[] {
  const persisted = parseWorkflowAuditHistory(row.workflowHistory);
  if (persisted.length) return persisted;

  const recordId = String(row.id);
  const status = resolveWorkflowStatus(row.status);
  const base: WorkflowAuditEvent = {
    id: `${recordId}-submitted`,
    recordId,
    actor: String(row.owner ?? 'Requester'),
    role: 'Requester',
    action: 'submit',
    fromStatus: 'draft',
    toStatus: 'pending',
    at: submittedAt(row),
    owner: 'Finance review queue',
  };
  if (status === 'pending') return [base];

  const decisionByStatus: Partial<Record<WorkflowStatus, WorkflowAuditEvent['action']>> = {
    forwarded: 'forward',
    approved: 'approve',
    rejected: 'reject',
    settled: 'settle',
  };
  const action = decisionByStatus[status];
  if (!action) return [base];
  const fromStatus: WorkflowStatus = status === 'settled' ? 'approved' : 'pending';
  return [
    base,
    {
      id: `${recordId}-${action}`,
      recordId,
      actor: 'Finance reviewer',
      role: 'Finance',
      action,
      fromStatus,
      toStatus: status,
      at: `${String(row.date ?? '2026-09-23')}T11:00:00`,
      owner: currentOwner(row, status),
      reason: status === 'rejected' ? 'Outside the current expense policy.' : undefined,
    },
  ];
}

function buildSteps(row: RecordData): WorkflowStep[] {
  const status = resolveWorkflowStatus(row.status);
  const owner = currentOwner(row, status);
  const reviewState: WorkflowStep['state'] =
    status === 'rejected'
      ? 'rejected'
      : status === 'approved' || status === 'settled'
        ? 'completed'
        : 'current';
  const settlementState: WorkflowStep['state'] =
    status === 'settled' ? 'completed' : status === 'approved' ? 'current' : 'waiting';

  return [
    {
      id: 'submitted',
      label: 'Expense submitted',
      actor: String(row.owner ?? 'Requester'),
      role: 'Requester',
      at: String(row.date ?? ''),
      note: 'Expense details and supporting evidence were submitted for review.',
      state: 'completed',
    },
    {
      id: 'review',
      label: status === 'forwarded' ? 'Finance review · forwarded' : 'Finance review',
      actor: owner,
      role: status === 'forwarded' ? 'Finance controller' : 'Approver',
      note:
        status === 'rejected'
          ? 'The request was rejected and the route is closed.'
          : 'Review the business purpose, amount and attached evidence before deciding.',
      state: reviewState,
    },
    {
      id: 'settlement',
      label: 'Settlement',
      actor: status === 'approved' || status === 'settled' ? 'Accounts payable' : undefined,
      role: 'Finance operations',
      note: 'Approved expenses move to settlement after review.',
      state: settlementState,
    },
  ];
}

function decisionsFor(status: WorkflowStatus, claimedByCurrentUser: boolean): WorkflowDecision[] {
  if (status === 'pending') {
    return [
      ...(!claimedByCurrentUser
        ? [{
            key: 'claim',
            kind: 'claim' as const,
            label: 'Pull to my desk',
            permission: 'accounting.expenses.claim',
            confirm: true,
            description: 'Assign this review to yourself. The ownership change is recorded in the trail.',
          }]
        : []),
      {
        key: 'approve',
        kind: 'approve',
        label: 'Approve',
        permission: 'accounting.expenses.approve',
        confirm: true,
        description: 'Approve this expense and send it to settlement.',
      },
      {
        key: 'forward',
        kind: 'forward',
        label: 'Forward',
        permission: 'accounting.expenses.forward',
        confirm: true,
        description: 'Forward this review to the finance controller.',
      },
      {
        key: 'reject',
        kind: 'reject',
        label: 'Reject',
        permission: 'accounting.expenses.reject',
        requiresReason: true,
        description: 'A rejection reason is required and will be recorded in the audit trail.',
      },
    ];
  }
  if (status === 'forwarded') {
    return [
      ...(!claimedByCurrentUser
        ? [{
            key: 'claim',
            kind: 'claim' as const,
            label: 'Pull to my desk',
            permission: 'accounting.expenses.claim',
            confirm: true,
            description: 'Assign the forwarded review to yourself.',
          }]
        : []),
      {
        key: 'approve',
        kind: 'approve',
        label: 'Approve',
        permission: 'accounting.expenses.approve',
        confirm: true,
        description: 'Approve the forwarded expense and send it to settlement.',
      },
      {
        key: 'return',
        kind: 'return',
        label: 'Return for review',
        permission: 'accounting.expenses.forward',
        requiresReason: true,
        description: 'Explain why this review should return to the finance queue.',
      },
      {
        key: 'reject',
        kind: 'reject',
        label: 'Reject',
        permission: 'accounting.expenses.reject',
        requiresReason: true,
        description: 'A rejection reason is required and will be recorded in the audit trail.',
      },
    ];
  }
  if (status === 'approved') {
    return [
      {
        key: 'settle',
        kind: 'settle',
        label: 'Mark settled',
        permission: 'accounting.expenses.settle',
        confirm: true,
        description: 'Mark this approved expense as settled. This completes the workflow.',
      },
    ];
  }
  return [];
}

export default function ExpensesWorkspace() {
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const auth = useAuth();
  const allRows = workspace.records.expenses;
  const [view, setView] = useState('queue');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const rows = useMemo(
    () =>
      allRows.filter((row) => {
        const status = resolveWorkflowStatus(row.status);
        if (view === 'all') return true;
        if (view === 'mine') return row.owner === workspace.profile.name;
        if (view === 'queue') return status === 'pending' || status === 'forwarded';
        return status === view;
      }),
    [allRows, view, workspace.profile.name],
  );

  const selected = selectedId ? allRows.find((row) => row.id === selectedId) ?? null : null;
  const selectedStatus = selected ? resolveWorkflowStatus(selected.status) : 'pending';
  const selectedOwner = selected ? currentOwner(selected, selectedStatus) : '';
  const selectedHistory = selected ? syntheticHistory(selected) : [];
  const decisions = selected
    ? decisionsFor(selectedStatus, selectedOwner === workspace.profile.name)
    : [];

  const columns = useMemo<TableColumnsType<RecordData>>(
    () => [
      {
        key: 'name',
        title: 'Expense',
        dataIndex: 'name',
        width: 250,
        render: (value, row) => (
          <EntityCell
            title={value}
            subtitle={row.category}
            onClick={() => setSelectedId(String(row.id))}
          />
        ),
      },
      { key: 'owner', title: 'Submitted by', dataIndex: 'owner', width: 180 },
      { key: 'date', title: 'Date', dataIndex: 'date', width: 130 },
      {
        key: 'amount',
        title: 'Amount',
        dataIndex: 'amount',
        width: 140,
        align: 'right',
        render: (value) => <MoneyCell value={value} currency={workspace.org.currency} />,
      },
      {
        key: 'stage',
        title: 'Current stage',
        width: 180,
        render: (_, row) => stageLabel(resolveWorkflowStatus(row.status)),
      },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        width: 130,
        render: (value) => {
          const status = resolveWorkflowStatus(value);
          return <StatusPill tone={statusTone(status)}>{formatWorkflowStatus(status)}</StatusPill>;
        },
      },
    ],
    [workspace.org.currency],
  );

  const createExpense = async () => {
    const values = await form.validateFields();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const history: WorkflowAuditEvent[] = [
      {
        id: crypto.randomUUID(),
        recordId: id,
        actor: workspace.profile.name,
        role: 'Requester',
        action: 'submit',
        fromStatus: 'draft',
        toStatus: 'pending',
        at: now,
        owner: 'Finance review queue',
      },
    ];
    workspace.save('expenses', {
      id,
      name: values.name,
      category: values.category,
      amount: values.amount,
      date: values.date,
      owner: workspace.profile.name,
      status: 'Pending',
      workflowOwner: 'Finance review queue',
      workflowHistory: serializeWorkflowAuditHistory(history),
    });
    form.resetFields();
    setCreateOpen(false);
    feedback.success('Expense submitted for review');
  };

  const decide = async (decision: WorkflowDecision, reason?: string) => {
    if (!selected) return;
    const fromStatus = resolveWorkflowStatus(selected.status);
    const toStatus = transitionWorkflowStatus(fromStatus, decision.kind);
    if (!toStatus) {
      feedback.error('That decision is not available at the current workflow stage.');
      return;
    }
    setBusy(decision.key);
    try {
      let nextOwner = selectedOwner;
      if (decision.kind === 'claim') nextOwner = workspace.profile.name;
      if (decision.kind === 'forward') nextOwner = 'Finance controller';
      if (decision.kind === 'return') nextOwner = 'Finance review queue';
      if (decision.kind === 'approve') nextOwner = 'Accounts payable';
      if (decision.kind === 'reject') nextOwner = String(selected.owner ?? 'Requester');
      if (decision.kind === 'settle') nextOwner = 'Completed';

      const event: WorkflowAuditEvent = {
        id: crypto.randomUUID(),
        recordId: String(selected.id),
        actor: auth.user?.name ?? workspace.profile.name,
        role: auth.user?.roles[0] ?? workspace.profile.title,
        action: decision.kind,
        fromStatus,
        toStatus,
        reason: reason?.trim() || undefined,
        at: new Date().toISOString(),
        owner: nextOwner,
      };
      workspace.save('expenses', {
        ...selected,
        status: formatWorkflowStatus(toStatus),
        workflowOwner: nextOwner,
        workflowHistory: serializeWorkflowAuditHistory([...selectedHistory, event]),
      });
      feedback.success(`${decision.label} recorded`);
    } finally {
      setBusy(null);
    }
  };

  const counts = {
    queue: allRows.filter((row) => ['pending', 'forwarded'].includes(resolveWorkflowStatus(row.status))).length,
    approved: allRows.filter((row) => resolveWorkflowStatus(row.status) === 'approved').length,
    rejected: allRows.filter((row) => resolveWorkflowStatus(row.status) === 'rejected').length,
    settled: allRows.filter((row) => resolveWorkflowStatus(row.status) === 'settled').length,
  };

  return (
    <MotionSurface page>
      <PageHeader
        title="Expenses"
        group="Accounting"
        description="Expense submission and approval queue with evidence, routing and auditable decisions."
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.setFieldsValue({ date: new Date().toISOString().slice(0, 10), category: 'Office' });
              setCreateOpen(true);
            }}
          >
            New expense
          </Button>
        }
      />

      <KpiStrip
        items={[
          { label: 'Review queue', value: counts.queue, hint: 'pending or forwarded' },
          { label: 'Approved', value: counts.approved, hint: 'awaiting settlement' },
          { label: 'Rejected', value: counts.rejected, hint: 'closed exceptions' },
          { label: 'Settled', value: counts.settled, hint: 'workflow complete' },
        ]}
      />

      <QuickViews
        value={view}
        onChange={setView}
        items={[
          { value: 'mine', label: 'My expenses' },
          { value: 'queue', label: `Review queue (${counts.queue})` },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'settled', label: 'Settled' },
          { value: 'all', label: 'All' },
        ]}
      />

      <DomainTable
        rows={rows}
        columns={columns}
        searchPlaceholder="Search expenses, submitters or categories…"
        rowActions={(row) => (
          <ActionMenu
            primary={{ label: 'Review', onClick: () => setSelectedId(String(row.id)) }}
            overflow={[
              { key: 'history', label: 'Approval history', onClick: () => setSelectedId(String(row.id)) },
              { key: 'receipt', label: 'View receipt', onClick: () => feedback.success('Receipt preview is an integration point') },
            ]}
          />
        )}
      />

      <CreateModal
        open={createOpen}
        title="New expense"
        description="Submit a small expense request into the approval workflow."
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        onSubmit={() => void createExpense()}
        submitLabel="Submit expense"
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="name" label="Expense title" rules={[{ required: true, whitespace: true }]}>
            <Input placeholder="e.g. Customer site travel" />
          </Form.Item>
          <div className="form-grid">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select options={['Travel', 'Software', 'Utilities', 'Office'].map((value) => ({ value, label: value }))} />
            </Form.Item>
            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
              <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="date" label="Expense date" rules={[{ required: true }]}>
              <Input type="date" />
            </Form.Item>
          </div>
        </Form>
      </CreateModal>

      <ApprovalDrawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? 'Expense review'}
        subtitle={selected ? `${selected.category} · ${selected.date}` : undefined}
        status={
          selected ? (
            <StatusPill tone={statusTone(selectedStatus)}>{formatWorkflowStatus(selectedStatus)}</StatusPill>
          ) : undefined
        }
        leading={<IconChip icon={<FileDoneOutlined />} tone="primary" />}
        meta={
          selected ? (
            <span>
              {formatMoney(selected.amount, workspace.org.currency)} · Submitted by {selected.owner}
            </span>
          ) : undefined
        }
        size="lg"
        actionPanel={
          selected ? (
            <WorkflowDecisionBar
              decisions={decisions}
              can={auth.can}
              busy={busy}
              onDecision={decide}
            />
          ) : undefined
        }
        workflow={
          selected ? (
            <>
              <WorkflowTimeline steps={buildSteps(selected)} />
              <WorkflowAuditTrail entries={selectedHistory} />
            </>
          ) : undefined
        }
      >
        {selected ? (
          <>
            <Descriptions
              column={{ xs: 1, sm: 2 }}
              items={[
                { key: 'amount', label: 'Amount', children: formatMoney(selected.amount, workspace.org.currency) },
                { key: 'category', label: 'Category', children: selected.category },
                { key: 'date', label: 'Expense date', children: selected.date },
                { key: 'submitter', label: 'Submitted by', children: selected.owner },
              ]}
            />
            <Alert
              type="info"
              showIcon
              message="Supporting evidence"
              description="A receipt is attached to this demo request. Production adapters should expose the original file, metadata and evidence checks here."
            />
            <WorkflowSummary
              status={<StatusPill tone={statusTone(selectedStatus)}>{formatWorkflowStatus(selectedStatus)}</StatusPill>}
              currentStage={stageLabel(selectedStatus)}
              owner={selectedOwner}
              reference={selected.id}
              meta={<span>Review the request context before taking a decision. Every workflow action is recorded.</span>}
            />
          </>
        ) : null}
      </ApprovalDrawer>
    </MotionSurface>
  );
}
