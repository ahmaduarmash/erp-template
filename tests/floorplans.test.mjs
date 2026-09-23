import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routeRegistry } from '../src/config/routes.ts';

test('Every routed business module declares an explicit ERP floorplan', () => {
  const allowed = new Set(['MASTER_DETAIL', 'DOCUMENT', 'TREE', 'ANALYTICAL', 'SECURITY', 'WORKFLOW', 'CUSTOM']);
  for (const route of routeRegistry) assert.ok(allowed.has(route.pageKind), `${route.key} has unsupported floorplan ${route.pageKind}`);
  const byKey = Object.fromEntries(routeRegistry.map((route) => [route.key, route.pageKind]));
  assert.equal(byKey.dashboard, 'ANALYTICAL');
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
  for (const primitive of ['EnterpriseDataTable', 'RecordDrawer', 'CreateModal', 'EditModal']) assert.match(source, new RegExp(primitive));
  assert.match(source, /workspaceKey=\{kind\}/);
  assert.match(source, /savedViews=/);
  assert.match(source, /filters=/);
});

test('Tree workspaces preserve hierarchy behavior and use modal editing for small records', () => {
  const accounts = readFileSync(new URL('../src/pages/accounting/ChartOfAccountsPage.tsx', import.meta.url), 'utf8');
  const warehouses = readFileSync(new URL('../src/pages/inventory/WarehousesPage.tsx', import.meta.url), 'utf8');
  assert.match(accounts, /<Tree/);
  assert.match(accounts, /CreateModal/);
  assert.match(accounts, /EditModal/);
  assert.equal(/<Drawer\b/.test(accounts), false);
  assert.match(warehouses, /<Tree/);
  assert.match(warehouses, /CreateModal/);
  assert.match(warehouses, /EditModal/);
});

test('Security workspace separates inspection from access editing', () => {
  const source = readFileSync(new URL('../src/pages/erp/SecurityWorkspace.tsx', import.meta.url), 'utf8');
  for (const surface of ['RecordDrawer', 'CreateModal', 'EditModal', 'ConfirmActionPopover']) assert.match(source, new RegExp(surface));
  assert.equal(/<Drawer\b/.test(source), false);
  assert.match(source, /Roles & permissions/);
  assert.match(source, /Scoped access/);
});

test('Dashboard and stock-level workspaces remain analytical rather than editable master CRUD', () => {
  const dashboard = readFileSync(new URL('../src/pages/Dashboard.tsx', import.meta.url), 'utf8');
  const inventory = readFileSync(new URL('../src/pages/erp/InventoryWorkspaces.tsx', import.meta.url), 'utf8');
  assert.match(dashboard, /StatCard/);
  assert.match(dashboard, /DashboardCharts/);
  assert.match(inventory, /export function StockLevelsWorkspace/);
  assert.match(inventory, /projected/);
  assert.match(inventory, /reorder/);
});
