import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveConfig } from '../src/theme/resolveConfig.ts';
import { templateConfig } from '../src/config/template.config.ts';

test('Settings recovery accepts safe brand preferences and rejects unsafe/stale brand values', () => {
  const safe = resolveConfig({
    brand: {
      name: '  Northstar ERP  ',
      tagline: 'Operations without noise',
      logoUrl: 'https://example.com/logo.svg',
    },
  });
  assert.equal(safe.brand.name, 'Northstar ERP');
  assert.equal(safe.brand.tagline, 'Operations without noise');
  assert.equal(safe.brand.logoUrl, 'https://example.com/logo.svg');

  const unsafe = resolveConfig({ brand: { name: '', logoUrl: 'javascript:alert(1)' } });
  assert.equal(unsafe.brand.name, templateConfig.brand.name);
  assert.equal(unsafe.brand.logoUrl, templateConfig.brand.logoUrl);
});

test('Live theme studio exposes every Phase 8 target through the existing runtime config engine', () => {
  const source = readFileSync(new URL('../src/pages/Settings.tsx', import.meta.url), 'utf8');
  for (const marker of [
    'Brand',
    'Color mode',
    'Primary color',
    'Accent color',
    'Font family',
    'Text size',
    'Density',
    'Corner radius',
    'Content width',
    'Motion speed',
    'Effective motion policy',
    'Interface sounds',
    'Sound categories',
    'Rows per page',
    'Reset to project defaults',
    'Live preview',
  ]) assert.match(source, new RegExp(marker, 'i'));
  assert.match(source, /setGroup\(/);
  assert.match(source, /reducedMotion/);
  assert.match(source, /motionEnabled/);
  assert.match(source, /storageError/);
});

test('Settings studio styling is token-driven, responsive, and contains no decorative gradients', () => {
  const css = readFileSync(new URL('../src/pages/settings.css', import.meta.url), 'utf8');
  assert.equal(/\b(?:linear|radial|conic)-gradient\s*\(/i.test(css), false);
  assert.equal(/#[\da-f]{3,8}\b/i.test(css), false);
  for (const token of ['--bg-surface', '--border-default', '--space-4', '--radius-card', '--text-primary'])
    assert.match(css, new RegExp(`var\\(${token}\\)`));
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
});
