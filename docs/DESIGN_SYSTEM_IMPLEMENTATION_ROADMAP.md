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
| 10 | QA, Accessibility & Design-System Enforcement | [ ] |

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

## Objective

Ensure every routed module uses the shared product language while preserving the floorplan required by its domain.

## Migration result

1. [x] Remaining routed master-data modules classified and migrated where needed.
2. [x] Customers / suppliers migrated to Master + Detail; Warehouses intentionally retained as Tree Workspace. No routed Employees module exists in the starter, so no synthetic module was invented.
3. [x] Chart of Accounts → Tree Workspace.
4. [x] Stock Levels → Analytical Workspace.
5. [x] Stock Transfers → full-page Document Workspace.
6. [x] Purchase Orders → full-page Document Workspace.
7. [x] Sales Invoices → full-page Document Workspace.
8. [x] Journal Entries → Accounting Document Workspace.
9. [x] Users / roles → Security Workspace.
10. [x] Dashboard → Analytical Workspace. No separate routed Reports module exists, so none was invented.

Additional routed transaction:
- [x] Payments → full-page Document Workspace because complex payment allocation is explicitly governed by the document-workspace interaction rule.

## Architecture decisions

- Route metadata now explicitly includes `WORKFLOW` and classifies Dashboard as `ANALYTICAL`; routed modules have deliberate floorplans rather than relying on a generic CRUD label.
- Customers and Suppliers share `PartnerMasterPage`, using `EnterpriseDataTable`, `RecordDrawer`, `CreateModal`, and `EditModal` while retaining domain-specific relationship tabs.
- Warehouse structure is a hierarchy, so forcing it into Master + Detail would reduce domain correctness; it remains a tree/detail workspace with modal create/edit.
- Chart of Accounts remains a tree/detail financial hierarchy; small account create/edit uses centered modals and deactivation uses contextual confirmation.
- Stock Levels was already a derived analytical view and was retained rather than rewritten.
- `DocumentWorkspace`, `DocumentSection`, and `DocumentSummary` provide the reusable full-page transaction floorplan. Complex documents no longer create/edit inside wide drawers.
- Stock Transfer validates different source/destination warehouses and exposes Draft → In transit → Received lifecycle.
- Purchase Order exposes supplier, lines, calculated total, and Draft → Ordered → Received lifecycle.
- Sales Invoice exposes customer, lines, amount, issue/due dates, due-date validation, and Draft → Sent → Paid lifecycle.
- Journal Entry exposes accounting lines, debit/credit totals, zero-difference validation, and posting lifecycle.
- Payments expose financial-document context and a dedicated allocation region rather than generic CRUD editing.
- Security separates user inspection (`RecordDrawer`) from invitation/access changes (`CreateModal`/`EditModal`) and retains role-permission/data-scope floorplans.

## Cleanup performed

- Routed Customers/Suppliers no longer depend on the old generic accounting/inventory partner implementations.
- Routed Warehouses no longer uses the incomplete legacy button-only hierarchy screen.
- Routed Stock Transfers, Purchase Orders, Sales Invoices, Journal Entries, and Payments now point to `DocumentWorkspaces`.
- Complex document workspaces contain no raw `<Drawer>`/`<Modal>` transaction editor.
- Floorplan and document composition tests enforce the chosen architecture.

## Validation

- Partner master-data batch: `Validate starter` **35849112411** passed; Pages **35849112381** passed and deployed.
- Initial complex-document run **35849681042**: all 34 tests passed; TypeScript build correctly stopped on two unused imports.
- Import cleanup: `Validate starter` **35849925654** passed; Pages **35849925712** passed and deployed.
- Final tree/security/analytical alignment: `Validate starter` **35850244812** passed; Pages **35850244989** passed and deployed.

## Exit criteria

- [x] Every routed business module has an explicit floorplan classification.
- [x] Master data uses master/detail behavior where inspection context matters.
- [x] Hierarchies remain hierarchy workspaces.
- [x] Derived inventory/dashboard data remains analytical rather than editable CRUD.
- [x] Complex transaction modules use dedicated full-page workspaces.
- [x] Security and workflow use their own domain floorplans.
- [x] No non-existent module was invented solely to satisfy an older checklist item.
- [x] CI and Pages gate pass.

**Status: [x] Complete.**

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
- [ ] Modal/drawer/table/document overflow behavior

### Accessibility
- [ ] Keyboard navigation contracts
- [ ] Visible focus
- [ ] Tooltip/aria labels for icon-only actions
- [ ] Semantic labels for status beyond color
- [ ] Modal/drawer focus management
- [ ] Escape/close behavior
- [ ] Form errors associated to controls
- [ ] Sufficient contrast strategy in light/dark modes
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
- [ ] Document-workspace contract tests
- [ ] Settings contract tests
- [ ] TypeScript build
- [ ] GitHub Actions
- [ ] GitHub Pages preview

## Exit criteria

The starter can be cloned into a new ERP/SaaS project and extended without developers needing to recreate layout, styling, motion, table, overlay, document, or workflow rules.

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
8. verify the `v2.0` Pages deployment when rendered UI changes.

Preview: `https://ahmaduarmash.github.io/erp-template/`

---

## 9. Cleanup Policy / Known Debt

- `DataTable`/`DomainTable` remain for legacy or document-list screens; they must not evolve into a competing generic enterprise table system.
- Compatibility CSS aliases remain until final cleanup proves no consumers require them.
- `ModulePage` remains as an unused/compatibility implementation artifact and is not the architecture for routed complex modules; Phase 10 should verify safe removal or document why it remains.
- Workflow history/ownership currently persist inside demo records; API-backed projects should map the same contract to authoritative server workflow/audit data.
- Legacy `.settings-*` rules in `src/styles.css` should be removed if Phase 10 proves the dedicated `src/pages/settings.css` owns all current Settings styling.
- Older workspaces in `src/pages/erp/InventoryWorkspaces.tsx` and `AccountingWorkspaces.tsx` may remain as dead compatibility code after routed wrappers moved to new implementations; Phase 10 should identify and remove safe dead duplicates instead of keeping competing examples.

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
- Migrated Customers/Suppliers to a reusable Master + Detail floorplan.
- Added explicit `WORKFLOW` route classification and analytical Dashboard classification.
- Added reusable full-page Document Workspace and migrated transfers/orders/invoices/journals/payments.
- Preserved domain-correct Stock Levels, Warehouse hierarchy, and Chart of Accounts hierarchy instead of forcing generic CRUD.
- Hardened Chart of Accounts create/edit/deactivate interactions.
- Hardened Security inspection/invite/edit separation.
- CI caught and stopped a TypeScript unused-import regression before later migration batches were stacked.
- Final tests/build/Pages deployment passed.

---

## 11. Immediate Next Stage

**Next: Phase 10 — QA, Accessibility & Design-System Enforcement.**

Before marking the roadmap complete:
1. audit current shared/component CSS and remove safe dead duplicate styling/components,
2. expand automated design-system guards across all active shared/floorplan CSS,
3. enforce icon-only accessible naming and semantic status behavior,
4. verify overlay/document responsive contracts and focus/keyboard assumptions,
5. verify theme/runtime combinations through resolver/token tests and rendered-contract checks,
6. exercise data/workflow edge-state contracts including long content and URL query restoration,
7. confirm no routed module falls back to generic `ModulePage`,
8. remove safe dead legacy workspaces or explicitly document retained compatibility code,
9. run the full test/build/CI/Pages gate and only then mark Phase 10 complete.

---

## 12. Documentation Maintenance Rule

This file is part of the implementation. After each meaningful stage it must reflect completed checklist items, decisions, architecture changes, migrations, technical debt, validation, remaining work, and the next recommended stage. Never silently diverge from the documented product goal.

---

## 13. Quality Bar

> **Would this feel intentional and productive to someone using the ERP for eight hours every day?**

Final target: polished enterprise SaaS quality, excellent daily-use ERP UX, fast perceived performance, robust architecture, broad runtime customization, clear information hierarchy, consistent interaction behavior, domain-correct ERP interfaces, professional light/dark modes, accessibility, and reusable architecture for future projects.