import type { RecordData } from '../data/modules';
/** Client-side demonstration only. Repeat all constraints in your production API. */
export function validateRecord(
  moduleKey: string,
  values: Record<string, unknown>,
  rows: RecordData[],
  editingId?: string,
): string | undefined {
  if (
    moduleKey === 'journal-entries' &&
    (Math.round(Number(values.debit) * 100) !== Math.round(Number(values.credit) * 100) ||
      Number(values.debit) <= 0 ||
      values.debitAccount === values.creditAccount)
  )
    return 'Enter equal positive debits and credits using different accounts.';
  if (
    moduleKey === 'stock-transfers' &&
    (values.source === values.destination || Number(values.quantity) <= 0)
  )
    return 'Choose different warehouses and a positive transfer quantity.';
  if (moduleKey === 'sales-invoices' && String(values.due) < String(values.date))
    return 'Due date must be on or after the issue date.';
  if (
    rows.some(
      (r) =>
        r.id !== editingId &&
        ['name', 'sku', 'code', 'email'].some(
          (key) =>
            values[key] &&
            r[key] &&
            String(r[key]).trim().toLowerCase() === String(values[key]).trim().toLowerCase(),
        ),
    )
  )
    return 'A record with this name or unique identifier already exists.';
}
