import { useMemo, useState, type ReactNode } from 'react';
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  ForwardOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Input, Space } from 'antd';
import { ConfirmActionPopover } from '../overlays';
import { IconChip, StatusPill } from '../primitives';

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

export type WorkflowDecisionKind = 'approve' | 'reject' | 'forward' | 'claim' | 'return';

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
  return decisions.filter((decision) => can(decision.permission));
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

export function WorkflowTimeline({ steps }: { steps: WorkflowStep[] }) {
  return (
    <section className="workflow-timeline" aria-label="Approval route">
      <header className="workflow-section-heading">
        <div>
          <strong>Approval route</strong>
          <span>Routing and decision history</span>
        </div>
      </header>
      <ol className="workflow-route-list">
        {steps.map((step) => (
          <li key={step.id} className={`workflow-route-step is-${step.state}`} aria-current={step.state === 'current' ? 'step' : undefined}>
            <div className="workflow-route-marker" aria-hidden="true">
              <IconChip icon={stateIcon(step.state)} tone={stateTone(step.state)} size="sm" />
            </div>
            <div className="workflow-route-content">
              <div className="workflow-route-title-row">
                <strong>{step.label}</strong>
                <StatusPill tone={stateTone(step.state)}>{step.state === 'current' ? 'Awaiting action' : step.state}</StatusPill>
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

export function WorkflowDecisionBar({
  decisions,
  can,
  busy,
  onDecision,
}: {
  decisions: WorkflowDecision[];
  can: (permission?: string) => boolean;
  busy?: string | null;
  onDecision: (decision: WorkflowDecision, reason?: string) => void | Promise<void>;
}) {
  const visible = useMemo(() => visibleWorkflowDecisions(decisions, can), [can, decisions]);
  const [reasonDecision, setReasonDecision] = useState<WorkflowDecision | null>(null);
  const [reason, setReason] = useState('');

  if (!visible.length) return <span className="workflow-no-actions">No decisions available for your access level.</span>;

  const execute = async (decision: WorkflowDecision) => {
    if (decision.requiresReason) {
      setReasonDecision(decision);
      return;
    }
    await onDecision(decision);
  };

  const buttons = visible.map((decision) => {
    const danger = decision.kind === 'reject' || decision.kind === 'return';
    const button = (
      <Button
        key={decision.key}
        type={decision.kind === 'approve' || decision.kind === 'claim' ? 'primary' : 'default'}
        danger={danger}
        loading={busy === decision.key}
        icon={decision.kind === 'forward' ? <ForwardOutlined /> : undefined}
        onClick={() => void execute(decision)}
      >
        {decision.label}
      </Button>
    );

    if (!decision.confirm || decision.requiresReason) return button;
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

  return (
    <>
      <Space wrap>{buttons}</Space>
      {reasonDecision ? (
        <div className="workflow-reason-panel" role="group" aria-label={`${reasonDecision.label} reason`}>
          <strong>{reasonDecision.label}</strong>
          <p>{reasonDecision.description ?? 'Add a reason. This will be recorded in the decision trail.'}</p>
          <Input.TextArea
            autoFocus
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason (required)"
            rows={3}
            maxLength={500}
            showCount
          />
          <Space>
            <Button onClick={() => { setReasonDecision(null); setReason(''); }}>Cancel</Button>
            <Button
              type="primary"
              danger={reasonDecision.kind === 'reject' || reasonDecision.kind === 'return'}
              disabled={!reason.trim()}
              loading={busy === reasonDecision.key}
              onClick={async () => {
                await onDecision(reasonDecision, reason.trim());
                setReasonDecision(null);
                setReason('');
              }}
            >
              Confirm {reasonDecision.label.toLowerCase()}
            </Button>
          </Space>
        </div>
      ) : null}
    </>
  );
}
