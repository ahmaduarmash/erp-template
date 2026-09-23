# ERP Template v2.0 — Current Implementation Status

> **Target branch:** `v2.0`  
> **Polish branch:** `v2.0-ui-polish`  
> **Updated:** 2026-09-23  
> **Roadmap source of truth:** `docs/DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md`

## Overall progress

- **Completed phases:** 10 / 10
- **Roadmap status:** Core v2.0 design-system implementation complete
- **Current work:** Post-roadmap UI polish, compatibility cleanup, and regression hardening

## Phase status

| Phase | Area | Status |
| --- | --- | --- |
| 1 | Runtime Design Token Engine | Complete |
| 2 | Motion & Feedback Engine | Complete |
| 3 | Enterprise Workspace Shell | Complete |
| 4 | Core Visual Primitives | Complete |
| 5 | Overlay & Interaction Architecture | Complete |
| 6 | Enterprise Data Workspace | Complete |
| 7 | Workflow / Approval System | Complete |
| 8 | Settings & Live Theme Studio | Complete |
| 9 | ERP Floorplan / Module Migration | Complete |
| 10 | QA, Accessibility & Design-System Enforcement | Complete |

## Completed foundation

### Runtime design system

The runtime token engine owns semantic light/dark color, typography, spacing/density, radius, elevation, layout dimensions, Ant Design mappings, Tailwind mappings, motion timing, runtime settings, and design-system enforcement. Raw shared-theme values and decorative gradients are guarded by automated tests.

### Motion and interaction

The application uses centralized fast motion timing, faster exits than entries, shared animated modal/drawer/popover/dropdown behavior, reduced-motion support, restrained press feedback, and synthesized Web Audio feedback.

### Enterprise shell and primitives

The workspace shell, business-area rail, contextual navigation, global header/search, persistent workspace tabs, responsive navigation, shared primitives, semantic status vocabulary, object headers, command bars, filters, entity cells, KPI surfaces, and hierarchy/document floorplans are established.

### Overlay architecture

`CreateModal`, `EditModal`, `RecordDrawer`, `ApprovalDrawer`, and `ConfirmActionPopover` are the shared interaction surfaces. Compatibility CRUD wrappers delegate into those primitives rather than maintaining a separate overlay design system.

### Enterprise data workspace

`EnterpriseDataTable` is the forward master-data contract with URL-backed query state, search, structured filters/reset, sticky headers, sorting, pagination, client/server modes, saved views, refresh/export, column visibility, conditional bulk actions, virtualization, and loading/error/empty states.

### ERP floorplans and QA

Workflow, settings/theme studio, ERP-specific floorplans, accessibility checks, responsive contracts, token enforcement, and regression tests are implemented. `DataTable` and a small number of compatibility selectors remain only as migration surfaces for legacy pages.

## Post-roadmap UI polish — 2026-09-23

A focused visual-polish pass was performed after the 10-phase roadmap completed.

Implemented on `v2.0-ui-polish`:

- Added the missing `record-drawer-footer-actions` layout contract.
- Increased drawer toolbar/header/body breathing room and corrected mobile spacing.
- Balanced intent-modal header/body/footer rhythm and increased title/icon separation.
- Scoped modal minimum width to `.intent-modal` instead of globally constraining every Ant Design modal.
- Consolidated structural `.erp-kpi` ownership into `erp.css`; `design-v2.css` now retains presentation-only KPI typography.
- Marked legacy ERP toolbar/entity selectors as compatibility surfaces so new code does not expand the old naming system.
- Added optional context-aware `description` support to `CrudModal` while preserving its existing default copy.
- Added optional context-aware `subtitle` support to `CrudDrawer` while preserving its existing default copy.
- Preserved the public `StatusBadge` export but made it delegate to `SemanticStatus`, preventing legacy callers such as Audit Log from breaking while removing the old Tag-based visual implementation.

## Current technical-debt / migration notes

- `DataTable` and `DomainTable` remain compatibility surfaces. New generic master-data screens should use `EnterpriseDataTable`.
- `.erp-entity-cell`, `.erp-table-toolbar`, `.erp-security-toolbar`, and related compatibility selectors should not be introduced in new code. Shared primitives and `.ui-*` contracts are the forward design-system surface.
- Legacy compatibility APIs should be retired only when their remaining call sites have been migrated; avoid breaking removals during visual-polish work.
- Complex ERP documents must continue using domain-specific document/floorplan components rather than reverting to a generic CRUD page.

## Quality gate

The baseline `v2.0` commit completed the existing GitHub Actions validation and v2.0 preview deployment successfully. Every post-roadmap polish change must continue to pass the repository's `Validate starter` workflow, which runs the automated test suite and production TypeScript/Vite build, before being promoted into `v2.0`.

## Summary

The v2.0 roadmap is **10 of 10 phases complete**. Current work is refinement rather than unfinished roadmap implementation: improve visual rhythm, remove CSS ownership ambiguity, preserve migration compatibility, and keep all changes behind the existing automated quality gate.
