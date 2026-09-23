import { useMemo, useState, type ReactNode } from 'react';
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  ForwardOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Input, Skeleton, Space } from 'antd';
import { AnimatedPopover } from '../../lib/motion/overlays';
import {
  filterWorkflowDecisions,
  type WorkflowAuditEvent,
  type WorkflowDecisionKind,
} from '../../workflow/model';
import { ConfirmActionPopover } from '../overlays';
import { EmptyState, IconChip, StatusPill } from '../primitives';

export type { WorkflowAuditEvent, WorkflowDecisionKind } from '../../workflow/model';

export type WorkflowStepState = 'completed' | 'current' | 'waiting' | 'rejected' | 'skipped';

export type WorkflowStep = {
  id: string;
  label: string;
  actor?: string;
  role?: string;
  at?: string;
  note?: string;
  state: WorkflowStepState;
};

export type WorkflowDecision = {
  key: string;
  kind: WorkflowDecisionKind;
  label: string;
  permission?: string;
  requiresReason?: boolean;
  confirm?: boolean;
  description?: string;
  nextStatus?: string;
};

export function visibleWorkflowDecisions(
  decisions: WorkflowDecision[],
  can: (permission?: string) => boolean,
) {
  return filterWorkflowDecisions(decisions, can);
}

function stateIcon(state: WorkflowStepState) {
  if (state === 'completed') return <CheckCircleFilled />;
  if (state === 'rejected') return <CloseCircleFilled />;
  if (state === 'skipped') return <StopOutlined />;
  return <ClockCircleOutlined />;
}

function stateTone(state: WorkflowStepState): 'success' | 'danger' | 'warning' | 'neutral' {
  if (state === 'completed') return 'success';
  if (state === 'rejected') return 'danger';
  if (state === 'current') return 'warning';
  return 'neutral';
}

function actionTone(action: WorkflowDecisionKind): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (action === 'approve' || action === 'settle') return 'success';
  if (action === 'reject' || action === 'return') return 'danger';
  if (action === 'forward') return 'info';
  if (action === 'claim') return 'warning';
  return 'neutral';
}

function actionLabel(action: WorkflowDecisionKind) {
  const labels: Record<WorkflowDecisionKind, string> = {
    submit: 'Submitted',
    approve: 'Approved',
    reject: 'Rejected',
    forward: 'Forwarded',
    claim: 'Pulled to desk',
    return: 'Returned',
    settle: 'Settled',
  };
  return labels[action];
}

export function WorkflowTimeline({
  steps,
  loading,
  error,
}: {
  steps: WorkflowStep[];
  loading?: boolean;
  error?: ReactNode;
}) {
  return (
    <section className="workflow-timeline" aria-label="Approval route">
      <header className="workflow-section-heading">
        <div>
          <strong>Approval route</strong>
          <span>Routing and current responsibility</span>
        </div>
      </header>
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} title={false} />
      ) : error ? (
        <Alert type="error" showIcon message="Workflow route unavailable" description={error} />
      ) : !steps.length ? (
        <EmptyState
          icon={<ClockCircleOutlined />}
          title="No approval route"
          description="This record does not currently have a routed workflow."
          tone="neutral"
        />
      ) : (
        <ol className="workflow-route-list">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`workflow-route-step is-${step.state}`}
              aria-current={step.state === 'current' ? 'step' : undefined}
            >
              <div className="workflow-route-marker" aria-hidden="true">
                <IconChip icon={stateIcon(step.state)} tone={stateTone(step.state)} size="sm" />
              </div>
              <div className="workflow-route-content">
                <div className="workflow-route-title-row">
                  <strong>{step.label}</strong>
                  <StatusPill tone={stateTone(step.state)}>
                    {step.state === 'current' ? 'Awaiting action' : step.state}
                  </StatusPill>
                </div>
                {step.actor || step.role ? (
                  <div className="workflow-route-actor">
                    <UserOutlined aria-hidden="true" />
                    <span>{[step.actor, step.role].filter(Boolean).join(' · ')}</span>
                  </div>
                ) : null}
                {step.at ? <time>{step.at}</time> : null}
                {step.note ? <p>{step.note}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function WorkflowAuditTrail({
  entries,
  loading,
  error,
}: {
  entries: WorkflowAuditEvent[];
  loading?: boolean;
  error?: ReactNode;
}) {
  const ordered = useMemo(
    () => [...entries].sort((a, b) => a.at.localeCompare(b.at)),
    [entries],
  );
  return (
    <section className="workflow-audit" aria-label="Decision history">
      <header className="workflow-section-heading">
        <div>
          <strong>Decision history</strong>
          <span>Recorded actors, decisions and reasons</span>
        </div>
      </header>
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      ) : error ? (
        <Alert type="error" showIcon message="Decision history unavailable" description={error} />
      ) : !ordered.length ? (
        <EmptyState
          icon={<ClockCircleOutlined />}
          title="No recorded decisions"
          description="Decisions will appear here as the record moves through its route."
          tone="neutral"
        />
      ) : (
        <ol className="workflow-audit-list">
          {ordered.map((entry) => (
            <li key={entry.id} className="workflow-audit-entry">
              <div className="workflow-audit-heading">
                <StatusPill tone={actionTone(entry.action)}>{actionLabel(entry.action)}</StatusPill>
                <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
              </div>
              <strong>{entry.actor}</strong>
              <span>{entry.role ?? 'Workflow participant'}</span>
              {entry.reason ? <p>{entry.reason}</p> : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function WorkflowSummary({
  status,
  currentStage,
  owner,
  reference,
  meta,
}: {
  status: ReactNode;
  currentStage: ReactNode;
  owner?: ReactNode;
  reference?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <section className="workflow-summary" aria-label="Workflow summary">
      <div><span>Status</span><strong>{status}</strong></div>
      <div><span>Current stage</span><strong>{currentStage}</strong></div>
      {owner ? <div><span>Current owner</span><strong>{owner}</strong></div> : null}
      {reference ? <div><span>Reference</span><strong>{reference}</strong></div> : null}
      {meta ? <div className="workflow-summary-wide">{meta}</div> : null}
    </section>
  );
}

function ReasonDecisionButton({
  decision,
  busy,
  onDecision,
}: {
  decision: WorkflowDecision;
  busy?: string | null;
  onDecision: (decision: WorkflowDecision, reason?: string) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const danger = decision.kind === 'reject' || decision.kind === 'return';
  return (
    <AnimatedPopover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setReason('');
      }}
      trigger="click"
      placement="topRight"
      content={
        <div className="workflow-reason-popover" role="group" aria-label={`${decision.label} reason`}>
          <strong>{decision.label}</strong>
          <p>{decision.description ?? 'Add a reason. It will be recorded in the audit trail.'}</p>
          <Input.TextArea
            autoFocus
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason (required)"
            rows={3}
            maxLength={500}
            showCount
          />
          <div className="workflow-reason-actions">
            <Button size="small" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              size="small"
              type="primary"
              danger={danger}
              disabled={!reason.trim()}
              loading={busy === decision.key}
              onClick={async () => {
                await onDecision(decision, reason.trim());
                setOpen(false);
                setReason('');
              }}
            >
              Confirm {decision.label.toLowerCase()}
            </Button>
          </div>
        </div>
      }
    >
      <Button danger={danger} loading={busy === decision.key}>{decision.label}</Button>
    </AnimatedPopover>
  );
}

export function WorkflowDecisionBar({
  decisions,
  can,
  busy,
  onDecision,
  emptyLabel = 'No decisions are available at the current stage.',
}: {
  decisions: WorkflowDecision[];
  can: (permission?: string) => boolean;
  busy?: string | null;
  onDecision: (decision: WorkflowDecision, reason?: string) => void | Promise<void>;
  emptyLabel?: ReactNode;
}) {
  const visible = useMemo(() => visibleWorkflowDecisions(decisions, can), [can, decisions]);

  if (!visible.length) return <span className="workflow-no-actions">{emptyLabel}</span>;

  const buttons = visible.map((decision) => {
    const danger = decision.kind === 'reject' || decision.kind === 'return';
    if (decision.requiresReason) {
      return (
        <ReasonDecisionButton
          key={decision.key}
          decision={decision}
          busy={busy}
          onDecision={onDecision}
        />
      );
    }

    const button = (
      <Button
        key={decision.key}
        type={decision.kind === 'approve' || decision.kind === 'claim' || decision.kind === 'settle' ? 'primary' : 'default'}
        danger={danger}
        loading={busy === decision.key}
        icon={decision.kind === 'forward' ? <ForwardOutlined /> : undefined}
        onClick={decision.confirm ? undefined : () => void onDecision(decision)}
      >
        {decision.label}
      </Button>
    );

    if (!decision.confirm) return button;
    return (
      <ConfirmActionPopover
        key={decision.key}
        title={decision.label}
        description={decision.description}
        confirmLabel={decision.label}
        danger={danger}
        onConfirm={() => onDecision(decision)}
      >
        {button}
      </ConfirmActionPopover>
    );
  });

  return <Space wrap>{buttons}</Space>;
}
