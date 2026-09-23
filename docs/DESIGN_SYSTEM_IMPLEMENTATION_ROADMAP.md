# ERP Template v2.0 — Enterprise SaaS Design System Implementation Roadmap

> **Status:** Active implementation document  
> **Branch:** `v2.0`  
> **Last reviewed:** 2026-09-23  
> **Purpose:** Living implementation plan for evolving `erp-template` into a polished, runtime-customizable, production-grade SaaS/ERP design system and workspace shell.

---

## 1. Product Goal

The target is not a replica of any reference interface. The target is a reusable enterprise product language that borrows proven interaction principles while remaining brand-neutral, configurable at runtime, maintainable, accessible, and suitable for multiple ERP/SaaS products.

The finished starter must feel professional, fast, information-dense without feeling cramped, visually calm, domain-aware rather than generic CRUD, highly customizable without rebuilds, and consistent while allowing each business workflow to behave correctly.

> **Every page should look like it belongs to the same product, while behaving like the business object it represents.**

---

## 2. Design System Constitution

1. Stable shell, dynamic workspace.
2. Neutral base UI, semantic color.
3. No decorative gradients; depth comes from solid surfaces, borders, and controlled elevation.
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
17. Frequent row actions are icon-first; uncommon actions live in overflow menus with icon + text.
18. Color communicates identity, state, category, or risk—never random decoration.
19. Domain behavior determines screen structure; one generic CRUD floorplan must not replace accounting, purchasing, inventory, workflow, security, or hierarchy UX.
20. CI is an implementation gate. Major phases must not be stacked on a knowingly failing build.

---

## 3. Architecture Target

```text
Project defaults (template.config.ts)
        ↓
User preferences / persistence
        ↓
resolveConfig
        ↓
Primitive → semantic → component/layout/motion tokens
        ↓
CSS variables + Ant Design ConfigProvider + Tailwind v4
        ↓
Shared primitives / interaction surfaces
        ↓
Reusable ERP floorplans
        ↓
Domain modules
```

`template.config.ts`, `ThemeProvider`, route registry, repository boundaries, and domain workspaces remain reusable foundations and should be evolved rather than rewritten without evidence.

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

---

## 5. Motion Contract

| Interaction | Fast | Normal |
| --- | ---: | ---: |
| Micro hover / toggle | 80–100ms | 120–150ms |
| Standard dropdown / card | 120–150ms | 180–200ms |
| Modal / drawer enter | 150ms | 200ms |
| Modal / drawer exit | 100ms | 140ms |
| Tab / page switch | 100ms | 150ms |

Rules: exit is faster than entry; avoid routine 300–500ms animation; use high-stiffness/high-damping springs; respect OS `prefers-reduced-motion`; runtime Motion Speed applies live; routine table operations do not replay decorative stagger animation.

Default spring contract:

```ts
{ stiffness: 500, damping: 35 }
```

---

## 6. ERP Floorplan Vocabulary

- **Master List / Master + Detail** — products, customers, suppliers and similar master data.
- **Tree Workspace** — Chart of Accounts, warehouse/location hierarchies.
- **Analytical Workspace** — stock levels, dashboards, audit/read-heavy derived data.
- **Document Workspace** — journal entries, purchase orders, invoices, transfers, payments.
- **Approval / Workflow Workspace** — routed decisions and audit trails.
- **Security Workspace** — users, roles, permissions, data scope.

A Purchase Order must feel like purchasing software. A Journal Entry must feel like accounting software. Chart of Accounts must behave like a hierarchy. Stock Levels must behave like derived inventory data.

---

## 7. Progress Tracking

| Phase | Area | Status |
| --- | --- | --- |
| 1 | Runtime Design Token Engine | [x] |
| 2 | Motion & Feedback Engine | [x] |
| 3 | Enterprise Workspace Shell | [x] |
| 4 | Core Visual Primitives | [x] |
| 5 | Overlay & Interaction Architecture | [x] |
| 6 | Enterprise Data Workspace | [x] |
| 7 | Workflow / Approval System | [x] |
| 8 | Settings & Live Theme Studio | [x] |
| 9 | ERP Floorplan / Module Migration | [x] |
| 10 | QA, Accessibility & Design-System Enforcement | [-] |

A phase is complete only when its acceptance criteria and CI/Pages gate pass.

---

# Phase 1 — Runtime Design Token Engine

**Status: [x] Complete.**

Completed: shade scales, semantic light/dark mapping, spacing/density, radius, typography, elevation, layout dimensions, `ThemeProvider`, `resolveConfig`, AntD/Tailwind mappings, decorative-gradient removal, raw shared-theme-color guards, and token tests.

Key decisions:
- Runtime tokens are the single source of truth.
- Light/Dark/System is the supported mode contract.
- Legacy `spacious` density migrates to `comfortable`.
- Compatibility CSS aliases may remain only while feature migration still depends on them.

---

# Phase 2 — Motion & Feedback Engine

**Status: [x] Complete.**

Completed: runtime motion matrices, `useMotionTokens`, animated modal/drawer/popover/dropdown, page/tab transitions, press feedback, insertion/removal transitions, OS reduced-motion veto, live speed integration, and synthesized Web Audio feedback.

Key decisions:
- AntD, Motion for React, and CSS transitions share effective reduced-motion state.
- Routine row-stagger animation was removed.

---

# Phase 3 — Enterprise Workspace Shell

**Status: [x] Complete.**

Completed: business-area rail, secondary navigation, compact header, command/search affordance, workspace tabs, route metadata, responsive collapse, runtime shell dimensions, and removal of competing shell architecture.

---

# Phase 4 — Core Visual Primitives

**Status: [x] Complete.**

Completed shared vocabulary: `Surface`, `IconChip`, `StatCard`, `StatusPill`, `ActionIcon`, `OverflowMenu`, `FilterBar`, `EmptyState`, `SectionHeader`, `EntityCell`, `MoneyCell`, `ProgressCell`, `QuickFilterTabs`, `Metric`, `ObjectHeader`, and `CommandBar`.

Rules: primitives consume semantic tokens; frequent actions are icon-first with tooltips; uncommon actions use overflow menus; color remains semantic rather than decorative.

---

# Phase 5 — Overlay & Interaction Architecture

**Status: [x] Complete.**

Completed shared surfaces: `CreateModal`, `EditModal`, `RecordDrawer`, `ApprovalDrawer`, `ConfirmActionPopover`.

Implementation record — 2026-09-23:
- Intent-specific overlays delegate animation to Phase 2 primitives.
- Legacy CRUD wrappers remain migration adapters only.
- Products validates list → inspection drawer → edit modal while preserving list context.
- CI caught and corrected an inaccurate drawer-token test assertion.

Validation:
- `Validate starter` **35843068978** passed.
- `Deploy v2.0 preview` **35843069024** passed and deployed.

---

# Phase 6 — Enterprise Data Workspace

**Status: [x] Complete.**

Completed: `EnterpriseDataTable` with sticky header, search, structured filters, reset, refresh, export, column visibility, sorting, pagination, client/server modes, URL-backed query state, saved views, domain-valid bulk actions, row actions, empty/loading/error states, and virtualization support.

Architecture decision:
- `EnterpriseDataTable` is the forward master-data contract.
- `DataTable`/`DomainTable` are legacy or domain-list surfaces and must not become a second generic table design system.

Implementation record:
- Products was migrated as the validation screen.
- CI caught an AntD grouped-column typing edge during export and stopped the batch until fixed.

Validation:
- Foundation **35843608209** passed.
- Products migration **35843739458** passed.
- Contract-test CI **35843939296** passed.
- Pages **35843939328** passed and deployed.

---

# Phase 7 — Workflow / Approval System

**Status: [x] Complete.**

Completed:
- status model: draft/pending/forwarded/approved/rejected/settled,
- legal transitions,
- approval route/timeline,
- current-stage emphasis,
- actor/role context,
- audit trail and recorded reasons,
- permission-aware actions,
- approve/reject/forward/pull-to-desk/return/settle,
- mandatory-reason popovers,
- loading/error/empty states,
- real `ApprovalDrawer` integration on Expenses.

Architecture decision:
- `src/workflow/model.ts` owns domain-neutral state/transition/audit contracts.
- Expenses is the validation target; demo persistence stores `workflowOwner` and serialized history while production adapters can map the same model to server workflow data.

Implementation note:
- Integration caught and fixed a confirmation path that could fire before acceptance.

Validation:
- `Validate starter` **35847480072** passed.
- `Deploy v2.0 preview` **35847480106** passed and deployed.

---

# Phase 8 — Settings & Live Theme Studio

**Status: [x] Complete.**

Completed target sections:
- [x] Brand
- [x] Theme mode
- [x] Primary/accent color
- [x] Typography
- [x] Text size
- [x] Density
- [x] Radius
- [x] Content width
- [x] Motion speed
- [x] Effective reduced-motion indication
- [x] Sound master/category/volume
- [x] Table defaults
- [x] Reset to project defaults
- [x] Live preview

Architecture decision:
- Settings remain a productization layer over `ThemeProvider`/`resolveConfig`/`template.config.ts`, not a second theme model.
- OS reduced motion remains an accessibility veto and is explicitly shown as effective policy.
- Brand identity is a safe persisted runtime preference.

Implementation record:
- Added responsive token-driven Theme Studio and live preview.
- Added safe brand recovery; unsafe logo schemes or malformed data fall back to defaults.
- Initial CI caught a stale test that treated any persisted brand name as invalid; it was corrected to test genuinely malformed data.

Validation:
- Initial stopped run **35848265809** documented the stale assertion.
- Corrected `Validate starter` **35848518648** passed.
- `Deploy v2.0 preview` **35848518740** passed and deployed.

---

# Phase 9 — ERP Floorplan / Module Migration

**Status: [x] Complete.**

Migration result:
1. [x] Remaining routed master-data modules classified and migrated where needed.
2. [x] Customers / suppliers migrated to Master + Detail; Warehouses intentionally retained as Tree Workspace. No routed Employees module exists, so no synthetic module was invented.
3. [x] Chart of Accounts → Tree Workspace.
4. [x] Stock Levels → Analytical Workspace.
5. [x] Stock Transfers → full-page Document Workspace.
6. [x] Purchase Orders → full-page Document Workspace.
7. [x] Sales Invoices → full-page Document Workspace.
8. [x] Journal Entries → Accounting Document Workspace.
9. [x] Users / roles → Security Workspace.
10. [x] Dashboard → Analytical Workspace.
11. [x] Payments → full-page Document Workspace.

Key decisions:
- Route metadata includes `WORKFLOW`; Dashboard is `ANALYTICAL`.
- Customers/Suppliers share `PartnerMasterPage` with enterprise table + inspect drawer + create/edit modals.
- Warehouse and Chart of Accounts remain hierarchy workspaces.
- `DocumentWorkspace`, `DocumentSection`, and `DocumentSummary` own the reusable complex-document floorplan.
- Security separates inspection from access editing.

Validation:
- Partner master batch: `Validate starter` **35849112411**, Pages **35849112381** passed.
- Complex-document run **35849681042** stopped on unused TypeScript imports after all tests passed; cleanup then passed in **35849925654**, Pages **35849925712**.
- Final tree/security/analytical alignment: `Validate starter` **35850244812**, Pages **35850244989** passed.

---

# Phase 10 — QA, Accessibility & Design-System Enforcement

## Objective

Make the system resilient enough to remain consistent as new projects and modules are added. This phase is also the final visual-polish pass: spacing rhythm, overflow behavior, legacy styling collisions, responsive composition, focus/keyboard semantics, and edge-state loopholes must be corrected rather than hidden with page-specific patches.

## Required QA matrix

### Theme / runtime
- [x] Light token/runtime contract
- [x] Dark token/runtime contract
- [x] System-mode resolution contract
- [x] Runtime primary/accent changes
- [x] Runtime typography changes
- [x] Compact/comfortable density
- [x] Radius/content width changes
- [x] Fast/normal motion
- [x] OS reduced-motion veto remains centralized

### Responsive
- [x] Desktop wide contract
- [x] Desktop constrained contract
- [x] Tablet contract
- [x] Mobile/narrow shell fallback contract
- [x] Modal/drawer/table/document overflow guards
- [-] Final routed-screen consistency sweep

### Accessibility
- [x] Visible focus contract
- [x] Tooltip/aria naming for shared icon-only actions
- [x] Semantic status text remains present beyond color
- [x] Modal/drawer focus management remains delegated to Ant Design primitives
- [x] Escape/close behavior for overlays and mobile navigation
- [x] Form validation remains Ant Form-associated
- [x] Light/dark semantic contrast strategy test
- [x] Reduced-motion behavior
- [-] Final keyboard/interaction source audit across routed screens

### Data/workflow
- [x] Empty-state contract
- [x] Loading-state contract
- [x] Error-state contract
- [x] Large-list virtualization contract
- [x] Long-label/value overflow guards in shared primitives/overlays
- [x] Bulk-selection contract
- [x] URL query restoration contract
- [x] Server-mode query contract
- [x] Approval rejection/reason contracts retained from Phase 7
- [x] Prevent hiding every enterprise-table data column

### Enforcement
- [x] Automated no-decorative-gradient guard expanded across all active floorplan CSS
- [x] Automated raw shared-theme-color guard expanded across all active floorplan CSS
- [x] Shared-primitives contract tests
- [x] Overlay contract tests
- [x] Enterprise-data-workspace contract tests
- [x] Workflow contract tests
- [x] Route/floorplan metadata tests
- [x] Document-workspace contract tests
- [x] Settings contract tests
- [x] Runtime matrix + contrast tests
- [x] Dead-code / legacy-global-CSS regression tests
- [x] TypeScript build through current Phase 10 batches
- [x] GitHub Actions through current Phase 10 batches
- [x] GitHub Pages preview through current Phase 10 batches

## Phase 10 implementation record — 2026-09-23

### Sub-stage A — CSS ownership, spacing rhythm, and dead-code cleanup

Completed:
- Removed competing legacy shell/settings rules from `src/styles.css` rather than layering more overrides on top.
- Rebuilt active global spacing and typography rules around runtime tokens.
- Rebuilt `src/erp.css` active ERP spacing around runtime semantic/spacing/radius tokens.
- Removed the global Ant Tabs margin override that leaked spacing into drawers/modals/workspaces.
- Hardened intent-modal internal padding, mobile max-height, drawer max-width, long-content wrapping, and narrow-screen spacing.
- Hardened shared primitives against min-width/overflow issues and improved filter/action wrapping.
- Reduced `InventoryWorkspaces.tsx` to its only active responsibility: analytical Stock Levels.
- Corrected the Low Stock quick view so zero-stock records belong only to the dedicated Out of Stock view.
- Removed dead competing artifacts: `ModulePage.tsx`, `AccountingWorkspaces.tsx`, `JournalEntriesPage.tsx`, and `journal-v2.css`.
- Removed obsolete `journal-v2.css` from the runtime bundle.

Validation:
- `Validate starter` **35852040919** passed tests + production build.
- `Deploy v2.0 preview` **35852040636** passed build + Pages deployment.

### Sub-stage B — accessibility, responsive, runtime, and edge-state enforcement

Completed:
- Added `tests/qa-enforcement.test.mjs`.
- Added runtime matrix coverage across mode, density, typography, radius, color, content-width and motion configurations.
- Added semantic foreground/background contrast assertions for light/dark token output.
- Expanded gradient/raw-color guards to Settings, Workflow, Document and other active CSS.
- Added regression guards so removed legacy shell/settings selectors and dead workspace files do not return.
- Added mobile-navigation `aria-expanded`/`aria-controls` state and explicit shell navigation target.
- Improved theme-toggle accessible naming and decorative keyboard-shortcut semantics.
- Added explicit document/section `aria-labelledby` relationships and document-summary labeling.
- Added `aria-busy` and workspace labeling to `EnterpriseDataTable`.
- Replaced the active data-filter inline width with a reusable responsive class.
- Prevented column visibility controls from hiding every business-data column.
- Added automated responsive-contract checks for shell, overlays, data primitives and documents.
- Kept reduced-motion veto centralized in `src/theme/motion.css` instead of duplicating it globally.

Validation:
- `Validate starter` **35852479144** passed expanded tests + production build.
- `Deploy v2.0 preview` **35852479213** passed preview build + Pages deployment.

## Remaining work before Phase 10 completion

1. Final routed-screen consistency sweep for residual spacing/interaction drift, especially hierarchy/document/security/workflow screens.
2. Remove safe residual decorative-motion/legacy compatibility rules where active source no longer needs them.
3. Recheck constrained desktop/mobile action wrapping and document line editors after the CSS ownership cleanup.
4. Review keyboard semantics of custom non-Ant interactive elements without introducing unsupported ARIA patterns.
5. Run one final full tests/build/Actions/Pages gate.
6. Mark the phase complete only after this final sweep passes.

## Exit criteria

The starter can be cloned into a new ERP/SaaS project and extended without developers needing to recreate layout, styling, motion, table, overlay, document, or workflow rules.

**Status: [-] In progress.**

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
8. verify the `v2.0` Pages deployment when rendered UI changes.

Preview: `https://ahmaduarmash.github.io/erp-template/`

---

## 9. Cleanup Policy / Known Debt

- `DataTable`/`DomainTable` remain only for legacy or document-list screens; they must not evolve into a competing generic enterprise table system.
- Compatibility token aliases remain while active compatibility CSS still consumes them; remove only when the final active-source audit proves safe.
- Workflow history/ownership currently persists inside demo records; API-backed projects should map the same contract to authoritative server workflow/audit data.
- `design-v2.css` remains a compatibility presentation layer; Phase 10 final sweep must remove dead selectors/decorative motion from it where safe rather than creating another replacement layer.
- `coa-v2.css` remains the active Chart-of-Accounts-specific hierarchy layout and must stay token-driven.
- `ModulePage`, dead Accounting workspaces, obsolete Journal page/CSS, old Settings globals, and inactive Inventory workspace duplicates were removed during Phase 10.

---

## 10. Progress Log

### 2026-09-23 — Phases 1–4 baseline confirmed
Runtime tokens, motion/feedback, enterprise shell, and visual primitives were already complete when this continuation began.

### 2026-09-23 — Phase 5 completed
Audited overlays, preserved good architecture, hardened intent semantics, added contract tests, and passed CI/Pages.

### 2026-09-23 — Phase 6 completed
Added enterprise data-workspace contract, migrated Products, fixed a CI-caught typing edge, and passed CI/Pages.

### 2026-09-23 — Phase 7 completed
Added reusable workflow state/audit/decision architecture, migrated Expenses to approval-drawer behavior, fixed confirmation semantics, and passed CI/Pages.

### 2026-09-23 — Phase 8 completed
Productized Settings around the existing runtime engine, added persisted Brand and effective motion policy, corrected a stale recovery assertion, and passed CI/Pages.

### 2026-09-23 — Phase 9 completed
Migrated master/detail, document, hierarchy, analytical and security screens to explicit floorplans; CI caught an unused-import regression; final tests/build/Pages deployment passed.

### 2026-09-23 — Phase 10 sub-stage A completed
Removed competing global CSS generations and dead routed-workspace artifacts, consolidated spacing around runtime tokens, fixed narrow overlay/table behavior, and passed CI/Pages.

### 2026-09-23 — Phase 10 sub-stage B completed
Added runtime/contrast/accessibility/responsive/edge-state enforcement tests, hardened shell and document semantics, closed enterprise-table column/overflow loopholes, and passed CI/Pages.

---

## 11. Immediate Next Stage

**Continue Phase 10 final routed-screen consistency sweep.**

Before marking the roadmap complete:
1. inspect residual active compatibility CSS for dead/decorative selectors,
2. correct any remaining hierarchy/document/security/workflow spacing drift,
3. recheck constrained action bars and mobile document overflow,
4. preserve only ARIA semantics supported by actual keyboard behavior,
5. run the complete test/build/CI/Pages gate,
6. update this roadmap with the final state and remaining intentionally retained compatibility boundaries.

---

## 12. Documentation Maintenance Rule

This file is part of the implementation. After each meaningful stage it must reflect completed checklist items, decisions, architecture changes, migrations, technical debt, validation, remaining work, and the next recommended stage. Never silently diverge from the documented product goal.

---

## 13. Quality Bar

> **Would this feel intentional and productive to someone using the ERP for eight hours every day?**

Final target: polished enterprise SaaS quality, excellent daily-use ERP UX, fast perceived performance, robust architecture, broad runtime customization, clear information hierarchy, consistent interaction behavior, domain-correct ERP interfaces, professional light/dark modes, accessibility, and reusable architecture for future projects.