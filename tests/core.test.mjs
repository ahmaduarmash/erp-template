import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { csvCell } from '../src/lib/csv.ts';
import { resolveConfig } from '../src/theme/resolveConfig.ts';
import { templateConfig } from '../src/config/template.config.ts';
import { generateShadeScale, resolveDesignTokens } from '../src/theme/tokens/index.ts';
import { routeGroups, routeRegistry } from '../src/config/routes.ts';
import { modules, seedModule } from '../src/data/modules.ts';
import { validateRecord } from '../src/lib/validation.ts';

test('CSV escapes quotes, commas, and formula injection', () => {
  assert.equal(csvCell('A,"B"'), '"A,""B"""');
  for (const value of ['=SUM(A1:A2)', '+cmd', '@bad', '-1', ' \t=1'])
    assert.ok(csvCell(value).startsWith('"\''));
  assert.equal(csvCell(null), '""');
});

test('Config accepts supported overrides without mutating defaults', () => {
  const resolved = resolveConfig({
    theme: { mode: 'dark', algorithm: 'compact', primaryColor: '#123456' },
    typography: { fontFamily: 'Manrope' },
    layout: { density: 'compact' },
    sound: { categories: { notification: false } },
  });
  assert.equal(resolved.theme.mode, 'dark');
  assert.equal(resolved.theme.primaryColor, '#123456');
  assert.equal(resolved.typography.fontFamily, 'Manrope');
  assert.equal(resolved.layout.density, 'compact');
  assert.equal(resolved.sound.categories.click, true);
  assert.equal(resolved.sound.categories.notification, false);
  assert.equal('algorithm' in resolved.theme, false);
  assert.equal(templateConfig.theme.mode, 'light');
});

test('Legacy spacious density migrates to comfortable', () => {
  assert.equal(resolveConfig({ layout: { density: 'spacious' } }).layout.density, 'comfortable');
});

test('Malformed preferences preserve a renderable configuration', () => {
  for (const input of [null, 42, [], { theme: null }])
    assert.deepEqual(resolveConfig(input), templateConfig);
  const config = resolveConfig({
    theme: { primaryColor: 'url(evil)', mode: 'bad', borderRadius: 1000 },
    brand: { name: 42, logoUrl: 'javascript:alert(1)' },
    typography: { fontFamily: 'Not installed' },
    sound: { enabled: 'yes', volume: -5 },
    table: { defaultPageSize: Infinity, hiddenColumns: [1, 'status'] },
  });
  assert.equal(config.theme.primaryColor, templateConfig.theme.primaryColor);
  assert.equal(config.theme.mode, 'light');
  assert.equal(config.theme.borderRadius, 24);
  assert.equal(config.sound.volume, 0);
  assert.equal(config.sound.enabled, false);
  assert.equal(config.brand.name, templateConfig.brand.name);
  assert.equal(config.brand.logoUrl, templateConfig.brand.logoUrl);
  assert.deepEqual(config.table.hiddenColumns, ['status']);
});

test('Palette generator anchors the selected color and produces a usable scale', () => {
  const scale = generateShadeScale('#6155d9');
  assert.equal(scale[500], '#6155d9');
  assert.notEqual(scale[50], scale[900]);
  assert.match(scale[50], /^#[\da-f]{6}$/i);
  assert.match(scale[900], /^#[\da-f]{6}$/i);
});

test('Runtime tokens derive semantic light/dark, density, radius, type and layout values', () => {
  const light = resolveDesignTokens(templateConfig, false);
  const dark = resolveDesignTokens(templateConfig, true);
  assert.equal(light.primitive.primary[500], templateConfig.theme.primaryColor);
  assert.notEqual(light.semantic.bgBase, dark.semantic.bgBase);
  assert.equal(light.radius.card, templateConfig.theme.borderRadius);
  assert.equal(light.layout.contentMaxWidth, 'none');
  assert.ok(light.spacing.space6 > light.spacing.space3);
  assert.ok(light.typography.headingLg > light.typography.textMd);
  assert.notEqual(light.elevation.md, dark.elevation.md);
});

test('Motion matrix is fast, interaction-specific, and exits faster than entry', () => {
  const normal = resolveDesignTokens(templateConfig, false).motion;
  const fast = resolveDesignTokens(
    { ...templateConfig, motion: { ...templateConfig.motion, speed: 'fast' } },
    false,
  ).motion;
  assert.equal(normal.modalEnter, 0.2);
  assert.equal(normal.modalExit, 0.14);
  assert.equal(normal.drawerEnter, 0.2);
  assert.equal(normal.drawerExit, 0.14);
  assert.ok(normal.modalExit < normal.modalEnter);
  assert.ok(normal.drawerExit < normal.drawerEnter);
  assert.ok(fast.micro < normal.micro);
  assert.ok(fast.standard < normal.standard);
  assert.ok(fast.page < normal.page);
  assert.deepEqual(normal.spring, { stiffness: 500, damping: 35 });
});

test('Runtime CSS contains no decorative gradients or raw hex theme colors', () => {
  const cssFiles = [
    'src/styles.css',
    'src/erp.css',
    'src/design-v2.css',
    'src/coa-v2.css',
    'src/journal-v2.css',
    'src/components/primitives/primitives.css',
    'src/components/overlays/overlays.css',
    'src/components/shell/shell.css',
    'src/theme/tokens/tailwind.css',
    'src/theme/motion.css',
  ];
  for (const file of cssFiles) {
    const css = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.equal(/\b(?:linear|radial|conic)-gradient\s*\(/i.test(css), false, `${file} contains a decorative gradient`);
    assert.equal(/#[\da-f]{3,8}\b/i.test(css), false, `${file} contains a raw hex theme color`);
  }
});

test('Runtime motion CSS is controlled by token variables and reduced-motion vetoes animation', () => {
  const css = readFileSync(new URL('../src/theme/motion.css', import.meta.url), 'utf8');
  assert.match(css, /var\(--motion-micro\)/);
  assert.match(css, /var\(--motion-standard\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /data-motion='off'/);
});

test('Enterprise shell consumes runtime layout and motion tokens', () => {
  const css = readFileSync(new URL('../src/components/shell/shell.css', import.meta.url), 'utf8');
  for (const token of ['--rail-width', '--secondary-nav-width', '--header-height', '--tabbar-height'])
    assert.match(css, new RegExp(`var\\(${token}\\)`));
  assert.match(css, /var\(--motion-micro\)/);
  assert.match(css, /var\(--motion-standard\)/);
});

test('Shared visual primitive vocabulary is exported and token-driven', () => {
  const source = readFileSync(new URL('../src/components/primitives/index.tsx', import.meta.url), 'utf8');
  for (const primitive of [
    'Surface',
    'IconChip',
    'StatCard',
    'StatusPill',
    'ActionIcon',
    'OverflowMenu',
    'FilterBar',
    'EmptyState',
    'SectionHeader',
    'EntityCell',
    'MoneyCell',
    'ProgressCell',
    'QuickFilterTabs',
    'Metric',
    'ObjectHeader',
    'CommandBar',
  ]) assert.match(source, new RegExp(`export function ${primitive}\\b`));
  const css = readFileSync(new URL('../src/components/primitives/primitives.css', import.meta.url), 'utf8');
  for (const token of ['--bg-surface', '--border-default', '--radius-card', '--text-primary', '--control-height'])
    assert.match(css, new RegExp(`var\\(${token}\\)`));
});

test('Overlay interaction architecture exports intent-specific surfaces and consumes runtime tokens', () => {
  const source = readFileSync(new URL('../src/components/overlays/index.tsx', import.meta.url), 'utf8');
  for (const surface of ['CreateModal', 'EditModal', 'RecordDrawer', 'ApprovalDrawer', 'ConfirmActionPopover'])
    assert.match(source, new RegExp(`export function ${surface}\\b`));
  assert.match(source, /AnimatedModal/);
  assert.match(source, /AnimatedDrawer/);
  assert.match(source, /AnimatedPopover/);
  for (const token of ['--drawer-width-sm', '--drawer-width-md', '--drawer-width-lg'])
    assert.match(source, new RegExp(`var\\(${token}\\)`));

  const css = readFileSync(new URL('../src/components/overlays/overlays.css', import.meta.url), 'utf8');
  for (const token of ['--space-3', '--border-subtle', '--text-primary', '--bg-surface'])
    assert.match(css, new RegExp(`var\\(${token}\\)`));
});

test('Legacy CRUD compatibility uses explicit intent while retaining a safe migration fallback', () => {
  const source = readFileSync(new URL('../src/components/data/CrudModal.tsx', import.meta.url), 'utf8');
  assert.match(source, /export type CrudIntent = 'create' \| 'edit'/);
  assert.match(source, /intent\?: CrudIntent/);
  assert.match(source, /intent \? intent === 'edit'/);
  assert.match(source, /legacy callers/i);
});

test('Enterprise data workspace exposes the complete master-data contract', () => {
  const source = readFileSync(new URL('../src/components/data/EnterpriseDataTable.tsx', import.meta.url), 'utf8');
  for (const capability of [
    'sticky',
    'useSearchParams',
    'DataFilter',
    'SavedDataView',
    'BulkAction',
    "mode?: 'client' | 'server'",
    'onQueryChange',
    'showSizeChanger',
    'AnimatedDropdown',
    'downloadCsv',
    'onRefresh',
    'EmptyState',
    'virtual=',
  ]) assert.match(source, new RegExp(capability.replace(/[?+*.^$(){}|[\]\\]/g, '\\$&')));
});

test('Products validates enterprise table + record drawer + edit modal composition', () => {
  const source = readFileSync(new URL('../src/pages/inventory/ProductsPage.tsx', import.meta.url), 'utf8');
  assert.match(source, /EnterpriseDataTable/);
  assert.match(source, /RecordDrawer/);
  assert.match(source, /CreateModal/);
  assert.match(source, /EditModal/);
  assert.match(source, /filters=\{/);
  assert.match(source, /savedViews=\{/);
  assert.match(source, /exportName="products"/);
});

test('Several thousand rows remain uniquely addressable', () => {
  const seed = seedModule(modules[0]);
  const rows = Array.from({ length: 5000 }, (_, i) => ({
    ...seed[i % seed.length],
    id: `stress-${i}`,
  }));
  assert.equal(new Set(rows.map((r) => r.id)).size, 5000);
  assert.equal(rows.filter((r) => r.id.includes('stress-49')).length, 111);
});

test('Every module has unique seed IDs, valid statuses and required fields', () => {
  assert.equal(modules.length, 13);
  for (const module of modules) {
    const rows = seedModule(module);
    assert.equal(new Set(rows.map((r) => r.id)).size, rows.length);
    for (const row of rows) {
      assert.ok(module.statuses.includes(row.status));
      for (const f of module.fields.filter((f) => f.required))
        assert.notEqual(row[f.key], '', `${module.key}.${f.key}`);
    }
  }
});

test('Journal, transfer, invoice, and duplicate constraints', () => {
  assert.match(
    validateRecord(
      'journal-entries',
      { debit: 10, credit: 9, debitAccount: 'A', creditAccount: 'B' },
      [],
    ),
    /equal/,
  );
  assert.equal(
    validateRecord(
      'journal-entries',
      { debit: 10, credit: 10, debitAccount: 'A', creditAccount: 'B' },
      [],
    ),
    undefined,
  );
  assert.match(
    validateRecord('stock-transfers', { source: 'A', destination: 'A', quantity: 1 }, []),
    /different/,
  );
  assert.match(
    validateRecord('sales-invoices', { date: '2026-09-20', due: '2026-09-01' }, []),
    /Due/,
  );
  const row = { id: '1', name: 'Example', status: 'Active' };
  assert.match(validateRecord('products', { name: ' example ' }, [row]), /already exists/);
  assert.equal(validateRecord('products', { name: 'Example' }, [row], '1'), undefined);
});

test('ERP routes use domain floorplans instead of one CRUD floorplan', () => {
  const byKey = Object.fromEntries(routeRegistry.map((route) => [route.key, route]));
  assert.equal(byKey['chart-of-accounts'].pageKind, 'TREE');
  assert.equal(byKey['journal-entries'].pageKind, 'DOCUMENT');
  assert.equal(byKey['stock-levels'].pageKind, 'ANALYTICAL');
  assert.equal(byKey['purchase-orders'].pageKind, 'DOCUMENT');
  assert.equal(byKey.users.pageKind, 'SECURITY');
  for (const key of ['chart-of-accounts', 'journal-entries', 'stock-levels', 'purchase-orders'])
    assert.notEqual(byKey[key].pageKind, 'CRUD');
});

test('Enterprise navigation metadata is complete and business-area defaults resolve', () => {
  assert.deepEqual(
    routeGroups.map((group) => group.key),
    ['Overview', 'Inventory', 'Purchasing', 'Sales', 'Accounting', 'Organization', 'System'],
  );
  const paths = new Set(routeRegistry.map((route) => route.path));
  for (const route of routeRegistry) {
    assert.ok(route.title.length > 0, `${route.key} needs a title`);
    assert.ok(route.description.length > 0, `${route.key} needs a description`);
    assert.ok(route.icon.length > 0, `${route.key} needs an icon`);
    assert.ok(route.group.length > 0, `${route.key} needs a group`);
  }
  for (const group of routeGroups)
    assert.ok(paths.has(group.defaultPath), `${group.key} default path must resolve`);
});
