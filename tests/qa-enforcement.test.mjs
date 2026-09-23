import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolveConfig } from '../src/theme/resolveConfig.ts';
import { templateConfig } from '../src/config/template.config.ts';
import { resolveDesignTokens } from '../src/theme/tokens/index.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function luminance(hex) {
  const rgb = hex.match(/[\da-f]{2}/gi).map((value) => parseInt(value, 16) / 255);
  const linear = rgb.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

test('runtime theme matrix stays renderable across mode, density, typography, radius and color overrides', () => {
  const configs = [
    resolveConfig({ theme: { mode: 'light', primaryColor: '#1f6feb', accentColor: '#6e56cf', borderRadius: 0 }, layout: { density: 'compact', contentWidth: 'boxed' }, typography: { fontFamily: 'Inter', baseFontSize: 13 }, motion: { speed: 'fast' } }),
    resolveConfig({ theme: { mode: 'dark', primaryColor: '#0f8a5f', accentColor: '#c06b20', borderRadius: 18 }, layout: { density: 'comfortable', contentWidth: 'full' }, typography: { fontFamily: 'Manrope', baseFontSize: 16 }, motion: { speed: 'normal' } }),
    resolveConfig({ theme: { mode: 'system', primaryColor: '#8b4be3', accentColor: '#178c96', borderRadius: 24 }, typography: { fontFamily: 'Public Sans', baseFontSize: 15 } }),
  ];
  for (const config of configs) {
    for (const dark of [false, true]) {
      const tokens = resolveDesignTokens(config, dark);
      assert.ok(tokens.spacing.space6 > tokens.spacing.space2);
      assert.ok(tokens.typography.textMd >= 12);
      assert.ok(tokens.radius.card >= 0);
      assert.ok(tokens.layout.controlHeight > 20);
      assert.ok(tokens.motion.modalExit < tokens.motion.modalEnter);
    }
  }
});

test('semantic foreground/background contrast strategy remains readable in light and dark modes', () => {
  for (const dark of [false, true]) {
    const tokens = resolveDesignTokens(templateConfig, dark);
    assert.ok(contrast(tokens.semantic.textPrimary, tokens.semantic.bgSurface) >= 4.5);
    assert.ok(contrast(tokens.semantic.textPrimary, tokens.semantic.bgBase) >= 4.5);
    assert.ok(contrast(tokens.semantic.textOnAction, tokens.semantic.actionPrimary) >= 3);
  }
});

test('all active design-system CSS is guarded against decorative gradients and raw theme colors', () => {
  const files = [
    'src/styles.css',
    'src/erp.css',
    'src/design-v2.css',
    'src/coa-v2.css',
    'src/pages/settings.css',
    'src/components/primitives/primitives.css',
    'src/components/overlays/overlays.css',
    'src/components/workflow/workflow.css',
    'src/components/documents/document-workspace.css',
    'src/components/shell/shell.css',
    'src/theme/tokens/tailwind.css',
    'src/theme/motion.css',
  ];
  for (const file of files) {
    const css = read(file);
    assert.equal(/\b(?:linear|radial|conic)-gradient\s*\(/i.test(css), false, `${file} contains a decorative gradient`);
    assert.equal(/#[\da-f]{3,8}\b/i.test(css), false, `${file} contains a raw hex theme color`);
  }
});

test('legacy global styling no longer competes with active shell settings or motion ownership', () => {
  const globalCss = read('src/styles.css');
  const compatibilityCss = read('src/design-v2.css');
  for (const legacySelector of ['.sidebar {', '.settings-layout {', '.setting-row {', '.preview-column {', '.page-tabs {']) {
    assert.equal(globalCss.includes(legacySelector), false, `legacy selector ${legacySelector} must stay removed`);
  }
  for (const legacySelector of ['.sidebar,', '.page-tabs', '.page-tab {', '.nav-link {']) {
    assert.equal(compatibilityCss.includes(legacySelector), false, `compatibility selector ${legacySelector} must stay removed`);
  }
  assert.equal(globalCss.includes('.ant-tabs-nav {'), false, 'global Ant Tabs spacing override must stay removed');
  assert.equal(compatibilityCss.includes('prefers-reduced-motion'), false, 'reduced-motion veto belongs only to theme/motion.css');
  assert.equal(/transition[^;]*\b(?:100|110|120|140|160|180|200|300|500)ms\b/.test(compatibilityCss), false, 'compatibility motion must use runtime timing tokens');
});

test('dead competing workspace implementations stay removed', () => {
  for (const path of [
    '../src/pages/ModulePage.tsx',
    '../src/pages/erp/AccountingWorkspaces.tsx',
    '../src/pages/accounting/JournalEntriesPage.tsx',
    '../src/journal-v2.css',
  ]) assert.equal(existsSync(new URL(path, import.meta.url)), false, `${path} should not return`);
});

test('icon-first shell and shared actions have accessible names and mobile navigation state', () => {
  const primitives = read('src/components/primitives/index.tsx');
  const topbar = read('src/components/shell/Topbar.tsx');
  const shell = read('src/components/shell/AppShell.tsx');
  const documents = read('src/components/documents/DocumentWorkspace.tsx');
  assert.match(primitives, /aria-label=\{label\}/);
  assert.match(topbar, /aria-expanded=\{mobileNavigationOpen\}/);
  assert.match(topbar, /aria-controls="shell-navigation"/);
  assert.equal(topbar.includes('role="listbox"'), false, 'search results must not claim unsupported listbox keyboard semantics');
  assert.equal(topbar.includes('role="option"'), false, 'search result buttons retain native button semantics');
  assert.match(shell, /id="shell-navigation"/);
  assert.match(documents, /aria-label="Back to document list"/);
  assert.match(documents, /aria-labelledby=\{titleId\}/);
});

test('responsive contracts cover shell, overlays, data workspaces, hierarchy and documents', () => {
  const shell = read('src/components/shell/shell.css');
  const overlays = read('src/components/overlays/overlays.css');
  const primitives = read('src/components/primitives/primitives.css');
  const documents = read('src/components/documents/document-workspace.css');
  const coa = read('src/coa-v2.css');
  assert.match(shell, /@media \(max-width: 980px\)/);
  assert.match(shell, /@media \(max-width: 700px\)/);
  assert.match(overlays, /max-width: 100vw/);
  assert.match(overlays, /70dvh/);
  assert.match(primitives, /@media \(max-width: 700px\)/);
  assert.match(documents, /@media \(max-width: 960px\)/);
  assert.match(documents, /min-width: 680px/);
  assert.match(coa, /@media \(max-width: 680px\)/);
  assert.equal(coa.includes('translateX'), false, 'hierarchy hover must not add decorative movement');
});

test('enterprise data workspace retains query, edge-state, bulk and server contracts', () => {
  const source = read('src/components/data/EnterpriseDataTable.tsx');
  for (const contract of [
    'useSearchParams',
    "mode === 'server'",
    'bulkActions.length',
    'loading={loading}',
    'Unable to load records',
    'EmptyState',
    'virtual=',
    'aria-busy',
    'enterprise-filter-select',
  ]) assert.match(source, new RegExp(contract.replace(/[?+*.^$(){}|[\]\\]/g, '\\$&')));
  assert.match(source, /next\.toString\(\) !== searchParams\.toString\(\)/);
  assert.match(source, /columns\.every\(\(column\) => next\.includes/);
});

test('reduced-motion veto remains centralized and covers user preference plus OS preference', () => {
  const motion = read('src/theme/motion.css');
  const styles = read('src/styles.css');
  const compatibility = read('src/design-v2.css');
  assert.match(motion, /data-motion='off'/);
  assert.match(motion, /prefers-reduced-motion:\s*reduce/);
  assert.equal(styles.includes('prefers-reduced-motion'), false);
  assert.equal(compatibility.includes('prefers-reduced-motion'), false);
});
