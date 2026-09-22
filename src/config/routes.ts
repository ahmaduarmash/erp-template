export type PageKind = 'CRUD' | 'MASTER_DETAIL' | 'DOCUMENT' | 'TREE' | 'ANALYTICAL' | 'SECURITY' | 'CUSTOM';

export interface RouteDefinition {
  key: string;
  path: string;
  title: string;
  group: 'Workspace' | 'Inventory' | 'Accounting' | 'Organization';
  pageKind: PageKind;
  permission?: string;
}

export const routeRegistry: RouteDefinition[] = [
  { key: 'dashboard', path: '/dashboard', title: 'Overview', group: 'Workspace', pageKind: 'CUSTOM' },
  { key: 'products', path: '/inventory/products', title: 'Products', group: 'Inventory', pageKind: 'MASTER_DETAIL', permission: 'inventory.products.view' },
  { key: 'stock-levels', path: '/inventory/stock-levels', title: 'Stock levels', group: 'Inventory', pageKind: 'ANALYTICAL', permission: 'inventory.stock.view' },
  { key: 'warehouses', path: '/inventory/warehouses', title: 'Warehouses', group: 'Inventory', pageKind: 'TREE', permission: 'inventory.warehouses.view' },
  { key: 'stock-transfers', path: '/inventory/stock-transfers', title: 'Stock transfers', group: 'Inventory', pageKind: 'DOCUMENT', permission: 'inventory.transfers.view' },
  { key: 'purchase-orders', path: '/inventory/purchase-orders', title: 'Purchase orders', group: 'Inventory', pageKind: 'DOCUMENT', permission: 'purchasing.orders.view' },
  { key: 'suppliers', path: '/inventory/suppliers', title: 'Suppliers', group: 'Inventory', pageKind: 'MASTER_DETAIL', permission: 'purchasing.suppliers.view' },
  { key: 'chart-of-accounts', path: '/accounting/chart-of-accounts', title: 'Chart of accounts', group: 'Accounting', pageKind: 'TREE', permission: 'accounting.accounts.view' },
  { key: 'journal-entries', path: '/accounting/journal-entries', title: 'Journal entries', group: 'Accounting', pageKind: 'DOCUMENT', permission: 'accounting.journals.view' },
  { key: 'sales-invoices', path: '/accounting/sales-invoices', title: 'Sales invoices', group: 'Accounting', pageKind: 'DOCUMENT', permission: 'accounting.invoices.view' },
  { key: 'payments', path: '/accounting/payments', title: 'Payments', group: 'Accounting', pageKind: 'DOCUMENT', permission: 'accounting.payments.view' },
  { key: 'expenses', path: '/accounting/expenses', title: 'Expenses', group: 'Accounting', pageKind: 'CUSTOM', permission: 'accounting.expenses.view' },
  { key: 'customers', path: '/accounting/customers', title: 'Customers', group: 'Accounting', pageKind: 'MASTER_DETAIL', permission: 'accounting.customers.view' },
  { key: 'users', path: '/system/users', title: 'Team & access', group: 'Organization', pageKind: 'SECURITY', permission: 'system.users.view' },
  { key: 'notifications', path: '/system/notifications', title: 'Notifications', group: 'Organization', pageKind: 'CUSTOM' },
  { key: 'audit-log', path: '/system/audit-log', title: 'Audit log', group: 'Organization', pageKind: 'ANALYTICAL', permission: 'system.audit.view' },
  { key: 'settings', path: '/settings', title: 'Settings', group: 'Organization', pageKind: 'CUSTOM' },
];
