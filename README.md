# Aster · ERP / SaaS workspace starter

A production-oriented React 19 + Vite + TypeScript ERP/SaaS frontend starter using Ant Design v5, Tailwind CSS v4, Motion, Recharts, and asset-free Web Audio feedback.

The v2 architecture keeps one visual language while allowing different business objects to use the correct ERP interaction model. Simple masters may use the generic CRUD kit; financial documents, inventory operations, trees, analytics, and security screens use dedicated floorplans.

## Run

Requires Node.js 24+.

```sh
npm ci
npm run dev
npm run build
npm test
```

CI runs tests plus the strict TypeScript/Vite production build on every push and pull request.

## Reskin in one file

Edit `src/config/template.config.ts` to change brand identity, colors, radius, typography, density, content width, sidebar behavior, motion, sound, and table defaults.

`ThemeProvider` resolves those settings into Ant Design tokens and CSS variables. Project features consume that shared token layer instead of introducing their own palettes.

## ERP floorplans

The route registry in `src/config/routes.ts` classifies pages by interaction model:

- `CRUD` — small/simple reference masters
- `MASTER_DETAIL` — rich business entities such as Products, Customers, Suppliers
- `DOCUMENT` — transaction documents such as Purchase Orders, Stock Transfers, Journal Entries, Invoices, Payments
- `TREE` — hierarchical structures such as Chart of Accounts and Warehouses
- `ANALYTICAL` — operational/derived views such as Stock Levels and Audit Log
- `SECURITY` — users, roles, permissions, and scoped access
- `CUSTOM` — dashboards, approvals, settings, or workflows that do not fit another floorplan

Consistency means the same typography, spacing, tokens, badges, menus, workflow language, tables, drawers and motion — not identical page structure.

## Included v2 workspaces

### Inventory

**Products**
- product/entity cells rather than plain text rows
- stock/reorder progress
- inventory value KPIs
- dedicated product detail drawer with Overview, Inventory, Pricing and Activity tabs
- product-specific row actions: adjust stock, transfer stock, ledger, archive
- product form split into General, Inventory and Pricing sections

**Stock levels**
- read/operational availability workspace rather than editable CRUD
- actual, reserved, incoming, available, projected and reorder columns
- All / Low stock / Out of stock quick views
- stock-ledger, adjustment, transfer and replenishment actions

**Warehouses**
- hierarchical tree workspace
- internal Receiving / Storage / Dispatch locations
- selected-warehouse operational detail pane
- stock, ledger, transfer and child-location actions

**Stock transfers**
- multi-line inventory document
- source and destination warehouses
- item/UOM/quantity rows
- Draft → In transit → Received workflow
- contextual receive, print and cancel actions

**Purchase orders**
- multi-line purchasing document
- supplier, dates, destination warehouse and item grid
- quantity/rate/discount/tax inputs
- receipt progress and contextual Send / Receive / Bill / Duplicate / Cancel actions

**Suppliers**
- business-party master/detail workspace
- purchasing context, outstanding PO value, contacts, related orders and activity

### Accounting

**Chart of accounts**
- tree-style account workspace
- account code/type/parent context
- group vs posting-account behavior in the UI
- reconciliation and active toggles
- ledger, add-child, edit and deactivate actions

**Journal entries**
- arbitrary multi-line debit/credit editor
- balance validation before save
- entry type selector
- Draft → Posted → Reversed workflow
- quick two-line journal plus full journal editor
- contextual post, ledger, duplicate and reverse actions

**Sales invoices**
- customer billing document with line items
- quantity/rate/discount/tax inputs
- outstanding balance column
- Draft / Sent / Paid / Overdue quick views
- send, record-payment, credit-note, PDF and ledger actions

**Payments**
- Receive / Pay / Internal Transfer modes
- party/account selection
- payment method and posting date
- outstanding invoice allocation table for party payments

**Expenses**
- approval queue rather than generic CRUD
- My expenses / Pending / Approved / Rejected / All views
- approve, reject, request-changes and approval-history actions

**Customers**
- business-party master/detail workspace
- receivable, overdue and credit-limit context
- contacts/addresses, invoices, payments and activity tabs

### System

**Team & access**
- user list with role, scope, 2FA, last-active and lifecycle state
- contextual invite/session/suspend/audit actions
- role permission matrix including View/Create/Edit/Delete/Submit/Approve/Export
- scoped access examples for companies, warehouses, departments and customer groups

**Dashboard**
- operational queues for receivables, purchasing, approvals and low stock
- charts and recent activity remain part of the shared dashboard shell

## Shared ERP primitives

`src/components/erp/ErpPrimitives.tsx` provides reusable domain UI building blocks:

- `DomainTable`
- `EntityCell`
- `MoneyCell`
- `SemanticStatus`
- `ActionMenu`
- `KpiStrip`
- `QuickViews`
- `WorkflowBar`
- `StockProgress`
- `DocumentSummary`

Row actions follow a SaaS/ERP pattern: frequent contextual actions may stay visible while secondary/destructive actions move to the overflow menu.

Lifecycle/status transitions such as Posted, Received or Paid are modeled as explicit actions; switches are reserved for safe boolean configuration such as Active, Group account or Allow reconciliation.

## Typed domain contracts

`src/data/domain.ts` defines typed contracts for:

- Product / Warehouse / StockBalance
- StockTransfer / StockTransferLine
- PurchaseOrder / PurchaseOrderLine
- Account
- JournalEntry / JournalLine
- SalesInvoice / SalesInvoiceLine
- Payment / PaymentAllocation
- BusinessParty
- Expense
- PermissionMatrixRow

The current fictional demo adapter still projects local records into the screens so the starter remains immediately runnable. Production implementations should persist the typed document models server-side.

## Authentication and authorization boundary

`src/auth/AuthProvider.tsx` replaces direct session logic in `App.tsx` with an adapter boundary.

The included adapter is still intentionally demo-only. Replace it with your identity/session provider in a real project. The route registry includes permission identifiers; production applications must enforce the same permissions and tenant scope on the backend.

## Data/repository boundary

`src/data/repository.ts` defines the production repository contract for querying and mutating ERP entities with support for search, filters, paging and sorting.

`WorkspaceProvider` remains the fictional local/demo adapter. A real project should replace it with authenticated API-backed repositories that provide:

- tenant scope on every query/mutation
- server-side validation
- transactions for accounting/inventory workflows
- optimistic concurrency/version checks
- server timestamps
- durable append-only audit storage
- server pagination/search/filtering

Never rely on client-side permission checks as a security boundary.

## Generic CRUD remains available

`src/pages/ModulePage.tsx` and the existing CRUD modal/drawer/table kit remain available for small reference masters where a specialized workflow would add no value.

Use generic CRUD for entities such as categories, units, regions, designations, vehicle types or other small lookup tables.

Do not force transactional or hierarchical business objects into this pattern.

## Production accounting/inventory boundary

This repository is a frontend starter, not an audited accounting engine or inventory ledger.

Before connecting real business data, implement server-side transactional workflows for:

- inventory movements and reservations
- receiving and stock valuation
- balanced ledger posting
- immutable/reversible posted accounting entries
- invoice taxes, payments and credit notes
- payment allocation/reconciliation
- approval authorization
- document locking/versioning

Changing a local demo status is illustrative UI behavior only.

## Performance and UX

- Routes remain lazy loaded.
- Existing generic tables virtualize large local result sets.
- Production adapters should use server paging/search for large data volumes.
- Motion follows the central motion policy and OS reduced-motion preference.
- ERP-specific layout rules live in `src/erp.css` instead of expanding the global stylesheet further.
- Responsive fallbacks collapse split views, KPI strips and line editors for smaller screens.

## Structure

```text
src/
  auth/
    AuthProvider.tsx
  config/
    template.config.ts
    routes.ts
  theme/
  components/
    shell/
    data/
    erp/
      ErpPrimitives.tsx
    feedback/
    charts/
  data/
    domain.ts
    modules.ts
    repository.ts
    WorkspaceProvider.tsx
  pages/
    erp/
      InventoryWorkspaces.tsx
      AccountingWorkspaces.tsx
      SecurityWorkspace.tsx
    inventory/
    accounting/
    system/
  lib/
  erp.css
  styles.css
```

## Verification

`npm run build` performs strict TypeScript checking followed by the Vite production build. `npm test` validates configuration safety, CSV safety, seed integrity, business constraints, large-row identity behavior, and ERP floorplan classification for critical routes.

Browser visual QA, accessibility QA and backend integration testing still need to be performed by each project against its supported devices and APIs.
