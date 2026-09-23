import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Complex transaction routes use a dedicated full-page document workspace contract', () => {
  const component = readFileSync(new URL('../src/components/documents/DocumentWorkspace.tsx', import.meta.url), 'utf8');
  const source = readFileSync(new URL('../src/pages/erp/DocumentWorkspaces.tsx', import.meta.url), 'utf8');
  assert.match(component, /export function DocumentWorkspace/);
  assert.match(component, /document-workspace-layout/);
  assert.match(source, /StockTransfersWorkspace/);
  assert.match(source, /PurchaseOrdersWorkspace/);
  assert.match(source, /InvoicesWorkspace/);
  assert.match(source, /JournalEntriesWorkspace/);
  assert.match(source, /PaymentsWorkspace/);
  assert.equal(/<Drawer\b/.test(source), false);
  assert.equal(/<Modal\b/.test(source), false);
  assert.match(source, /Form\.List/);
  assert.match(source, /Source and destination warehouses must be different|source and destination warehouses must be different/i);
  assert.match(source, /equal positive debits and credits/);
  assert.match(source, /Due date cannot be before issue date/);
});

test('Document workspace styling is responsive and token driven', () => {
  const css = readFileSync(new URL('../src/components/documents/document-workspace.css', import.meta.url), 'utf8');
  assert.equal(/\b(?:linear|radial|conic)-gradient\s*\(/i.test(css), false);
  assert.equal(/#[\da-f]{3,8}\b/i.test(css), false);
  for (const token of ['--bg-surface', '--border-default', '--radius-card', '--space-4', '--text-primary'])
    assert.match(css, new RegExp(`var\\(${token}\\)`));
  assert.match(css, /@media \(max-width: 960px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
});

test('Routed document wrappers resolve to the shared full-page document workspaces', () => {
  const wrappers = [
    '../src/pages/inventory/StockTransfers.tsx',
    '../src/pages/inventory/PurchaseOrders.tsx',
    '../src/pages/accounting/Invoices.tsx',
    '../src/pages/accounting/Payments.tsx',
    '../src/pages/accounting/Journals.tsx',
  ];
  for (const path of wrappers) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.match(source, /DocumentWorkspaces/);
  }
});
