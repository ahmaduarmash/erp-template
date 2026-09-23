export type WorkflowStatus =
  | 'draft'
  | 'pending'
  | 'forwarded'
  | 'approved'
  | 'rejected'
  | 'settled';

export type WorkflowDecisionKind =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'forward'
  | 'claim'
  | 'return'
  | 'settle';

export interface WorkflowAuditEvent {
  id: string;
  recordId: string;
  actor: string;
  role?: string;
  action: WorkflowDecisionKind;
  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;
  reason?: string;
  at: string;
  owner?: string;
}

export type PermissionBoundDecision = {
  permission?: string;
};

export const workflowStatuses = ['draft', 'pending', 'forwarded', 'approved', 'rejected', 'settled'] as const;
export const workflowDecisionKinds = ['submit', 'approve', 'reject', 'forward', 'claim', 'return', 'settle'] as const;

const allowedTransitions: Record<WorkflowStatus, Partial<Record<WorkflowDecisionKind, WorkflowStatus>>> = {
  draft: { submit: 'pending' },
  pending: {
    claim: 'pending',
    forward: 'forwarded',
    approve: 'approved',
    reject: 'rejected',
  },
  forwarded: {
    claim: 'forwarded',
    return: 'pending',
    approve: 'approved',
    reject: 'rejected',
  },
  approved: { settle: 'settled' },
  rejected: {},
  settled: {},
};

const statusAliases: Record<string, WorkflowStatus> = {
  draft: 'draft',
  new: 'draft',
  pending: 'pending',
  submitted: 'pending',
  review: 'pending',
  'in review': 'pending',
  forwarded: 'forwarded',
  escalated: 'forwarded',
  approved: 'approved',
  accepted: 'approved',
  rejected: 'rejected',
  declined: 'rejected',
  settled: 'settled',
  completed: 'settled',
  closed: 'settled',
};

export function resolveWorkflowStatus(value: unknown, fallback: WorkflowStatus = 'pending'): WorkflowStatus {
  const normalized = String(value ?? '').trim().toLowerCase();
  return statusAliases[normalized] ?? fallback;
}

export function formatWorkflowStatus(status: WorkflowStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function allowedWorkflowDecisions(status: WorkflowStatus): WorkflowDecisionKind[] {
  return Object.keys(allowedTransitions[status]) as WorkflowDecisionKind[];
}

export function transitionWorkflowStatus(
  status: WorkflowStatus,
  decision: WorkflowDecisionKind,
): WorkflowStatus | null {
  return allowedTransitions[status][decision] ?? null;
}

export function filterWorkflowDecisions<T extends PermissionBoundDecision>(
  decisions: T[],
  can: (permission?: string) => boolean,
) {
  return decisions.filter((decision) => can(decision.permission));
}

export function parseWorkflowAuditHistory(value: unknown): WorkflowAuditEvent[] {
  if (Array.isArray(value)) return value.filter(isWorkflowAuditEvent);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isWorkflowAuditEvent) : [];
  } catch {
    return [];
  }
}

export function serializeWorkflowAuditHistory(events: WorkflowAuditEvent[]) {
  return JSON.stringify(events);
}

function isWorkflowAuditEvent(value: unknown): value is WorkflowAuditEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<WorkflowAuditEvent>;
  return (
    typeof event.id === 'string' &&
    typeof event.recordId === 'string' &&
    typeof event.actor === 'string' &&
    workflowDecisionKinds.includes(event.action as WorkflowDecisionKind) &&
    workflowStatuses.includes(event.fromStatus as WorkflowStatus) &&
    workflowStatuses.includes(event.toStatus as WorkflowStatus) &&
    typeof event.at === 'string'
  );
}
