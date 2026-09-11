import test from 'node:test';
import assert from 'node:assert/strict';
import { csvCell } from '../src/lib/csv.ts';
import { resolveConfig } from '../src/theme/resolveConfig.ts';
import { templateConfig } from '../src/config/template.config.ts';
import { modules, seedModule } from '../src/data/modules.ts';
import { validateRecord } from '../src/lib/validation.ts';

test('CSV escapes quotes, commas, and formula injection', () => {
  assert.equal(csvCell('A,"B"'), '"A,""B"""');
  for (const value of ['=SUM(A1:A2)', '+cmd', '@bad', '-1', ' \t=1'])
    assert.ok(csvCell(value).startsWith('"\''));
  assert.equal(csvCell(null), '""');
});
test('Config accepts valid overrides without mutating defaults', () => {
  const resolved = resolveConfig({
    theme: { mode: 'dark', algorithm: 'compact', primaryColor: '#123456' },
    typography: { fontFamily: 'Manrope' },
    sound: { categories: { notification: false } },
  });
  assert.equal(resolved.theme.mode, 'dark');
  assert.equal(resolved.theme.algorithm, 'compact');
  assert.equal(resolved.typography.fontFamily, 'Manrope');
  assert.equal(resolved.sound.categories.click, true);
  assert.equal(resolved.sound.categories.notification, false);
  assert.equal(templateConfig.theme.mode, 'light');
});
test('Malformed preferences preserve a renderable configuration', () => {
  for (const input of [null, 42, [], { theme: null }])
    assert.deepEqual(resolveConfig(input), templateConfig);
  const config = resolveConfig({
    theme: { primaryColor: 'url(evil)', mode: 'bad', borderRadius: 1000 },
    brand: { name: 'stale' },
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
  assert.deepEqual(config.table.hiddenColumns, ['status']);
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
test('Several thousand rows remain uniquely addressable', () => {
  const seed = seedModule(modules[0]);
  const rows = Array.from({ length: 5000 }, (_, i) => ({
    ...seed[i % seed.length],
    id: `stress-${i}`,
  }));
  assert.equal(new Set(rows.map((r) => r.id)).size, 5000);
  assert.equal(rows.filter((r) => r.id.includes('stress-49')).length, 111);
});
