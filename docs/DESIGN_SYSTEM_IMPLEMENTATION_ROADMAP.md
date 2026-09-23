# ERP Template v2.0 — Enterprise SaaS Design System Implementation Roadmap

> **Status:** Active implementation document  
> **Branch:** `v2.0`  
> **Last reviewed:** 2026-09-23  
> **Purpose:** Living implementation plan for evolving `erp-template` into a polished, runtime-customizable, production-grade SaaS/ERP design system and workspace shell.

---

## 1. Product Goal

The target is not a replica of any reference interface. The target is a reusable enterprise product language that borrows proven interaction principles while remaining brand-neutral, configurable at runtime, maintainable, accessible, and suitable for multiple ERP/SaaS products.

The finished starter must feel:

- professional rather than decorative,
- fast rather than animated for animation's sake,
- information-dense without feeling cramped,
- visually calm but not flat,
- domain-aware rather than generic CRUD,
- highly customizable without rebuilds or reloads,
- consistent across modules while allowing each business workflow to behave correctly.

Core product principle:

> **Every page should look like it belongs to the same product, while behaving like the business object it represents.**

---

## 2. Design System Constitution

These rules are non-negotiable unless a later implementation decision is explicitly documented here.

1. Stable shell, dynamic workspace.
2. Neutral base UI, semantic color.
3. No decorative gradients. Depth comes from solid surfaces, borders, and controlled elevation.
4. Theme-sensitive values come from runtime design tokens.
5. Icons live inside meaningful affordances; decorative icon noise is avoided.
6. Small/medium create and edit flows use focused centered modals.
7. Inspect/review existing records uses right-side drawers.
8. Complex transactions use dedicated full-page document workspaces.
9. Confirmation happens as close as possible to the initiating action.
10. Overlay exits are faster than entries.
11. Motion explains change; it does not decorate the interface.
12. Users should not lose list/filter context simply to inspect a record.
13. One runtime token system controls CSS, Tailwind utilities, and Ant Design.
14. Feature components consume shared primitives instead of inventing visual rules.
15. Dark-mode hierarchy does not depend on heavy shadows.
16. Professional density comes from hierarchy and spacing discipline, not oversized controls.
17. Frequent row actions are icon-first; uncommon actions live in an overflow menu with icon + text.
18. Color communicates identity, state, category, or risk—never random decoration.
19. Domain behavior determines screen structure; one generic CRUD floorplan must not replace accounting, purchasing, inventory, workflow, or hierarchy UX.
20. CI is an implementation gate. Major phases must not be stacked on a knowingly failing build.

---

## 3. Architecture Target

The theme/design flow remains:

```text
Project defaults
(template.config.ts)
        ↓
User preferences
(local persistence now / backend later)
        ↓
resolved runtime configuration
        ↓
Primitive tokens
        ↓
Semantic tokens
        ↓
Component/layout/motion tokens
        ↓
┌────────────────┬────────────────┬────────────────┐
│ CSS variables  │ AntD theme     │ Tailwind v4    │
│ runtime        │ ConfigProvider │ @theme inline  │
└────────────────┴────────────────┴────────────────┘
        ↓
Shared primitives and interaction surfaces
        ↓
Reusable ERP floorplans
        ↓
Domain modules
```

Existing reusable foundations such as `template.config.ts`, `ThemeProvider`, route registry, repository boundaries, and domain workspaces should be evolved rather than rewritten without evidence.

---

## 4. Interaction Decision Matrix

| Intent | Default surface |
| --- | --- |
| Create a small/medium record | Centered modal |
| Edit a small/medium record | Centered modal |
| Inspect an existing record | Right-side drawer |
| Review / approval | Right-side drawer with workflow context |
| Small destructive/important confirmation | Contextual popover near the action |
| Complex business document | Dedicated full-page document workspace |
| Complex configuration / hierarchy | Dedicated workspace or tree/detail floorplan |

Complex-document examples include Journal Entry, Purchase Order, Sales Invoice, Stock Transfer, and complex payment allocation.

Do not stack a generic edit modal over a detail drawer unless a domain case explicitly requires it. Prefer closing the inspection drawer and opening the edit modal while preserving the underlying list/query context.

---

## 5. Motion Contract

Motion must feel fast at both supported speed tiers.

| Interaction | Fast | Normal |
| --- | ---: | ---: |
| Micro hover / toggle | 80–100ms | 120–150ms |
| Standard dropdown / card | 120–150ms | 180–200ms |
| Modal / drawer enter | 150ms | 200ms |
| Modal / drawer exit | 100ms | 140ms |
| Tab / page switch | 100ms | 150ms |

Rules:

- exit is faster than entry,
- avoid routine 300–500ms UI animation,
- use high-stiffness/high-damping springs with minimal overshoot,
- respect OS `prefers-reduced-motion`,
- runtime Motion Speed affects the application live,
- normal filtering, paging, or refresh must not replay decorative row staggers.

Default spring contract:

```ts
{ stiffness: 500, damping: 35 }
```

---

## 6. ERP Floorplan Vocabulary

The application has one visual language and several reusable floorplans:

- **Master List** — products, customers, suppliers, employees, warehouses.
- **Master + Detail** — list context with an inspection drawer.
- **Tree Workspace** — Chart of Accounts and other hierarchies.
- **Analytical Workspace** — stock levels, dashboards, derived read-heavy data.
- **Document Workspace** — journal entries, purchase orders, invoices, transfers.
- **Approval / Workflow Workspace** — routed decisions and audit trails.
- **Security Workspace** — users, roles, permissions, access policy.

A Purchase Order must feel like purchasing software. A Journal Entry must feel like accounting software. Chart of Accounts must behave like a hierarchy. Stock Levels must behave like derived inventory data.

---

## 7. Progress Tracking

Statuses:

- `[ ]` not started
- `[-]` in progress
- `[x]` complete
- `[!]` blocked / decision required

A phase is complete only when its exit criteria pass and validation is recorded.

| Phase | Area | Status |
| --- | --- | --- |
| 1 | Runtime Design Token Engine | [x] |
| 2 | Motion & Feedback Engine | [x] |
| 3 | Enterprise Workspace Shell | [x] |
| 4 | Core Visual Primitives | [x] |
| 5 | Overlay & Interaction Architecture | [x] |
| 6 | Enterprise Data Workspace | [x] |
| 7 | Workflow / Approval System | [x] |
| 8 | Settings & Live Theme Studio | [ ] |
| 9 | ERP Floorplan / Module Migration | [ ] |
| 10 | QA, Accessibility & Design-System Enforcement | [ ] |

---

# Phase 1 — Runtime Design Token Engine

## Objective

Make the runtime theme engine the single source of truth before further screen-specific styling.

## Required token families

- generated primary and accent shade scales,
- neutral + success/warning/danger/info/category palettes,
- semantic background/text/border/action/focus roles,
- density-aware spacing scale,
- runtime radius scale,
- runtime typography scale,
- light/dark elevation strategy,
- layout dimensions for rail/nav/header/tabs/content/controls/tables/drawers.

## Completed work

- [x] Token type model
- [x] Shade-scale generator
- [x] Semantic light mapping
- [x] Semantic dark mapping
- [x] Spacing/density derivation
- [x] Radius derivation
- [x] Typography derivation
- [x] Elevation derivation
- [x] Layout derivation
- [x] ThemeProvider integration
- [x] `resolveConfig` integration
- [x] AntD mapping
- [x] Tailwind v4 mapping
- [x] Decorative gradient removal
- [x] Shared CSS raw-theme-color cleanup
- [x] Token tests

## Implementation record — 2026-09-23

- Runtime token resolver lives under `src/theme/tokens/` and emits the CSS variables consumed by CSS, Tailwind, and Ant Design.
- Primary/accent scales derive from runtime-selected colors.
- Light/Dark/System is the supported mode contract.
- User-facing `spacious` density was removed; legacy stored `spacious` values migrate to `comfortable`.
- Compatibility CSS aliases remain only to support incremental migration of older modules.
- Shared CSS has automated guards against decorative gradients and raw theme hex values.
- Existing feature CSS may retain domain layout rules but not a separate theme system.

## Exit criteria

- [x] Primary/accent/mode/font/text-size/density/radius/content-width changes apply at runtime.
- [x] No decorative gradient backgrounds in shared runtime styling.
- [x] Tests and production build pass.

**Status: [x] Complete.**

---

# Phase 2 — Motion & Feedback Engine

## Objective

Create one motion/feedback language for the product.

## Completed work

- [x] Runtime motion timing matrices
- [x] `useMotionTokens()`
- [x] `AnimatedModal`
- [x] `AnimatedDrawer`
- [x] `AnimatedPopover`
- [x] `AnimatedDropdown`
- [x] `PageTransition`
- [x] `TabTransition`
- [x] restrained press interaction
- [x] insertion/removal transition support
- [x] OS reduced-motion veto
- [x] runtime Motion Speed integration
- [x] subtle synthesized Web Audio feedback retained without audio assets

## Implementation record — 2026-09-23

- Motion tokens are resolved through the same runtime theme system and emitted as CSS variables.
- AntD motion, Motion for React, and CSS transitions share the effective reduced-motion state.
- Modal and drawer transitions are intentionally distinct while sharing timing policy.
- Routine table-row stagger animation was removed.
- Existing sound defaults remain subtle and opt-in/low-volume.

## Exit criteria

- [x] Shared motion timing; feature code does not invent routine durations.
- [x] Consistent overlay enter/exit behavior.
- [x] Normal mode feels fast.
- [x] OS reduced-motion respected.
- [x] Button feedback tactile without bounce-heavy motion.

**Status: [x] Complete.**

---

# Phase 3 — Enterprise Workspace Shell

## Objective

Provide a stable, scalable ERP shell capable of supporting many modules without becoming visually noisy.

## Required shell anatomy

```text
App shell
├── Business-area rail
├── Secondary navigation
├── Workspace header
├── Workspace tabs
└── Route workspace
```

## Completed work

- [x] Business-area rail
- [x] Secondary navigation by selected area
- [x] Compact workspace header
- [x] Global search trigger / command affordance
- [x] Runtime theme/reduced-motion-aware shell behavior
- [x] Workspace tabs
- [x] Route-driven title/description/icon metadata
- [x] Responsive collapse behavior
- [x] Token-driven shell dimensions
- [x] Removal of competing legacy shell implementation

## Exit criteria

- [x] Shell scales to many ERP modules.
- [x] Current location is unambiguous.
- [x] Navigation groups remain domain-oriented.
- [x] No second page-specific shell system.

**Status: [x] Complete.**

---

# Phase 4 — Core Visual Primitives

## Objective

Establish a reusable visual vocabulary before additional module migration.

## Completed primitives

- [x] `Surface`
- [x] `IconChip`
- [x] `StatCard`
- [x] `StatusPill`
- [x] `ActionIcon`
- [x] `OverflowMenu`
- [x] `FilterBar`
- [x] `EmptyState`
- [x] `SectionHeader`
- [x] `EntityCell`
- [x] `MoneyCell`
- [x] `ProgressCell`
- [x] `QuickFilterTabs`
- [x] `Metric`
- [x] `ObjectHeader`
- [x] `CommandBar`

## Rules

- Primitives consume runtime semantic tokens.
- Compatibility wrappers may delegate to primitives while older modules migrate.
- Frequent actions use icon-first controls with tooltips.
- Less-common actions use overflow menus with icon + text.
- Semantic status color is restrained; dashboards must not become rainbow grids.

## Exit criteria

- [x] Shared primitives exist and are token-driven.
- [x] Core visual patterns no longer require page-specific styling systems.
- [x] Automated source/CSS guards cover the shared vocabulary.

**Status: [x] Complete.**

---

# Phase 5 — Overlay & Interaction Architecture

## Objective

Make overlay choice predictable so developers do not invent per-page CRUD behavior.

## Shared surfaces

- [x] `CreateModal`
- [x] `EditModal`
- [x] `RecordDrawer`
- [x] `ApprovalDrawer`
- [x] `ConfirmActionPopover`

## Required behavior

### Modal

- centered,
- clear icon/title/description hierarchy,
- contained scroll region for longer forms,
- stable footer actions,
- runtime width/radius/spacing/motion,
- create/edit intent is explicit.

### Record drawer

- opens from the right,
- object header and status context,
- sticky toolbar/close affordance,
- optional footer actions,
- body supports overview/activity/related content,
- closes without losing table query context.

### Approval drawer

- record context,
- workflow/routing context,
- decision affordances remain subordinate to review information,
- audit/history region can be composed without a second overlay system.

### Confirmation

- contextual popover close to action,
- concise impact copy,
- destructive action visually differentiated,
- no unnecessary confirmation modals for small actions.

## Implementation record — 2026-09-23

- `src/components/overlays/index.tsx` provides all intent-specific surfaces and delegates animation to Phase 2 `Animated*` primitives.
- `src/components/overlays/overlays.css` defines token-driven overlay anatomy without raw theme colors or decorative gradients.
- `CrudModal`, `CrudDrawer`, and `ConfirmPopover` remain migration adapters; they delegate to the shared overlay contract rather than maintaining another visual system.
- `CrudModal` now accepts explicit `intent: 'create' | 'edit'`; title parsing remains only as a backward-compatible fallback for legacy callers.
- Products validates the intended master-data path: list → inspection drawer → edit modal, preserving list context.
- Phase 5 contract tests cover required exports, animated-surface reuse, layout-token consumption, and compatibility intent handling.
- An initial test assertion incorrectly looked for drawer-width variables in CSS; CI caught the test defect. The assertion was corrected to validate drawer tokens where they are actually consumed in the overlay source.

## Validation

- `Validate starter` run **35843068978**: tests + production build passed.
- `Deploy v2.0 preview` run **35843069024**: preview build + Pages deployment passed.

## Exit criteria

- [x] Developers can choose the appropriate surface from intent without inventing behavior.
- [x] Create/edit/inspect/approval/confirmation have shared anatomy.
- [x] Runtime motion/reduced-motion behavior remains centralized.
- [x] Compatibility paths delegate to the shared architecture.
- [x] CI and Pages gate pass.

**Status: [x] Complete.**

---

# Phase 6 — Enterprise Data Workspace

## Objective

Replace generic CRUD-table behavior with a reusable enterprise master-data workspace contract while preserving domain-specific row content and actions.

## Required capabilities

- [x] Sticky table header
- [x] Search
- [x] Structured filters
- [x] Reset filters
- [x] Refresh
- [x] Export
- [x] Column visibility
- [x] Sorting
- [x] Pagination
- [x] Client mode
- [x] Server-mode query interface
- [x] URL-backed query state
- [x] Optional saved views
- [x] Meaningful bulk selection only when bulk actions exist
- [x] Row overflow/action composition
- [x] Record-drawer integration
- [x] Empty state
- [x] Loading state
- [x] Error state
- [x] Large-client-list virtualization support

## Architecture decision

`EnterpriseDataTable` is the forward master-data table contract. `DataTable` and `DomainTable` are legacy/migration surfaces and should be progressively delegated to or replaced by `EnterpriseDataTable`; they must not evolve into separate table design systems.

The contract intentionally separates:

```text
Data presentation
        +
Query state
        +
Client/server data mode
        +
Domain-provided columns/filters/actions
```

This allows the same workspace shell to support local demo data today and API-backed pagination/filtering later without rewriting screen UX.

## Implementation record — 2026-09-23

- Added `src/components/data/EnterpriseDataTable.tsx` as a generic typed workspace for records with stable IDs.
- Query state includes search, page, page size, sort field/order, and structured filter values.
- Query state can be reflected into the route through namespaced `useSearchParams`, preserving workspace context across inspection/edit/navigation.
- Server mode exposes `onQueryChange` + `total`; client mode performs local search/filtering and virtualizes larger result sets.
- Column visibility uses the shared animated dropdown and current runtime table preferences.
- Export uses the shared CSV helper and exports selected rows when meaningful selection exists, otherwise the current result set.
- Bulk selection is not shown unless the screen supplies domain-valid bulk actions.
- Loading/error/empty handling is part of the component contract rather than improvised page markup.
- Products was migrated as the real-screen validation target and retains its domain-specific KPI strip, entity cells, stock progress, action menu, inspection drawer, and create/edit modal behavior.
- Added automated contract tests for the enterprise data workspace and Products composition.
- Initial implementation exposed an Ant Design grouped-column typing edge during export; CI stopped the batch, and export key resolution was corrected with a narrow type guard before page migration continued.

## Validation

- Foundation build after type fix: `Validate starter` run **35843608209** passed.
- Products migration: `Validate starter` run **35843739458** passed.
- Contract-test head: `Validate starter` run **35843939296** passed.
- Contract-test preview: `Deploy v2.0 preview` run **35843939328** passed build and Pages deployment.

## Exit criteria

- [x] A normal master-data page no longer needs to behave like a generic CRUD generator.
- [x] Query/filter/page context can survive record inspection and route transitions.
- [x] Server-backed screens can adopt the same interaction contract without replacing the component.
- [x] Row actions and bulk actions remain domain-defined.
- [x] CI and Pages gate pass.

**Status: [x] Complete.**

---

# Phase 7 — Workflow / Approval System

## Objective

Create a reusable workflow floorplan for routed reviews/approvals without coupling it to a single domain.

## Target capabilities

- [x] Workflow status model (draft/pending/forwarded/approved/rejected/settled or domain-mapped equivalents)
- [x] Approval route/timeline primitive
- [x] Current-stage emphasis
- [x] Actor/role/context display
- [x] Decision history / audit trail
- [x] `ApprovalDrawer` real-screen integration
- [x] Approve / reject / forward / pull-to-desk action composition
- [x] Mandatory-reason support for destructive or exception decisions
- [x] Contextual confirmations where appropriate
- [x] Permission-aware action visibility contract
- [x] Empty/loading/error behavior
- [x] Fast state-change motion without decorative timeline animation
- [x] Responsive drawer/workspace behavior
- [x] Tests for workflow state transitions and action visibility

## UX rules

- Review information comes before decision controls.
- Status and current routing stage must be obvious without relying on color alone.
- Timeline/history should distinguish completed, current, waiting, rejected, and exceptional states.
- Approval actions belong in the review drawer unless the domain requires a full document workspace.
- A user should be able to review, decide, close, and continue the originating list without losing context.

## Architecture decision

Workflow domain state is separated from the presentation layer. `src/workflow/model.ts` owns normalized statuses, legal transitions, permission filtering, and persisted audit-history parsing/serialization. Shared workflow UI consumes that contract rather than encoding expense-specific transition rules.

`Expenses` is the real-screen validation target because it is already a review/approval domain and can prove the list → review drawer → decision pattern without forcing a complex document redesign. Existing demo records remain backward compatible: when no persisted workflow history exists, the screen derives a safe initial route/history from the existing record status. New decisions persist `workflowOwner` and serialized `workflowHistory` through the existing demo repository boundary; production projects can replace that persistence with an API-backed workflow adapter without changing the interaction floorplan.

## Implementation record — 2026-09-23

- Added `src/workflow/model.ts` with normalized `draft`, `pending`, `forwarded`, `approved`, `rejected`, and `settled` states plus guarded transitions for submit, claim, forward, return, approve, reject, and settle.
- Hardened `src/components/workflow/` into reusable route, summary, audit-trail, and decision primitives with loading/error/empty states.
- Added current-stage emphasis with semantic text and `aria-current`; state meaning does not depend on color alone.
- Added actor/role/context and chronological decision history with recorded reasons.
- Moved mandatory rejection/return reasons into a contextual animated popover; empty reasons cannot be submitted.
- Permission-aware decisions delegate to the existing `auth.can()` contract instead of inventing a workflow-specific permission engine.
- Fixed a confirmation-path defect discovered during integration: confirm-wrapped workflow actions no longer execute on the initiating button click; they execute only after the contextual confirmation is accepted.
- Migrated Expenses from direct table mutations to a review-first `ApprovalDrawer`; record evidence and workflow context appear before footer decision controls.
- Added centered `CreateModal` expense submission, preserving the interaction matrix for small/medium creation.
- Added pull-to-desk ownership, forward/return routing, approval/rejection, settlement, persisted owner/history, and safe compatibility history for existing seeded records.
- Workflow styling remains token-driven, responsive, gradient-free, and without decorative timeline animation; overlay motion continues to use Phase 2 runtime/reduced-motion behavior.
- Added `tests/workflow.test.mjs` covering state transitions, permission-aware visibility, audit-history recovery, shared primitive contracts, Expense integration, and workflow CSS enforcement.

## Validation

- Local isolated workflow-model TypeScript check passed before repository write.
- `Validate starter` run **35847480072**: `npm test` and `npm run build` passed.
- `Deploy v2.0 preview` run **35847480106**: tests, preview build, artifact upload, and GitHub Pages deployment passed.

## Exit criteria

- [x] A reusable workflow screen expresses routed decisions and current responsibility without module-specific overlay behavior.
- [x] Audit context, actor, status, current stage, and decision reasons are visible in the review flow.
- [x] Decisions can be completed without losing the originating list context.
- [x] Permission filtering, transition legality, loading/error/empty states, responsive behavior, and confirmation semantics are covered.
- [x] CI and Pages gate pass.

**Status: [x] Complete.**

---

# Phase 8 — Settings & Live Theme Studio

## Objective

Make runtime customization feel like a product feature rather than a developer configuration panel.

## Target sections

- [ ] Brand
- [ ] Theme mode
- [ ] Primary/accent color
- [ ] Typography
- [ ] Text size
- [ ] Density
- [ ] Radius
- [ ] Content width
- [ ] Motion speed
- [ ] Reduced-motion/effective policy indication
- [ ] Sound master/category/volume controls
- [ ] Table defaults
- [ ] Reset-to-project-defaults
- [ ] Live preview where useful

## Requirements

- Changes apply without rebuild/reload.
- Settings continue to resolve through the same runtime config/token engine; the studio must not create a second theme model.
- Controls use shared primitives and accessible labels/help text.
- Invalid/stale persisted values remain safely recoverable through `resolveConfig`.
- Dark/light preview hierarchy must be professional in both modes.

## Exit criteria

A project can be broadly reskinned and density/motion/typography behavior changed live through Settings without feature code changes.

**Status: [ ] Not started.**

---

# Phase 9 — ERP Floorplan / Module Migration

## Objective

Migrate every module to the shared system while preserving correct domain behavior.

## Migration order

1. [ ] Remaining simple master-data modules → Master List / Master + Detail
2. [ ] Customers / suppliers / employees / warehouses → Master + Detail where inspection matters
3. [ ] Chart of Accounts → Tree Workspace
4. [ ] Stock Levels → Analytical Workspace
5. [ ] Stock Transfers → Document Workspace
6. [ ] Purchase Orders → Document Workspace
7. [ ] Sales Invoices → Document Workspace
8. [ ] Journal Entries → Accounting Document Workspace
9. [ ] Users / roles → Security Workspace
10. [ ] Dashboard / reports → Analytical Workspace

## Migration rules

- Do not blindly wrap every module in `EnterpriseDataTable`.
- Reuse Phase 4 primitives, Phase 5 interactions, Phase 6 data-workspace behavior, and Phase 7 workflow patterns as appropriate.
- Remove superseded CSS/components as migrations complete.
- Do not maintain page-specific design systems.
- Domain correctness takes precedence over visual uniformity.
- Complex documents must expose line items, totals, status, actions, and document context as first-class information.
- Derived data such as stock balances must not look editable like a master record.

## Exit criteria

Every routed module has an explicit floorplan classification and no important domain has been reduced to generic CRUD behavior.

**Status: [ ] Not started.**

---

# Phase 10 — QA, Accessibility & Design-System Enforcement

## Objective

Make the system resilient enough to remain consistent as new projects and modules are added.

## Required QA matrix

### Theme / runtime

- [ ] Light
- [ ] Dark
- [ ] System
- [ ] Runtime primary/accent changes
- [ ] Runtime typography changes
- [ ] Compact/comfortable density
- [ ] Radius/content width changes
- [ ] Fast/normal motion
- [ ] OS reduced motion

### Responsive

- [ ] Desktop wide
- [ ] Desktop constrained
- [ ] Tablet
- [ ] Mobile/narrow shell fallback where supported
- [ ] Modal/drawer/table overflow behavior

### Accessibility

- [ ] Keyboard navigation
- [ ] Visible focus
- [ ] Tooltip/aria labels for icon-only actions
- [ ] Semantic labels for status beyond color
- [ ] Modal/drawer focus management
- [ ] Escape/close behavior
- [ ] Form errors associated to controls
- [ ] Sufficient contrast in light and dark modes
- [ ] Reduced-motion behavior

### Data/workflow

- [ ] Empty
- [ ] Loading
- [ ] Error
- [ ] Large lists
- [ ] Long labels/values
- [ ] Bulk selection
- [ ] URL query restoration
- [ ] Server-mode query contract
- [ ] Approval exception/rejection flows

### Enforcement

- [ ] Automated no-decorative-gradient guard remains active
- [ ] Automated raw shared-theme-color guard remains active
- [ ] Shared-primitives contract tests
- [ ] Overlay contract tests
- [ ] Enterprise-data-workspace contract tests
- [ ] Workflow contract tests
- [ ] Route/floorplan metadata tests
- [ ] TypeScript build
- [ ] GitHub Actions
- [ ] GitHub Pages preview

## Exit criteria

The starter can be cloned into a new ERP/SaaS project and extended without developers needing to recreate layout, styling, motion, table, overlay, or workflow rules.

**Status: [ ] Not started.**

---

## 8. Validation Policy

After every logical implementation batch:

1. run automated tests,
2. run the TypeScript/Vite production build,
3. inspect CI,
4. fix failures before stacking another major stage,
5. inspect light/dark implications,
6. inspect responsive implications,
7. inspect reduced-motion implications when motion is touched,
8. verify the `v2.0` Pages deployment when the batch affects rendered UI.

A phase may only be marked complete after its acceptance criteria and CI/Pages gate are reviewed.

Preview: `https://ahmaduarmash.github.io/erp-template/`

---

## 9. Cleanup Policy

As the design system replaces earlier experimental work:

- migrate reusable decisions into tokens/primitives,
- remove obsolete/conflicting CSS,
- consolidate duplicated components,
- prevent feature-owned theme systems,
- keep compatibility adapters only while migrations still depend on them,
- prefer evolution of good existing architecture over rewrites,
- document architecture changes that alter the original implementation path.

Known migration debt after Phase 7:

- `DataTable` and `DomainTable` still exist for legacy pages; they should delegate to or be retired in favor of the enterprise data-workspace contract during Phase 9. Expenses intentionally retains the existing `DomainTable` list shell while Phase 7 validates workflow behavior rather than table migration.
- Compatibility CSS aliases remain until affected feature styles are migrated.
- Generic `ModulePage` remains a compatibility route path for modules that have not yet received their final floorplan; it is not the target architecture for complex ERP documents.
- Workflow history/ownership currently persist inside demo records so the starter remains self-contained; API-backed projects should map the same model to authoritative server workflow/audit data.

---

## 10. Progress Log

### 2026-09-23 — Phases 1–4 baseline confirmed

Runtime tokens, motion/feedback, enterprise shell, and shared visual primitives were already complete on `v2.0` when this continuation began. Their architecture was inspected before new work.

### 2026-09-23 — Phase 5 completed

- Audited existing overlay implementation rather than rewriting it.
- Confirmed all required intent-specific surfaces already existed.
- Removed title-text dependence as the primary create/edit intent API in `CrudModal` while retaining a legacy fallback.
- Added overlay architecture regression tests.
- CI caught and helped correct an inaccurate drawer-token test assertion.
- Full CI and Pages deployment passed.

### 2026-09-23 — Phase 6 completed

- Audited `DataTable` and `DomainTable`; identified functional duplication and inconsistent capability depth.
- Added `EnterpriseDataTable` as the forward master-data contract.
- Added URL-backed query state, structured filters, client/server modes, saved views, export/columns/refresh/pagination/sorting, conditional bulk selection, virtualization, and state handling.
- CI caught an Ant Design grouped-column typing issue in export resolution; fixed before migration continued.
- Migrated Products as the validation screen while preserving its domain-specific KPI, stock, drawer, and modal UX.
- Added contract tests and verified CI + Pages deployment.

### 2026-09-23 — Phase 7 completed

- Audited the existing workflow primitives before adding new architecture; reused the Phase 5 `ApprovalDrawer` and Phase 2 animated overlays.
- Added an explicit workflow state/transition model and safe audit-history persistence contract.
- Hardened route/timeline, audit trail, decision visibility, reason capture, confirmation, and resilient UI states.
- Migrated Expenses from direct table decisions to a review-first right-side drawer while preserving list context.
- Added pull-to-desk, forward/return, approve/reject, and settlement behavior with permission-aware visibility.
- Fixed a confirmation action path that could otherwise fire before the user confirmed.
- Added workflow contract/state tests and verified full CI + Pages deployment.

---

## 11. Immediate Next Stage

**Next: Phase 8 — Settings & Live Theme Studio.**

Before implementation:

1. inspect the current Settings screen, `ThemeProvider`, runtime config schema, persistence adapter, and any existing settings controls,
2. compare current controls against every Phase 8 target section before adding UI,
3. preserve the existing token/config engine as the single source of truth—do not create a second theme model,
4. identify stale/duplicated settings CSS or controls that should be consolidated into shared primitives,
5. make all supported changes apply live without rebuild/reload,
6. expose effective reduced-motion policy and keep sound/table preferences inside the same resolved settings model,
7. add focused tests for live settings application and safe reset/recovery,
8. validate light/dark, compact/comfortable, fast/normal motion, CI, and Pages before marking Phase 8 complete.

---

## 12. Documentation Maintenance Rule

This file is part of the implementation. After each meaningful stage or sub-stage it must reflect:

- completed checklist items,
- date/status,
- important implementation decisions,
- architecture changes,
- components/primitives created,
- migrations performed,
- technical debt removed or intentionally retained,
- validation performed,
- remaining work,
- next recommended stage.

If implementation reveals a better architecture than an older roadmap instruction, document the change and why it better preserves the original product goal. Never silently diverge.

---

## 13. Quality Bar

Do not optimize for checking boxes. Ask continuously:

> **Would this feel intentional and productive to someone using the ERP for eight hours every day?**

The final target remains:

- polished enterprise SaaS quality,
- excellent daily-use ERP UX,
- fast perceived performance,
- robust architecture,
- broad runtime customization,
- clear information hierarchy,
- consistent interaction behavior,
- domain-correct ERP interfaces,
- professional light and dark modes,
- accessibility,
- reusable architecture for future projects.