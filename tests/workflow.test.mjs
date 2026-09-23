import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  allowedWorkflowDecisions,
  filterWorkflowDecisions,
  parseWorkflowAuditHistory,
  resolveWorkflowStatus,
  serializeWorkflowAuditHistory,
  transitionWorkflowStatus,
} from '../src/workflow/model.ts';

test('Workflow state model normalizes domain statuses and enforces routed transitions', () => {
  assert.equal(resolveWorkflowStatus('Pending'), 'pending');
  assert.equal(resolveWorkflowStatus('In review'), 'pending');
  assert.equal(resolveWorkflowStatus('Forwarded'), 'forwarded');
  assert.equal(transitionWorkflowStatus('pending', 'forward'), 'forwarded');
  assert.equal(transitionWorkflowStatus('forwarded', 'return'), 'pending');
  assert.equal(transitionWorkflowStatus('pending', 'approve'), 'approved');
  assert.equal(transitionWorkflowStatus('approved', 'settle'), 'settled');
  assert.equal(transitionWorkflowStatus('rejected', 'approve'), null);
  assert.deepEqual(allowedWorkflowDecisions('settled'), []);
});

test('Workflow decision visibility is permission-aware without coupling permissions to the UI', () => {
  const decisions = [
    { key: 'approve', permission: 'expense.approve' },
    { key: 'reject', permission: 'expense.reject' },
    { key: 'history' },
  ];
  assert.deepEqual(
    filterWorkflowDecisions(decisions, (permission) => !permission || permission === 'expense.approve').map((item) => item.key),
    ['approve', 'history'],
  );
});

test('Workflow audit history degrades safely when persisted demo data is stale', () => {
  const events = [
    {
      id: 'event-1',
      recordId: 'expense-1',
      actor: 'Alex Morgan',
      action: 'approve',
      fromStatus: 'pending',
      toStatus: 'approved',
      at: '2026-09-23T09:00:00Z',
    },
  ];
  assert.deepEqual(parseWorkflowAuditHistory(serializeWorkflowAuditHistory(events)), events);
  assert.deepEqual(parseWorkflowAuditHistory('{broken'), []);
  assert.deepEqual(parseWorkflowAuditHistory(null), []);
});

test('Shared workflow primitives cover route, history, permissions, reasons and resilient states', () => {
  const source = readFileSync(new URL('../src/components/workflow/index.tsx', import.meta.url), 'utf8');
  for (const primitive of ['WorkflowTimeline', 'WorkflowAuditTrail', 'WorkflowSummary', 'WorkflowDecisionBar'])
    assert.match(source, new RegExp(`export function ${primitive}\\b`));
  assert.match(source, /aria-current=/);
  assert.match(source, /AnimatedPopover/);
  assert.match(source, /requiresReason/);
  assert.match(source, /filterWorkflowDecisions/);
  assert.match(source, /Skeleton/);
  assert.match(source, /EmptyState/);
  assert.match(source, /Workflow route unavailable/);
});

test('Expense approval workspace validates the review-drawer workflow floorplan', () => {
  const source = readFileSync(new URL('../src/pages/accounting/ExpensesWorkspace.tsx', import.meta.url), 'utf8');
  for (const surface of [
    'ApprovalDrawer',
    'WorkflowTimeline',
    'WorkflowAuditTrail',
    'WorkflowSummary',
    'WorkflowDecisionBar',
    'CreateModal',
  ]) assert.match(source, new RegExp(surface));
  assert.match(source, /Pull to my desk/);
  assert.match(source, /requiresReason:\s*true/);
  assert.match(source, /auth\.can/);
  assert.match(source, /transitionWorkflowStatus/);
  assert.match(source, /serializeWorkflowAuditHistory/);
});

test('Workflow styling remains token-driven and avoids decorative gradients or raw theme hex values', () => {
  const css = readFileSync(new URL('../src/components/workflow/workflow.css', import.meta.url), 'utf8');
  assert.equal(/\b(?:linear|radial|conic)-gradient\s*\(/i.test(css), false);
  assert.equal(/#[\da-f]{3,8}\b/i.test(css), false);
  for (const token of ['--space-3', '--border-subtle', '--text-primary', '--bg-subtle'])
    assert.match(css, new RegExp(`var\\(${token}\\)`));
});
