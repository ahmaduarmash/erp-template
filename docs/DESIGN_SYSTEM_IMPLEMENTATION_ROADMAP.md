# ERP Template v2.0 — Enterprise SaaS Design System Implementation Roadmap

> **Status:** Active implementation document  
> **Branch:** `v2.0`  
> **Last reviewed:** 2026-09-23  
> **Purpose:** Living implementation plan for evolving `erp-template` into a highly polished, runtime-customizable, enterprise-grade SaaS/ERP design system and workspace shell.

---

## 1. Goal

The target is **not** to copy any reference product visually. The goal is to adopt the strongest interaction and product-design principles observed in the reference material while keeping this starter brand-neutral, reusable, runtime-themeable, and suitable for many ERP/SaaS products.

The finished system should feel:

- professional rather than decorative,
- fast rather than animated for animation's sake,
- information-dense without feeling cramped,
- visually calm but not flat or lifeless,
- domain-aware rather than generic CRUD,
- highly customizable without rebuilds or page reloads,
- consistent across all modules while allowing each business workflow to behave differently.

The core product principle is:

> **Every page should look like it belongs to the same product, while behaving like the business object it represents.**

---

# 2. Design System Constitution

These are non-negotiable product rules for the implementation.

1. **Stable shell, dynamic workspace.**
2. **Neutral base UI, semantic color.**
3. **No decorative gradients.** Depth comes from solid surfaces, borders, and controlled elevation.
4. **All theme-sensitive values come from runtime design tokens.**
5. **Icons live inside meaningful affordances; decorative icon noise is avoided.**
6. **Create/edit small records = focused modal.**
7. **Inspect/review existing records = right-side drawer.**
8. **Complex transactions = full document workspace.**
9. **Confirmation happens as close as possible to the initiating action.**
10. **Overlay exits are always faster than entries.**
11. **Motion explains change; it does not decorate the UI.**
12. **Users should not lose table/filter context just to inspect a record.**
13. **One runtime token system controls CSS, Tailwind utilities, and Ant Design.**
14. **Feature-specific components must consume shared primitives rather than invent visual rules.**
15. **Dark mode hierarchy must not depend on heavy shadows.**
16. **Professional density comes from hierarchy and spacing discipline, not oversized controls.**
17. **Frequent row actions are icon-first; overflow actions use icon + text.**
18. **Color communicates identity, state, category, or risk—never random decoration.**

---

# 3. Current Baseline

`v2.0` already contains useful foundations that should be evolved rather than discarded:

- React 19 + Vite + TypeScript
- Ant Design v5
- Tailwind CSS v4
- `motion` / Motion for React
- runtime `TemplateConfig`
- `ThemeProvider`
- light/dark/system support
- configurable primary/accent colors
- configurable font, density, radius, content width
- motion and sound settings
- settings persistence
- workspace tab concept
- route registry
- domain-specific ERP workspaces
- ERP primitives
- auth/repository boundaries
- GitHub Pages preview

The visual architecture is being corrected incrementally rather than rewritten wholesale. Phase 1 established runtime design tokens as the source of truth while preserving compatibility aliases for existing screens until their scheduled migrations.

---

# 4. Architecture Target

The final theme flow should be:

```text
Project defaults
(template.config.ts)
        ↓
User preferences
(localStorage now / backend later)
        ↓
resolveTheme()
        ↓
Primitive design tokens
        ↓
Semantic design tokens
        ↓
Component tokens
        ↓
┌────────────────┬────────────────┬────────────────┐
│ CSS variables  │ AntD theme     │ Tailwind v4    │
│ runtime        │ ConfigProvider │ @theme inline  │
└────────────────┴────────────────┴────────────────┘
        ↓
Shared UI primitives
        ↓
ERP floorplans
        ↓
Domain modules
```

No feature should directly define its own brand colors, motion speeds, spacing system, radius system, or elevation logic.

---

# 5. Progress Tracking Rules

Each phase has one of these statuses:

- `[ ]` Not started
- `[-]` In progress
- `[x]` Complete
- `[!]` Blocked / needs decision

A phase is only complete when its **Exit Criteria** pass.

We should implement phases sequentially unless a later item is explicitly independent.

---

# 6. Phase Overview

| Phase | Area | Status |
| --- | --- | --- |
| 1 | Runtime Design Token Engine | [x] |
| 2 | Motion & Feedback Engine | [-] |
| 3 | Enterprise Workspace Shell | [ ] |
| 4 | Core Visual Primitives | [ ] |
| 5 | Overlay & Interaction Architecture | [ ] |
| 6 | Enterprise Data Workspace | [ ] |
| 7 | Workflow / Approval System | [ ] |
| 8 | Settings & Live Theme Studio | [ ] |
| 9 | ERP Floorplan / Module Migration | [ ] |
| 10 | QA, Accessibility & Design-System Enforcement | [ ] |

---

# 7. Phase 1 — Runtime Design Token Engine

## Objective

Make the theme engine the single source of truth before doing more screen-specific styling.

## 7.1 Primitive token families

### Color

Create runtime-generated scales for:

- `primary-50` → `primary-900`
- `accent-50` → `accent-900`
- neutral scale
- success
- warning
- danger
- info
- category accents

Primary and accent scales must be generated from the user's selected colors.

### Semantic color

Components should use semantic roles rather than palette values directly:

```text
--bg-base
--bg-surface
--bg-subtle
--bg-elevated
--bg-selected
--text-primary
--text-secondary
--text-muted
--text-disabled
--border-default
--border-strong
--border-subtle
--action-primary
--action-primary-hover
--action-primary-active
--focus-ring
--selection-bg
```

### Radius

One runtime radius setting should derive:

```text
--radius-sm
--radius-md
--radius-lg
--radius-xl
--radius-control
--radius-card
--radius-overlay
```

### Spacing / density

Introduce one density-aware base unit and derive the full spacing scale:

```text
--spacing-unit
--space-1
--space-2
--space-3
--space-4
--space-5
--space-6
--space-8
--space-12
```

Density target:

- Compact
- Comfortable

`spacious` should be removed from user-facing settings unless a later product requirement justifies it.

### Typography

Runtime typography tokens:

```text
--font-family
--font-scale
--text-xs
--text-sm
--text-md
--text-lg
--text-xl
--heading-sm
--heading-md
--heading-lg
--stat-sm
--stat-md
--stat-lg
--line-height-tight
--line-height-normal
```

Stat values use `font-variant-numeric: tabular-nums`.

Micro-labels remain uppercase and tracking-wide but scale with global text size.

### Elevation

Define mode-aware elevation:

```text
--elevation-xs
--elevation-sm
--elevation-md
--elevation-lg
```

Light mode:

- soft shadows,
- restrained alpha,
- no dramatic floating cards.

Dark mode:

- little or no traditional dark shadow,
- stronger borders,
- subtle inner highlight / border-lightening,
- optional tiny soft glow only when needed for overlays.

### Layout tokens

Introduce:

```text
--rail-width
--secondary-nav-width
--header-height
--tabbar-height
--content-max-width
--control-height
--table-row-height
--drawer-width-sm
--drawer-width-md
--drawer-width-lg
```

## 7.2 Tailwind integration

Tailwind v4 should consume runtime CSS custom properties through `@theme inline`.

No hardcoded theme hex/radius/spacing values should be needed inside feature components.

## 7.3 Ant Design integration

AntD `ConfigProvider` must consume the same resolved tokens used by CSS/Tailwind.

Avoid maintaining a separate visual system for Ant components.

## 7.4 Cleanup

- remove all decorative gradients,
- migrate reusable values out of feature CSS,
- reduce visual-system duplication across `styles.css`, `erp.css`, `design-v2.css`, `coa-v2.css`, `journal-v2.css`, etc.,
- keep feature CSS only when it describes unique feature layout rather than theme decisions.

## 7.5 Tasks

- [x] Define token type model
- [x] Build shade-scale generator
- [x] Build semantic light theme mapping
- [x] Build semantic dark theme mapping
- [x] Build spacing/density derivation
- [x] Build radius derivation
- [x] Build typography derivation
- [x] Build elevation derivation
- [x] Build layout derivation
- [x] Update `ThemeProvider`
- [x] Update `resolveConfig`
- [x] Map tokens to AntD
- [x] Map tokens to Tailwind
- [x] Remove decorative gradients
- [x] Remove raw theme colors from shared CSS
- [x] Add token unit tests

## Implementation record — 2026-09-23

- Added `src/theme/tokens/palette.ts`, `semantic.ts`, `foundations.ts`, and `index.ts` as the runtime token resolver.
- Added runtime CSS-variable emission and `src/theme/tokens/tailwind.css`; Ant Design `ConfigProvider`, Tailwind aliases, and plain CSS now consume the same resolved token object.
- Removed the user-facing/internal AntD algorithm setting. Theme mode is now strictly Light/Dark/System.
- Removed `spacious` from the supported density contract; persisted legacy `spacious` preferences migrate safely to `comfortable`.
- Preserved legacy CSS variable names as compatibility aliases so existing modules can migrate incrementally without creating a risky whole-app rewrite. New work should use semantic/runtime tokens directly.
- Reworked `design-v2.css`, `coa-v2.css`, and `journal-v2.css` to remove decorative gradients and move theme decisions to runtime tokens while preserving domain layout behavior.
- Removed remaining raw theme hex values from shared runtime CSS and added an automated guard that fails tests if decorative gradients or raw hex theme colors return.
- Added palette, token resolver, legacy preference migration, light/dark, density/radius/type/layout/elevation, and CSS constitution tests.
- Validation: GitHub Actions `npm test` and `npm run build` pass on `v2.0`; GitHub Pages preview build also passes for the Phase 1 head.
- Technical debt intentionally deferred: existing shell/module layout values that are not theme decisions remain in their current CSS until their scheduled Phase 3/9 migrations.

## Exit Criteria

Phase 1 is complete only when changing these settings updates the real application instantly without reload:

- primary color
- accent color
- light/dark/system
- font family
- text size
- density
- radius
- content width

And the application contains no decorative gradient backgrounds.

**Status: [x] Complete — exit criteria validated through the runtime resolver, live settings wiring, CSS constitution tests, production build, and preview build.**

---

# 8. Phase 2 — Motion & Feedback Engine

## Objective

Create one motion language for the entire product.

## 8.1 Duration matrix

Both speed tiers should already feel fast.

| Interaction | Fast | Normal |
| --- | ---: | ---: |
| Micro hover / toggle | 80–100ms | 120–150ms |
| Standard dropdown / card | 120–150ms | 180–200ms |
| Modal / drawer enter | 150ms | 200ms |
| Modal / drawer exit | 100ms | 140ms |
| Tab / page switch | 100ms | 150ms |

Rules:

- exit is always faster than entry,
- avoid 300ms+ transitions for standard UI,
- page-level special reveals should rarely exceed 250ms,
- reduced motion disables non-essential animation,
- normal speed is not a slow fallback.

## 8.2 Easing / spring

Default entry easing:

```text
cubic-bezier(0.16, 1, 0.3, 1)
```

Exit:

```text
ease-in
```

Spring:

```ts
{ stiffness: 500, damping: 35 }
```

Minimal overshoot only.

## 8.3 Shared motion API

Target API:

```text
useMotionTokens()
  micro
  standard
  page
  modalEnter
  modalExit
  drawerEnter
  drawerExit
  spring
```

## 8.4 Reusable animated surfaces

- [ ] `AnimatedModal`
- [ ] `AnimatedDrawer`
- [ ] `AnimatedPopover`
- [ ] `AnimatedDropdown`
- [ ] `PageTransition`
- [ ] `TabTransition`
- [ ] standardized press interaction
- [ ] list insertion/removal transition
- [ ] reduced-motion support

## 8.5 Motion philosophy

Animate:

- opening/closing context,
- active tab changes,
- workflow state changes,
- row insertion/removal,
- menu/popover changes,
- success/error feedback.

Do not animate:

- cards continuously floating,
- arbitrary icon spinning,
- permanent decorative movement,
- repeated number animation on every refresh,
- large table stagger on every state update.

## 8.6 Sound

Sound remains intentionally subtle:

- master on/off,
- low volume,
- click,
- success,
- warning,
- notification,
- no game-like sounds,
- short synthesized feedback,
- no audio assets.

Default sound behavior can be finalized during this phase.

## Exit Criteria

- no feature defines its own duration constants,
- overlays enter and exit consistently,
- normal motion feels fast,
- OS reduced-motion is respected,
- button interactions feel tactile but not bouncy.

---

# 9. Phase 3 — Enterprise Workspace Shell

## Objective

Replace the conventional single-sidebar feeling with a scalable enterprise workspace shell.

## 9.1 Target layout

```text
┌────────┬──────────────────────┬──────────────────────────────┐
│ Rail   │ Secondary nav        │ Global header                │
│        │                      ├──────────────────────────────┤
│        │                      │ Workspace tab bar            │
│        │                      ├──────────────────────────────┤
│        │                      │                              │
│        │                      │ Current workspace            │
│        │                      │                              │
└────────┴──────────────────────┴──────────────────────────────┘
```

## 9.2 Primary rail

Purpose: answer "Which major business area am I in?"

Potential categories:

- Overview
- Inventory
- Purchasing
- Sales
- Accounting
- Organization
- System

Patterns:

- icon-only,
- circular/tinted action targets,
- tooltip on hover,
- selected domain visually obvious,
- no noisy labels.

## 9.3 Secondary navigation

Purpose: answer "What can I do inside this business area?"

Each navigation item supports:

- icon,
- title,
- one-line description,
- active left accent,
- subtle selected tint.

Example:

```text
Accounting
Financial control & reporting

Chart of accounts
Ledger hierarchy

Journal entries
Manual accounting documents

Sales invoices
Receivables & billing
```

## 9.4 Route registry enrichment

Route metadata should support:

```text
title
description
icon
group
path
permission
pageKind
```

## 9.5 Header

Keep and refine existing behaviors:

- page/domain context,
- global search,
- color mode action,
- notifications,
- user/profile menu.

## 9.6 Workspace tab bar

Improve existing tabs into a real persistent workspace pattern:

- route icon,
- title,
- close button,
- selected-state line/tint,
- horizontal overflow,
- predictable close behavior,
- restore last active tabs where appropriate,
- fast 100–150ms transition.

## Tasks

- [ ] Build primary rail
- [ ] Build secondary nav
- [ ] Enrich route registry
- [ ] Rebuild shell grid using layout tokens
- [ ] Refine header
- [ ] Upgrade tab bar
- [ ] Responsive collapse rules
- [ ] Mobile navigation behavior
- [ ] Keyboard/focus navigation

## Exit Criteria

The shell must feel like an enterprise workspace even when the page body contains only an empty state.

---

# 10. Phase 4 — Core Visual Primitives

## Objective

Create the visual vocabulary every screen will reuse.

## Components

### Surface

Token-driven surface foundation.

### IconChip

- tinted solid background,
- semantic or category color,
- icon never floats without context unless the UI demands it.

### StatCard

Target anatomy:

```text
│ UPPERCASE LABEL                      [icon chip]
│
│ 14,671
│ ━━━━━━━━━━━━━━━━━━━━━
│ +2,803 vs previous period
```

Supports:

- left accent,
- label,
- value,
- icon chip,
- optional progress,
- optional trend,
- optional hint.

### StatusPill

Soft background + matching semantic text.

### ActionIcon

Used for frequent row actions.

### OverflowMenu

`⋯` with icon + text actions.

### FilterBar

Standard placement/order for search, filters, refresh/export, saved views.

### EmptyState

Small tinted icon chip + strong title + muted explanation + optional action.

### Additional primitives

- [ ] `SectionHeader`
- [ ] `EntityCell`
- [ ] `MoneyCell`
- [ ] `ProgressCell`
- [ ] `QuickFilterTabs`
- [ ] `Metric`
- [ ] `ObjectHeader`
- [ ] `CommandBar`

## Exit Criteria

Dashboard and list pages should be constructible primarily from shared primitives with minimal page-specific styling.

---

# 11. Phase 5 — Overlay & Interaction Architecture

## Objective

Standardize when the application uses modal, drawer, popover, or full page.

## UX decision matrix

| User intent | Surface |
| --- | --- |
| Small confirmation | Popconfirm / contextual popover |
| Create small/medium entity | Modal |
| Edit small/medium entity | Modal |
| Inspect existing entity | Right-side drawer |
| Review / approve request | Right-side drawer |
| Quick journal/payment/action | Modal |
| Complex document | Full page |
| Complex configuration | Full page |

## Modal pattern

Use for focused create/edit:

- icon chip + title,
- short explanation where useful,
- two-column form when width allows,
- scrollable body,
- persistent footer,
- ghost Cancel,
- solid primary action,
- validation near fields,
- snappy entry/exit.

## Record drawer pattern

Use for record inspection:

- identity header,
- status pill,
- key/value metadata,
- contextual action icons,
- tabs/sections where needed,
- activity / workflow timeline,
- no loss of underlying table/filter position.

## Confirmation pattern

Prefer contextual popover close to the initiating action for:

- submit,
- post,
- approve,
- receive,
- archive,
- suspend,
- reverse,
- cancel.

Do not stack unnecessary modal-on-modal flows.

## Shared components

- [ ] `CreateModal`
- [ ] `EditModal`
- [ ] `RecordDrawer`
- [ ] `ApprovalDrawer`
- [ ] `ConfirmActionPopover`

## Exit Criteria

Developers should be able to choose the correct interaction surface from this documented matrix without inventing new behavior.

---

# 12. Phase 6 — Enterprise Data Workspace

## Objective

Make list screens feel like business software rather than generic CRUD tables.

## Table rules

Primary entity column:

- visually strongest,
- clickable,
- supports secondary identifier/subtitle.

Secondary columns:

- quieter,
- semantically aligned,
- numeric values right aligned,
- money tabular,
- status pills small and restrained.

Actions:

- frequent action = icon + tooltip,
- multiple secondary actions = `⋯`,
- never show `View | Edit | Delete` text in every row.

## Data workspace stack

```text
Quick views / saved views
        ↓
Filter bar
        ↓
Enterprise table
        ↓
Record drawer on row/entity click
```

## Capabilities

- [ ] sticky header
- [ ] search
- [ ] structured filters
- [ ] reset filters
- [ ] refresh
- [ ] export
- [ ] column visibility
- [ ] sorting
- [ ] pagination
- [ ] server-mode interface
- [ ] URL-backed query state
- [ ] optional saved views
- [ ] bulk selection only where meaningful
- [ ] row-action overflow
- [ ] record drawer integration
- [ ] empty/loading/error states

## Exit Criteria

A normal master-data page should no longer visually resemble a CRUD generator.

---

# 13. Phase 7 — Workflow / Approval System

## Objective

Create reusable workflow visualization and approval interactions.

## Approval timeline anatomy

```text
✓ Submitted
│ Ahmed · 10:42 AM
│
✓ Department approved
│ Sara · 11:06 AM
│
◉ Finance approval
│ Awaiting review
│
○ Posted
```

## States

- completed
- current
- pending
- rejected
- skipped
- cancelled

## Timeline data

```text
actor
role
department
timestamp
note
status
```

## Components

- [ ] `ApprovalTimeline`
- [ ] `WorkflowStep`
- [ ] `WorkflowStatus`
- [ ] `WorkflowActionPanel`
- [ ] `ActivityTimeline`

## Reuse targets

- expenses
- purchase approvals
- journal approvals
- invoice approvals
- stock adjustments
- user/security requests
- future HR workflows

## Exit Criteria

Approval/review workflows should communicate state and history without requiring users to read raw logs.

---

# 14. Phase 8 — Settings & Live Theme Studio

## Objective

Expose the runtime design system professionally and prove settings against real UI primitives.

## Appearance

- Light / Dark / System
- Primary palette presets
- Custom primary color
- Accent color
- Font family
- Text size S/M/L
- Density Compact/Comfortable
- Corner radius slider
- Content width Boxed/Full
- Collapse navigation by default

Remove user-facing implementation details such as internal Ant Design "token algorithm" unless there is a strong product reason to keep them.

## Motion

- Interface motion on/off
- Fast / Normal
- automatic OS reduced-motion behavior

## Sound

- master on/off
- volume
- click
- success
- warning
- notification

## Other tabs

- Table preferences
- Notifications
- General/workspace settings

## Live preview

The live preview should display real system primitives rather than decorative mock UI:

- mini shell
- stat card
- status pill
- input
- primary/secondary button
- table row
- modal trigger
- drawer trigger
- motion behavior

Settings should update both preview and live application immediately.

## Tasks

- [ ] simplify settings information architecture
- [ ] remove implementation-only controls
- [ ] upgrade primary preset picker
- [ ] improve accent input
- [ ] connect density to full spacing system
- [ ] connect radius to full radius system
- [ ] connect typography to full type scale
- [ ] build real-component live preview
- [ ] add reset/persistence feedback
- [ ] preference migration tests

## Exit Criteria

Every visible customization setting must have an immediate observable effect in both live preview and the real application.

---

# 15. Phase 9 — ERP Floorplan / Module Migration

## Objective

Migrate modules by floorplan rather than redesigning each independently.

---

## 15.1 Analytical / dashboard floorplan

### Dashboard

Target characteristics:

- strong operational summary,
- left-accent stats,
- contextual charts,
- restrained icon chips,
- semantic alerts,
- no decorative gradient cards,
- action/attention queues where useful.

Status: `[ ]`

---

## 15.2 Master-detail floorplan

### Products

Flow:

```text
List → click product → record drawer → edit modal
```

Potential detail sections:

- Overview
- Inventory
- Pricing
- Suppliers
- Activity

Status: `[ ]`

### Customers

Flow:

```text
List → customer drawer → invoices/payments/activity
```

Status: `[ ]`

### Suppliers

Flow:

```text
List → supplier drawer → purchase/orders/bills/activity
```

Status: `[ ]`

### Users

Flow:

```text
List → security drawer → roles/scopes/activity
```

Status: `[ ]`

---

## 15.3 Tree workspace floorplan

### Chart of Accounts

Must consume shared system primitives rather than maintain a separate visual system.

Required:

- hierarchy/tree,
- list toggle if useful,
- account-type grouping,
- status/posting indicators,
- record detail drawer/panel,
- ledger action,
- add child,
- deactivate rather than destructive delete where applicable.

Status: `[ ]`

### Warehouses

- hierarchical warehouse/storage tree,
- detail view,
- stock context,
- transfer actions.

Status: `[ ]`

---

## 15.4 Document workspace floorplan

### Journal Entries

- multi-line accounting document,
- debit = credit validation,
- Draft → Posted → Reversed,
- full document workspace,
- quick journal remains modal,
- drawer for read-only inspection from list where useful.

Status: `[ ]`

### Purchase Orders

- supplier header,
- line items,
- totals,
- receive progress,
- document workflow,
- print/send/receive/close actions.

Status: `[ ]`

### Sales Invoices

- customer header,
- line items,
- tax/totals,
- outstanding amount,
- payment context,
- credit note/cancel workflow.

Status: `[ ]`

### Stock Transfers

- source/destination,
- line items,
- stock availability,
- Draft → Submitted/In Transit → Received.

Status: `[ ]`

### Payments

- Receive / Pay / Internal Transfer,
- source/destination accounts,
- allocation table,
- allocated/unallocated totals.

Status: `[ ]`

---

## 15.5 Operational / approval floorplan

### Stock Levels

Not CRUD.

- availability analytics,
- low/out-of-stock views,
- warehouse/category filters,
- stock ledger / transfer / replenish actions.

Status: `[ ]`

### Expenses

- approval queue,
- record drawer,
- receipt preview,
- approval timeline,
- Approve / Reject / Request changes.

Status: `[ ]`

---

# 16. Module Migration Order

Recommended order after Phases 1–8:

1. Dashboard
2. Products
3. Chart of Accounts
4. Journal Entries
5. Purchase Orders
6. Stock Levels
7. Stock Transfers
8. Warehouses
9. Sales Invoices
10. Payments
11. Expenses
12. Customers
13. Suppliers
14. Users & Permissions
15. Notifications / Audit refinements

Reasoning:

- Dashboard validates core primitives.
- Products validates master-detail + record drawer.
- COA validates tree workspace.
- Journal validates financial document workflow.
- PO validates commercial line-item documents.
- Stock Levels validates analytical operational workspace.
- Remaining modules then reuse proven patterns.

---

# 17. Phase 10 — QA, Accessibility & Design-System Enforcement

## Theme matrix

Test:

- Light
- Dark
- System
- each primary preset
- custom primary
- custom accent
- S/M/L text
- Compact/Comfortable density
- minimum/default/maximum radius
- Boxed/Full width
- Fast/Normal motion
- Motion off
- OS reduced motion
- Sound on/off

## Responsive matrix

- large desktop
- normal desktop
- laptop
- tablet
- mobile

## Accessibility

- [ ] keyboard navigation
- [ ] focus visibility
- [ ] accessible icon labels
- [ ] semantic buttons/links
- [ ] dialog focus trapping
- [ ] drawer focus trapping
- [ ] reduced motion
- [ ] color contrast
- [ ] status not communicated by color alone

## Performance

- [ ] avoid per-cell motion listeners
- [ ] avoid unnecessary rerenders from theme changes
- [ ] virtualize large tables
- [ ] lazy load heavy feature screens
- [ ] prevent layout thrash during motion
- [ ] use transform/opacity for animation where possible

## Automated guardrails

Add tests/lint checks where practical for:

- [x] no decorative gradient declarations
- [x] no raw feature-level theme hex colors
- [ ] no arbitrary feature-specific radius rules
- [ ] no feature-specific animation durations
- [x] token resolver tests
- [x] palette generator tests
- [x] settings migration tests
- [ ] reduced-motion tests
- [x] light/dark token resolution tests

## Visual/E2E coverage

Reference flows:

- Dashboard
- Product list → drawer → edit modal
- COA tree → account detail
- Journal create/post/reverse
- PO create/submit/receive
- Expense review/approval
- Settings live preview

## Exit Criteria

The system should remain coherent under all supported combinations of theme, density, typography, radius, width, and motion preferences.

---

# 18. UX Surface Decision Guide

Before implementing a new feature, use this table.

| Scenario | Preferred surface | Why |
| --- | --- | --- |
| Quick destructive confirmation | Popconfirm | Minimal interruption |
| Confirmation with reason/extra field | Small contextual popover or modal | Needs input but remains focused |
| Create simple master record | Modal | Focused task |
| Edit simple master record | Modal | Focused task |
| View record details | Drawer | Preserve list context |
| Review/approve workflow record | Drawer | Preserve queue + show timeline/actions |
| Create quick two-line journal | Modal | Short focused entry |
| Create full journal | Full page | Complex line-based document |
| Create PO / Invoice / Transfer | Full page | Complex document |
| Configure workspace/theme | Full page | Multi-section settings |

---

# 19. Table Action Rules

### One or two frequent actions

Use icons with tooltips.

Example:

```text
[eye] [edit] [⋯]
```

### More actions

Only the most frequent action(s) remain inline.

Overflow contains icon + text:

```text
⋯
  Edit
  Duplicate
  Print
  View audit trail
  Archive
```

### Destructive actions

- visually distinct,
- not overly prominent,
- require confirmation,
- destructive workflow actions should not be represented as direct boolean toggles.

---

# 20. Color Usage Rules

Base UI:

- neutral canvas,
- neutral surfaces,
- strong readable text,
- subtle borders.

Semantic usage:

- Primary: identity, key action, selection
- Accent: secondary brand/context
- Green: success/active/completed
- Amber: pending/attention
- Red: destructive/error/critical
- Blue: informational

Category accents may be used for scanning, especially:

- stat card left border,
- icon chip,
- tiny indicator,
- chart series.

Do not color entire screens or cards unnecessarily.

---

# 21. Dark Mode Rules

Dark mode is not simply inverted light mode.

Use:

- solid dark surfaces,
- clear surface hierarchy,
- border-lightening,
- restrained shadows,
- semantic tints with reduced saturation,
- sufficient text contrast.

Avoid:

- black-on-black surfaces with invisible hierarchy,
- excessive glow,
- heavy white borders,
- oversaturated status colors.

---

# 22. Definition of a Professional Screen

Before marking a screen complete, check:

### Navigation

- Can the user tell where they are?
- Does the active domain/page remain obvious?

### Context

- Does viewing a record preserve previous list/filter state?

### Hierarchy

- Is the most important information visually strongest?
- Is secondary information quieter?

### Actions

- Is the primary action obvious?
- Are row actions icon-first?
- Are secondary actions under overflow?

### Motion

- Does the interaction respond immediately?
- Is exit faster than entry?
- Is any animation decorative or distracting?

### Color

- Does each color communicate meaning?
- Is the screen still understandable without relying only on color?

### Density

- Could someone use this screen for several hours without feeling overwhelmed?
- Is there enough information without oversized whitespace?

### Customization

- Does the screen correctly respond to theme/density/radius/text settings?

### Domain correctness

- Does the screen behave like real accounting/inventory/purchasing software rather than generic CRUD?

---

# 23. Suggested Code Organization

Target direction:

```text
src/
  theme/
    ThemeProvider.tsx
    resolveConfig.ts
    tokens/
      primitive.ts
      semantic.ts
      palette.ts
      typography.ts
      spacing.ts
      elevation.ts
      motion.ts

  components/
    primitives/
      Surface.tsx
      IconChip.tsx
      StatusPill.tsx
      ActionIcon.tsx
      StatCard.tsx

    overlays/
      AnimatedModal.tsx
      AnimatedDrawer.tsx
      ConfirmActionPopover.tsx
      RecordDrawer.tsx

    data/
      EnterpriseDataTable.tsx
      FilterBar.tsx
      EntityCell.tsx
      MoneyCell.tsx

    workflow/
      ApprovalTimeline.tsx
      WorkflowStatus.tsx
      ActivityTimeline.tsx

    shell/
      AppShell.tsx
      PrimaryRail.tsx
      SecondaryNav.tsx
      Topbar.tsx
      WorkspaceTabs.tsx

  features/
    inventory/
    accounting/
    purchasing/
    sales/
    system/
```

Exact folder migration should be incremental; do not create churn simply to match this tree.

---

# 24. Progress Log

Use this section as work progresses.

## 2026-09-23

- [x] Reference screenshots/videos analyzed.
- [x] UX principles documented.
- [x] Implementation phases agreed.
- [x] Living roadmap added to `v2.0`.
- [x] Phase 1 — Runtime Design Token Engine completed.
- [x] Runtime palette, semantic color, typography, spacing/density, radius, elevation, and layout tokens implemented.
- [x] Ant Design, CSS variables, and Tailwind v4 aliases unified behind the same runtime resolver.
- [x] Legacy AntD algorithm control removed; legacy Spacious density safely migrates to Comfortable.
- [x] Decorative gradients and shared CSS raw theme hex values removed; automated constitution guard added.
- [x] Phase 1 validation: unit tests and TypeScript/Vite production build pass; Pages preview build passes.
- [-] Phase 2 — Motion & Feedback Engine started. Next action is to audit existing motion helpers before changing them.

Future entries should record:

```text
YYYY-MM-DD
- Phase / component completed
- Important architectural decision
- Validation status
- Remaining issue / next step
```

---

# 25. Immediate Next Step

Phase 1 is complete. Continue sequentially with:

> **Phase 2 — Motion & Feedback Engine**

First inspect the existing `src/lib/motion` implementation and reuse sound/feedback foundations where they already match the product rules. Centralize durations/easing/reduced-motion behavior before migrating overlays or adding new interaction wrappers.

After Phase 2 passes its exit criteria, proceed to:

> **Phase 3 — Enterprise Workspace Shell**

Only after those foundations are stable should we continue redesigning individual ERP modules.
