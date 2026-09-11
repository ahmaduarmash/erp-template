# Aster · ERP / SaaS workspace starter

A React 19 + Vite + TypeScript starter with Ant Design v5, Tailwind CSS v4, Motion, Recharts, and asset-free Web Audio feedback. Original visual identity; no second component kit or animation library.

## Run

Requires Node.js 24+ (tests use native TypeScript stripping).

```sh
npm ci
npm run dev
npm run build
npm test
```

Open the Vite URL. Login is **demo-only**: a valid email and any 8-character password enter the local workspace. Passwords are never stored or sent. Routes use a hash router so static hosts need no rewrite rules.

## Reskin in one file

Edit **`src/config/template.config.ts`**. It controls the brand name/logo/tagline, mode, primary/accent colors, radius, typography, density, content width, sidebar, motion, sound, and table defaults. An empty logo URL uses a generated text mark and config-colored SVG favicon. A custom logo URL should point to your supplied asset.

`ThemeProvider` composes Ant Design's default/dark and compact algorithms. Its resolved tokens are mirrored to root CSS variables; custom UI and charts consume those variables/config rather than a separate palette. Dark + compact is supported. The three allowed variable fonts—Inter, Manrope, Public Sans—are bundled via Fontsource and self-hosted with the application.

Appearance settings update the runtime configuration, **not the source file on disk**. Preferences are validated and persisted under `aster:preferences:v1:<userId>`. Mount `ThemeProvider` with a stable authenticated user ID and a React `key` when users change. Project brand identity is never restored from old browser preferences. Existing appearance overrides intentionally take priority over new defaults; use **Reset preferences** to see updated project defaults. Storage failures display a warning instead of breaking the UI. Backend preference sync is an integration point, not a supplied service.

## Add a CRUD module

1. Add a `ModuleDefinition` to `src/data/modules.ts`: a key, title, group, fields, and statuses.
2. Add a route wrapper, for example:

```tsx
import ModulePage from '../ModulePage';
export default function Projects() {
  return <ModulePage moduleKey="projects" />;
}
```

3. Register it with `lazy(() => import(...))` in `App.tsx`. Navigation derives from module definitions.
4. Replace `WorkspaceProvider`'s local adapter with your API; keep the view/component contracts. For custom workflows, compose `DataTable`, `CrudModal` / `CrudDrawer`, `ConfirmPopover`, and `PageHeader` directly.

`DataTable` includes text search, schema-driven column filters/sorting, pagination, selection, confirmed batch deletion, column visibility, details/edit/delete actions, and CSV export. Export includes the filtered/sorted set (or its selected subset), not just the current page. CSV cells are quoted and protected against spreadsheet-formula injection. It is CSV export, not a native XLSX generator.

## Included pages

- Shell: branded demo login, collapsible navigation, mobile navigation, global page search (Cmd/Ctrl+K), notifications, theme toggle, profile menu, breadcrumbs, and closeable route tabs.
- Dashboard: local record totals, explicitly illustrative historical trends, area/bar/donut charts, sparklines, and recent activity.
- System: notifications, filterable audit log, users, configurable role/action matrix, profile, password form validation, appearance with live preview, table/notification/general settings.
- Inventory: products, stock levels, warehouses, transfers, purchase orders, suppliers.
- Accounting: chart of accounts, two-line journals, invoices, payments, expenses, customers.

All example modules use the same CRUD kit and save changes to this browser. Mutations append audit events. Initial data is fictional.

## Production integration boundary

This is a **frontend starter**, not an audited accounting engine or a deployed multi-tenant backend. Before using real data:

- Replace demo login/session storage with your identity provider and secure server sessions. Implement password change server-side. The sample password screen only validates; it does not claim to change credentials.
- Enforce tenant scope and permissions on every API operation. The role matrix is editable example configuration, not a client-side security boundary.
- Replace device-local records with an authenticated API, concurrency control, server validation, server timestamps, and durable append-only audit storage. Never place secrets in Vite environment variables or browser storage.
- Implement inventory movements/reservations, purchase receiving, invoice line items/taxes, payment settlement, and balanced ledger posting in transactional backend workflows. Changing a sample status currently changes that record only.
- Replace sample dashboard trends with real aggregates. Currency selection changes the reporting label, not exchange rates.
- Wire an authenticated notification stream into the notification adapter; no background notification service is included.
- Add real accessible error/retry states to API-backed queries and use the provided skeleton while loading.

## Performance, motion, sound

- Every route is lazy-loaded. Recharts and Motion implementations use dynamic imports; the chart library is not on the login path. Do not eagerly import them into the root shell.
- Tables automatically use Ant Design virtual scrolling above 200 matching records, with numeric `scroll.x/y`. Pagination remains available. Use server pagination/search for truly large datasets; do not download an entire production database.
- Memoize columns, selection configuration, and hot callbacks. Keep row IDs stable. Animate only a bounded set of rows and skip row staggering on virtualized sets.
- Shared Motion surfaces animate transform/opacity and use `layout` for geometry. Modal/drawer frames handle enter/exit. Ant Design's independent motion is disabled to avoid a second uncontrolled animation path.
- The central motion policy requires the runtime enable flag **and** no OS reduced-motion request. OS reduced motion is always a hard veto, even if `respectReducedMotion` is set false. Recharts' own animations are disabled. CSS also honors reduced motion.
- Web Audio uses one reusable context, tiny sine envelopes, throttling, and disconnected oscillator nodes. It runs only after a user gesture; errors never delay an action. Master mute, volume, and category controls live in Appearance. No audio files or audio libraries are shipped.
- Optional feature-detected WebMCP exposes read-only access to the same demo records; unsupported browsers simply skip registration.

## Structure

```text
src/
  config/template.config.ts
  theme/                     # validation, Ant Design provider, CSS token sync
  components/
    shell/                   # sidebar, topbar, headers, tabs
    data/                    # reusable CRUD kit
    feedback/                # toast/sound pairing, empty state, skeleton
    charts/                  # lazy Recharts widgets
  data/                      # schemas, fictional seed, replaceable local adapter
  lib/
    motion/                  # policy, lazy surfaces and dialog frames
    sound/                   # synth and hook
  pages/
    inventory/
    accounting/
    system/
tests/core.test.mjs           # config safety, CSV safety, schemas, constraints
```

## Verification

`npm run build` runs strict TypeScript checking and a Vite production build. `npm test` checks config validation, safe CSV handling, all seed schemas, and sample business constraints. A 5,000-record fixture checks unique IDs; it is **not a browser performance benchmark**. Browser visual, accessibility, WebMCP runtime, and frame-rate QA have not been performed in this delivery. Run those checks against your target devices before production release.
