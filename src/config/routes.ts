export type PageKind =
  | 'CRUD'
  | 'MASTER_DETAIL'
  | 'DOCUMENT'
  | 'TREE'
  | 'ANALYTICAL'
  | 'SECURITY'
  | 'WORKFLOW'
  | 'CUSTOM';

export type RouteGroup =
  | 'Overview'
  | 'Inventory'
  | 'Purchasing'
  | 'Sales'
  | 'Accounting'
  | 'Organization'
  | 'System';

export type RouteIconName =
  | 'dashboard'
  | 'products'
  | 'stock'
  | 'warehouse'
  | 'transfer'
  | 'purchase'
  | 'supplier'
  | 'accounts'
  | 'journal'
  | 'invoice'
  | 'payment'
  | 'expense'
  | 'customer'
  | 'users'
  | 'notifications'
  | 'audit'
  | 'settings'
  | 'profile';

export interface RouteDefinition {
  key: string;
  path: string;
  title: string;
  description: string;
  icon: RouteIconName;
  group: RouteGroup;
  pageKind: PageKind;
  permission?: string;
  navigation?: boolean;
}

export interface RouteGroupDefinition {
  key: RouteGroup;
  title: string;
  description: string;
  icon: RouteIconName;
  defaultPath: string;
}

export const routeGroups: RouteGroupDefinition[] = [
  { key: 'Overview', title: 'Overview', description: 'Workspace pulse and operational attention', icon: 'dashboard', defaultPath: '/dashboard' },
  { key: 'Inventory', title: 'Inventory', description: 'Products, stock, warehouses and movement', icon: 'products', defaultPath: '/inventory/products' },
  { key: 'Purchasing', title: 'Purchasing', description: 'Suppliers and procurement documents', icon: 'purchase', defaultPath: '/inventory/purchase-orders' },
  { key: 'Sales', title: 'Sales', description: 'Customers, invoices and receivables', icon: 'invoice', defaultPath: '/accounting/sales-invoices' },
  { key: 'Accounting', title: 'Accounting', description: 'Financial control, journals and settlement', icon: 'accounts', defaultPath: '/accounting/chart-of-accounts' },
  { key: 'Organization', title: 'Organization', description: 'People, access and responsibility', icon: 'users', defaultPath: '/system/users' },
  { key: 'System', title: 'System', description: 'Notifications, audit and workspace settings', icon: 'settings', defaultPath: '/system/notifications' },
];

export const routeRegistry: RouteDefinition[] = [
  { key: 'dashboard', path: '/dashboard', title: 'Overview', description: 'Operational summary, activity and attention queues', icon: 'dashboard', group: 'Overview', pageKind: 'ANALYTICAL' },
  { key: 'products', path: '/inventory/products', title: 'Products', description: 'Product catalog, pricing and inventory identity', icon: 'products', group: 'Inventory', pageKind: 'MASTER_DETAIL', permission: 'inventory.products.view' },
  { key: 'stock-levels', path: '/inventory/stock-levels', title: 'Stock levels', description: 'Availability, shortages and warehouse stock position', icon: 'stock', group: 'Inventory', pageKind: 'ANALYTICAL', permission: 'inventory.stock.view' },
  { key: 'warehouses', path: '/inventory/warehouses', title: 'Warehouses', description: 'Warehouse and storage-location hierarchy', icon: 'warehouse', group: 'Inventory', pageKind: 'TREE', permission: 'inventory.warehouses.view' },
  { key: 'stock-transfers', path: '/inventory/stock-transfers', title: 'Stock transfers', description: 'Controlled movement between stock locations', icon: 'transfer', group: 'Inventory', pageKind: 'DOCUMENT', permission: 'inventory.transfers.view' },
  { key: 'purchase-orders', path: '/inventory/purchase-orders', title: 'Purchase orders', description: 'Procurement documents, approvals and receiving', icon: 'purchase', group: 'Purchasing', pageKind: 'DOCUMENT', permission: 'purchasing.orders.view' },
  { key: 'suppliers', path: '/inventory/suppliers', title: 'Suppliers', description: 'Supplier master data and purchasing context', icon: 'supplier', group: 'Purchasing', pageKind: 'MASTER_DETAIL', permission: 'purchasing.suppliers.view' },
  { key: 'sales-invoices', path: '/accounting/sales-invoices', title: 'Sales invoices', description: 'Customer billing and receivable documents', icon: 'invoice', group: 'Sales', pageKind: 'DOCUMENT', permission: 'accounting.invoices.view' },
  { key: 'customers', path: '/accounting/customers', title: 'Customers', description: 'Customer master data, balances and activity', icon: 'customer', group: 'Sales', pageKind: 'MASTER_DETAIL', permission: 'accounting.customers.view' },
  { key: 'chart-of-accounts', path: '/accounting/chart-of-accounts', title: 'Chart of accounts', description: 'Ledger hierarchy and posting-account structure', icon: 'accounts', group: 'Accounting', pageKind: 'TREE', permission: 'accounting.accounts.view' },
  { key: 'journal-entries', path: '/accounting/journal-entries', title: 'Journal entries', description: 'Balanced accounting documents and posting workflow', icon: 'journal', group: 'Accounting', pageKind: 'DOCUMENT', permission: 'accounting.journals.view' },
  { key: 'payments', path: '/accounting/payments', title: 'Payments', description: 'Receipts, disbursements and allocation activity', icon: 'payment', group: 'Accounting', pageKind: 'DOCUMENT', permission: 'accounting.payments.view' },
  { key: 'expenses', path: '/accounting/expenses', title: 'Expenses', description: 'Expense requests, review and approval workflow', icon: 'expense', group: 'Accounting', pageKind: 'WORKFLOW', permission: 'accounting.expenses.view' },
  { key: 'users', path: '/system/users', title: 'Team & access', description: 'Users, roles, permissions and access boundaries', icon: 'users', group: 'Organization', pageKind: 'SECURITY', permission: 'system.users.view' },
  { key: 'notifications', path: '/system/notifications', title: 'Notifications', description: 'Alerts, decisions and workspace events', icon: 'notifications', group: 'System', pageKind: 'CUSTOM' },
  { key: 'audit-log', path: '/system/audit-log', title: 'Audit log', description: 'Traceable user and system activity history', icon: 'audit', group: 'System', pageKind: 'ANALYTICAL', permission: 'system.audit.view' },
  { key: 'settings', path: '/settings', title: 'Settings', description: 'Workspace behavior, appearance and preferences', icon: 'settings', group: 'System', pageKind: 'CUSTOM' },
  { key: 'profile', path: '/profile', title: 'My profile', description: 'Personal identity and workspace profile settings', icon: 'profile', group: 'System', pageKind: 'CUSTOM', navigation: false },
];

export function routeForPath(pathname: string) {
  return routeRegistry.find((route) => route.path === pathname);
}

export function routesForGroup(group: RouteGroup, includeHidden = false) {
  return routeRegistry.filter((route) => route.group === group && (includeHidden || route.navigation !== false));
}

export function routeGroupFor(group: RouteGroup) {
  return routeGroups.find((definition) => definition.key === group)!;
}
