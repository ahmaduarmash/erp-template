export type DocumentStatus = 'Draft' | 'Submitted' | 'Posted' | 'In transit' | 'Received' | 'Paid' | 'Cancelled' | 'Reversed';

export interface EntityRef {
  id: string;
  code?: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  uom: string;
  reorderPoint: number;
  active: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  location: string;
  manager?: string;
  active: boolean;
}

export interface StockBalance {
  product: EntityRef;
  warehouse: EntityRef;
  actual: number;
  reserved: number;
  incoming: number;
  reorderPoint: number;
}

export interface StockTransferLine {
  id: string;
  product: EntityRef;
  quantity: number;
  uom: string;
}

export interface StockTransfer {
  id: string;
  reference: string;
  type: 'Internal Transfer' | 'Issue' | 'Receipt';
  sourceWarehouse?: EntityRef;
  destinationWarehouse?: EntityRef;
  postingDate: string;
  status: DocumentStatus;
  lines: StockTransferLine[];
}

export interface PurchaseOrderLine {
  id: string;
  product: EntityRef;
  quantity: number;
  uom: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplier: EntityRef;
  orderDate: string;
  expectedDate?: string;
  warehouse?: EntityRef;
  currency: string;
  status: DocumentStatus;
  lines: PurchaseOrderLine[];
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  parentId?: string;
  isGroup: boolean;
  allowReconciliation: boolean;
  active: boolean;
}

export interface JournalLine {
  id: string;
  account: EntityRef;
  party?: EntityRef;
  description?: string;
  debit: number;
  credit: number;
  costCenter?: string;
}

export interface JournalEntry {
  id: string;
  reference: string;
  type: 'Journal Entry' | 'Opening Entry' | 'Contra' | 'Bank' | 'Cash' | 'Write-off' | 'Adjustment';
  postingDate: string;
  narration?: string;
  status: 'Draft' | 'Posted' | 'Reversed';
  lines: JournalLine[];
}

export interface SalesInvoiceLine {
  id: string;
  product: EntityRef;
  quantity: number;
  uom: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
}

export interface SalesInvoice {
  id: string;
  number: string;
  customer: EntityRef;
  issueDate: string;
  dueDate: string;
  currency: string;
  status: 'Draft' | 'Sent' | 'Unpaid' | 'Partly Paid' | 'Paid' | 'Overdue' | 'Cancelled';
  lines: SalesInvoiceLine[];
  paidAmount: number;
}

export interface PaymentAllocation {
  id: string;
  reference: EntityRef;
  outstanding: number;
  allocated: number;
}

export interface Payment {
  id: string;
  reference: string;
  type: 'Receive' | 'Pay' | 'Internal Transfer';
  party?: EntityRef;
  postingDate: string;
  amount: number;
  method: string;
  status: 'Pending' | 'Completed' | 'Failed';
  allocations: PaymentAllocation[];
}

export interface BusinessParty {
  id: string;
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  currency?: string;
  creditLimit?: number;
  active: boolean;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  submittedBy: EntityRef;
  expenseDate: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  receiptUrl?: string;
  costCenter?: string;
}

export interface PermissionMatrixRow {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  submit: boolean;
  approve: boolean;
  export: boolean;
}
