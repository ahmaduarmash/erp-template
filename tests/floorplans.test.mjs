import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routeRegistry } from '../src/config/routes.ts';

test('Every routed business module declares an explicit ERP floorplan', () => {
  const allowed = new Set(['MASTER_DETAIL', 'DOCUMENT', 'TREE', 'ANALYTICAL', 'SECURITY', 'WORKFLOW', 'CUSTOM']);
  for (const route of routeRegistry) {
    assert.ok(allowed.has(route.pageKind), `${route.key} has unsupported floorplan ${route.pageKind}`);
  }
  const byKey = Object.fromEntries(routeRegistry.map((route) => [route.key, route.pageKind]));
  assert.equal(byKey.expenses, 'WORKFLOW');
  assert.equal(byKey.customers, 'MASTER_DETAIL');
  assert.equal(byKey.suppliers, 'MASTER_DETAIL');
  assert.equal(byKey['stock-levels'], 'ANALYTICAL');
  assert.equal(byKey['chart-of-accounts'], 'TREE');
  assert.equal(byKey['journal-entries'], 'DOCUMENT');
  assert.equal(byKey.users, 'SECURITY');
});

test('Customer and supplier masters use the enterprise master-detail contract', () => {
  const source = readFileSync(new URL('../src/pages/erp/PartnerMasterPage.tsx', import.meta.url), 'utf8');
  for (const primitive of ['EnterpriseDataTable', 'RecordDrawer', 'CreateModal', 'EditModal'])
    assert.match(source, new RegExp(primitive));
  assert.match(source, /workspaceKey=\{kind\}/);
  assert.match(source, /savedViews=/);
  assert.match(source, /filters=/);
});
