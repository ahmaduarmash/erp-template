export type Field = {
  key: string;
  label: string;
  type?: 'number' | 'email' | 'date' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
};
export type RecordData = {
  id: string;
  name: string;
  status: string;
  [key: string]: string | number;
};
export type ModuleDefinition = {
  key: string;
  title: string;
  singular: string;
  group: 'Inventory' | 'Accounting' | 'System';
  description: string;
  fields: Field[];
  statuses: string[];
};
const f = (key: string, label: string, type?: Field['type'], options?: string[]): Field => ({
  key,
  label,
  type,
  options,
  required: true,
});
export const modules: ModuleDefinition[] = [
  {
    key: 'products',
    title: 'Products',
    singular: 'product',
    group: 'Inventory',
    description: 'Your catalog, organized and ready to move.',
    fields: [
      f('name', 'Product name'),
      f('sku', 'SKU'),
      f('category', 'Category', 'select', ['Electronics', 'Furniture', 'Accessories', 'Office']),
      f('price', 'Unit price', 'number'),
      f('quantity', 'On hand', 'number'),
    ],
    statuses: ['Active', 'Draft', 'Archived'],
  },
  {
    key: 'stock-levels',
    title: 'Stock levels',
    singular: 'stock record',
    group: 'Inventory',
    description: 'Keep a clear view of availability across locations.',
    fields: [
      f('name', 'Product'),
      f('warehouse', 'Warehouse', 'select', [
        'Central warehouse',
        'North fulfillment',
        'South storage',
      ]),
      f('quantity', 'Available units', 'number'),
      f('reorder', 'Reorder point', 'number'),
    ],
    statuses: ['In stock', 'Low stock', 'Out of stock'],
  },
  {
    key: 'warehouses',
    title: 'Warehouses',
    singular: 'warehouse',
    group: 'Inventory',
    description: 'Manage the places that keep your business moving.',
    fields: [
      f('name', 'Warehouse name'),
      f('code', 'Code'),
      f('location', 'Location'),
      f('manager', 'Manager'),
    ],
    statuses: ['Active', 'Inactive'],
  },
  {
    key: 'stock-transfers',
    title: 'Stock transfers',
    singular: 'transfer',
    group: 'Inventory',
    description: 'Track inventory movements between your locations.',
    fields: [
      f('name', 'Reference'),
      f('product', 'Product'),
      f('source', 'From warehouse'),
      f('destination', 'To warehouse'),
      f('quantity', 'Units', 'number'),
      f('date', 'Transfer date', 'date'),
    ],
    statuses: ['Draft', 'In transit', 'Received'],
  },
  {
    key: 'purchase-orders',
    title: 'Purchase orders',
    singular: 'purchase order',
    group: 'Inventory',
    description: 'Plan purchasing and keep incoming orders in sight.',
    fields: [
      f('name', 'Order number'),
      f('supplier', 'Supplier'),
      f('amount', 'Total amount', 'number'),
      f('date', 'Order date', 'date'),
    ],
    statuses: ['Draft', 'Ordered', 'Received', 'Cancelled'],
  },
  {
    key: 'suppliers',
    title: 'Suppliers',
    singular: 'supplier',
    group: 'Inventory',
    description: 'The partners behind your supply chain.',
    fields: [
      f('name', 'Supplier name'),
      f('contact', 'Contact person'),
      f('email', 'Email', 'email'),
      f('phone', 'Phone'),
      f('location', 'Location'),
    ],
    statuses: ['Active', 'Inactive'],
  },
  {
    key: 'chart-of-accounts',
    title: 'Chart of accounts',
    singular: 'account',
    group: 'Accounting',
    description: 'A consistent structure for your financial records.',
    fields: [
      f('name', 'Account name'),
      f('code', 'Account code'),
      f('type', 'Account type', 'select', ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
      { ...f('parent', 'Parent account'), required: false },
    ],
    statuses: ['Active', 'Inactive'],
  },
  {
    key: 'journal-entries',
    title: 'Journal entries',
    singular: 'journal entry',
    group: 'Accounting',
    description: 'Balanced entries with a traceable history.',
    fields: [
      f('name', 'Reference'),
      f('date', 'Entry date', 'date'),
      f('debitAccount', 'Debit account'),
      f('creditAccount', 'Credit account'),
      f('debit', 'Debit amount', 'number'),
      f('credit', 'Credit amount', 'number'),
      f('description', 'Narration', 'textarea'),
    ],
    statuses: ['Draft', 'Reviewed'],
  },
  {
    key: 'sales-invoices',
    title: 'Sales invoices',
    singular: 'invoice',
    group: 'Accounting',
    description: 'Stay on top of billing and outstanding receivables.',
    fields: [
      f('name', 'Invoice number'),
      f('customer', 'Customer'),
      f('amount', 'Invoice amount', 'number'),
      f('date', 'Issue date', 'date'),
      f('due', 'Due date', 'date'),
    ],
    statuses: ['Draft', 'Sent', 'Paid', 'Overdue'],
  },
  {
    key: 'payments',
    title: 'Payments',
    singular: 'payment',
    group: 'Accounting',
    description: 'A clear record of money coming in and going out.',
    fields: [
      f('name', 'Reference'),
      f('party', 'Customer / supplier'),
      f('amount', 'Amount', 'number'),
      f('method', 'Payment method', 'select', ['Bank transfer', 'Card', 'Cash']),
      f('date', 'Payment date', 'date'),
    ],
    statuses: ['Pending', 'Completed', 'Failed'],
  },
  {
    key: 'expenses',
    title: 'Expenses',
    singular: 'expense',
    group: 'Accounting',
    description: 'Review operational spending in one place.',
    fields: [
      f('name', 'Expense title'),
      f('category', 'Category', 'select', ['Travel', 'Software', 'Utilities', 'Office']),
      f('amount', 'Amount', 'number'),
      f('date', 'Expense date', 'date'),
      f('owner', 'Submitted by'),
    ],
    statuses: ['Pending', 'Approved', 'Rejected'],
  },
  {
    key: 'customers',
    title: 'Customers',
    singular: 'customer',
    group: 'Accounting',
    description: 'Build stronger relationships, one account at a time.',
    fields: [
      f('name', 'Company name'),
      f('contact', 'Contact person'),
      f('email', 'Email', 'email'),
      f('phone', 'Phone'),
      f('location', 'Location'),
    ],
    statuses: ['Active', 'Inactive'],
  },
  {
    key: 'users',
    title: 'Users',
    singular: 'user',
    group: 'System',
    description: 'Manage the people and access in your workspace.',
    fields: [
      f('name', 'Full name'),
      f('email', 'Email', 'email'),
      f('role', 'Role', 'select', ['Admin', 'Manager', 'Member']),
      f('department', 'Department', 'select', ['Operations', 'Finance', 'People', 'Engineering']),
    ],
    statuses: ['Active', 'Invited', 'Suspended'],
  },
];
export const getModule = (key: string) => modules.find((m) => m.key === key)!;
const productNames = [
  'Arc desk lamp',
  'Contour office chair',
  'Studio monitor 27″',
  'Wireless keyboard',
  'Everyday notebook',
  'USB-C docking station',
  'Standing desk',
  'Travel adapter',
  'Desk organizer',
  'Focus headphones',
  'Task chair',
  'Laptop stand',
];
const partners = [
  'Northstar Studio',
  'Forma Collective',
  'Summit Works',
  'Origin Supply',
  'Kinetic Labs',
  'Atlas Trading',
];
export function seedModule(def: ModuleDefinition): RecordData[] {
  return Array.from(
    {
      length:
        def.key === 'products' ? 48 : def.key === 'warehouses' ? 3 : def.key === 'users' ? 8 : 12,
    },
    (_, i) => {
      const row: RecordData = {
        id: `${def.key}-${i + 1}`,
        name: '',
        status: def.statuses[i % def.statuses.length],
      };
      def.fields.forEach((field) => {
        row[field.key] =
          field.type === 'number'
            ? field.key === 'quantity'
              ? 24 + i * 7
              : field.key === 'reorder'
                ? 20
                : field.key === 'debit' || field.key === 'credit'
                  ? 1250 + i * 100
                  : 149 + i * 73
            : field.type === 'date'
              ? '2026-09-' + String(1 + (i % 20)).padStart(2, '0')
              : field.type === 'select'
                ? field.options![i % field.options!.length]
                : field.type === 'email'
                  ? `contact${i + 1}@example.com`
                  : field.key === 'phone'
                    ? `+1 202 555 ${String(100 + i).padStart(4, '0')}`
                    : field.key === 'sku'
                      ? `AST-${1000 + i}`
                      : field.key === 'code'
                        ? `${1000 + i * 10}`
                        : field.key === 'location'
                          ? ['Austin, TX', 'Portland, OR', 'Denver, CO'][i % 3]
                          : field.key === 'contact' ||
                              field.key === 'manager' ||
                              field.key === 'owner'
                            ? ['Alex Morgan', 'Jamie Chen', 'Taylor Reed'][i % 3]
                            : field.key === 'supplier' ||
                                field.key === 'customer' ||
                                field.key === 'party'
                              ? partners[i % partners.length]
                              : field.key === 'source'
                                ? 'Central warehouse'
                                : field.key === 'destination'
                                  ? 'North fulfillment'
                                  : field.key === 'product'
                                    ? productNames[i % productNames.length]
                                    : field.key === 'debitAccount'
                                      ? 'Office expense'
                                      : field.key === 'creditAccount'
                                        ? 'Cash at bank'
                                        : field.key === 'description'
                                          ? 'Monthly operating allocation'
                                          : field.key === 'parent'
                                            ? ''
                                            : 'Central warehouse';
      });
      row.name = ['products', 'stock-levels'].includes(def.key)
        ? productNames[i % 12] + (i >= 12 ? ` · ${Math.floor(i / 12) + 1}` : '')
        : def.key === 'warehouses'
          ? ['Central warehouse', 'North fulfillment', 'South storage'][i]
          : def.key === 'suppliers' || def.key === 'customers'
            ? partners[i % 6] + (i >= 6 ? ' East' : '')
            : def.key === 'users'
              ? [
                  'Alex Morgan',
                  'Jamie Chen',
                  'Taylor Reed',
                  'Jordan Lee',
                  'Sam Rivera',
                  'Casey Park',
                  'Robin Ellis',
                  'Drew Miller',
                ][i]
              : def.key === 'chart-of-accounts'
                ? [
                    'Cash at bank',
                    'Accounts receivable',
                    'Inventory assets',
                    'Office equipment',
                    'Accounts payable',
                    'Salary payable',
                    'Owner capital',
                    'Sales revenue',
                    'Service revenue',
                    'Office expense',
                    'Software expense',
                    'Travel expense',
                  ][i]
                : def.key === 'expenses'
                  ? [
                      'Team travel',
                      'Workspace subscription',
                      'Office supplies',
                      'Internet service',
                    ][i % 4]
                  : `${({ 'purchase-orders': 'PO', 'stock-transfers': 'TR', 'journal-entries': 'JE', 'sales-invoices': 'INV', payments: 'PAY' } as Record<string, string>)[def.key]}-2026-${String(i + 101).padStart(4, '0')}`;
      return row;
    },
  );
}
