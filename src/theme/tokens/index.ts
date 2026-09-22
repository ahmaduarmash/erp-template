import type { TemplateConfig } from '../../config/template.config.ts';
import { createPrimitiveColors, shadeSteps, type PrimitiveColorTokens } from './palette.ts';
import { createSemanticColors, type SemanticColorTokens } from './semantic.ts';
import {
  deriveElevation,
  deriveLayout,
  deriveRadius,
  deriveSpacing,
  deriveTypography,
  type ElevationTokens,
  type LayoutTokens,
  type RadiusTokens,
  type SpacingTokens,
  type TypographyTokens,
} from './foundations.ts';
import { deriveMotion, type MotionTokens } from './motion.ts';

export interface DesignTokens {
  primitive: PrimitiveColorTokens;
  semantic: SemanticColorTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  typography: TypographyTokens;
  elevation: ElevationTokens;
  layout: LayoutTokens;
  motion: MotionTokens;
}

export function resolveDesignTokens(config: TemplateConfig, dark: boolean): DesignTokens {
  const primitive = createPrimitiveColors(config.theme.primaryColor, config.theme.accentColor);
  return {
    primitive,
    semantic: createSemanticColors(primitive, dark),
    spacing: deriveSpacing(config.layout.density),
    radius: deriveRadius(config.theme.borderRadius),
    typography: deriveTypography(config.typography.fontFamily, config.typography.baseFontSize),
    elevation: deriveElevation(dark),
    layout: deriveLayout(config),
    motion: deriveMotion(config.motion.speed),
  };
}

const px = (value: number) => `${value}px`;
const ms = (value: number) => `${Math.round(value * 1000)}ms`;

export function designTokensToCssVariables(tokens: DesignTokens): Record<string, string> {
  const variables: Record<string, string> = {};

  for (const step of shadeSteps) {
    variables[`--primary-${step}`] = tokens.primitive.primary[step];
    variables[`--accent-${step}`] = tokens.primitive.accent[step];
    variables[`--neutral-${step}`] = tokens.primitive.neutral[step];
    variables[`--success-${step}`] = tokens.primitive.success[step];
    variables[`--warning-${step}`] = tokens.primitive.warning[step];
    variables[`--danger-${step}`] = tokens.primitive.danger[step];
    variables[`--info-${step}`] = tokens.primitive.info[step];
  }

  Object.assign(variables, {
    '--category-inventory': tokens.primitive.category.inventory,
    '--category-purchasing': tokens.primitive.category.purchasing,
    '--category-sales': tokens.primitive.category.sales,
    '--category-accounting': tokens.primitive.category.accounting,
    '--category-organization': tokens.primitive.category.organization,
    '--category-system': tokens.primitive.category.system,

    '--bg-base': tokens.semantic.bgBase,
    '--bg-surface': tokens.semantic.bgSurface,
    '--bg-subtle': tokens.semantic.bgSubtle,
    '--bg-elevated': tokens.semantic.bgElevated,
    '--bg-selected': tokens.semantic.bgSelected,
    '--text-primary': tokens.semantic.textPrimary,
    '--text-secondary': tokens.semantic.textSecondary,
    '--text-muted': tokens.semantic.textMuted,
    '--text-disabled': tokens.semantic.textDisabled,
    '--text-on-action': tokens.semantic.textOnAction,
    '--border-default': tokens.semantic.borderDefault,
    '--border-strong': tokens.semantic.borderStrong,
    '--border-subtle': tokens.semantic.borderSubtle,
    '--action-primary': tokens.semantic.actionPrimary,
    '--action-primary-hover': tokens.semantic.actionPrimaryHover,
    '--action-primary-active': tokens.semantic.actionPrimaryActive,
    '--focus-ring': tokens.semantic.focusRing,
    '--selection-bg': tokens.semantic.selectionBg,
    '--semantic-success': tokens.semantic.success,
    '--semantic-warning': tokens.semantic.warning,
    '--semantic-danger': tokens.semantic.danger,
    '--semantic-info': tokens.semantic.info,
    '--overlay-mask': tokens.semantic.overlayMask,

    '--spacing-unit': px(tokens.spacing.unit),
    '--space-1': px(tokens.spacing.space1),
    '--space-2': px(tokens.spacing.space2),
    '--space-3': px(tokens.spacing.space3),
    '--space-4': px(tokens.spacing.space4),
    '--space-5': px(tokens.spacing.space5),
    '--space-6': px(tokens.spacing.space6),
    '--space-8': px(tokens.spacing.space8),
    '--space-12': px(tokens.spacing.space12),

    '--radius-sm': px(tokens.radius.sm),
    '--radius-md': px(tokens.radius.md),
    '--radius-lg': px(tokens.radius.lg),
    '--radius-xl': px(tokens.radius.xl),
    '--radius-control': px(tokens.radius.control),
    '--radius-card': px(tokens.radius.card),
    '--radius-overlay': px(tokens.radius.overlay),

    '--font-family': tokens.typography.fontFamily,
    '--font-scale': String(tokens.typography.textMd / 15),
    '--text-xs': px(tokens.typography.textXs),
    '--text-sm': px(tokens.typography.textSm),
    '--text-md': px(tokens.typography.textMd),
    '--text-lg': px(tokens.typography.textLg),
    '--text-xl': px(tokens.typography.textXl),
    '--heading-sm': px(tokens.typography.headingSm),
    '--heading-md': px(tokens.typography.headingMd),
    '--heading-lg': px(tokens.typography.headingLg),
    '--stat-sm': px(tokens.typography.statSm),
    '--stat-md': px(tokens.typography.statMd),
    '--stat-lg': px(tokens.typography.statLg),
    '--line-height-tight': String(tokens.typography.lineHeightTight),
    '--line-height-normal': String(tokens.typography.lineHeightNormal),

    '--elevation-xs': tokens.elevation.xs,
    '--elevation-sm': tokens.elevation.sm,
    '--elevation-md': tokens.elevation.md,
    '--elevation-lg': tokens.elevation.lg,

    '--rail-width': px(tokens.layout.railWidth),
    '--secondary-nav-width': px(tokens.layout.secondaryNavWidth),
    '--header-height': px(tokens.layout.headerHeight),
    '--tabbar-height': px(tokens.layout.tabbarHeight),
    '--content-max-width': tokens.layout.contentMaxWidth,
    '--control-height': px(tokens.layout.controlHeight),
    '--table-row-height': px(tokens.layout.tableRowHeight),
    '--drawer-width-sm': px(tokens.layout.drawerWidthSm),
    '--drawer-width-md': px(tokens.layout.drawerWidthMd),
    '--drawer-width-lg': px(tokens.layout.drawerWidthLg),

    '--motion-micro': ms(tokens.motion.micro),
    '--motion-standard': ms(tokens.motion.standard),
    '--motion-page': ms(tokens.motion.page),
    '--motion-modal-enter': ms(tokens.motion.modalEnter),
    '--motion-modal-exit': ms(tokens.motion.modalExit),
    '--motion-drawer-enter': ms(tokens.motion.drawerEnter),
    '--motion-drawer-exit': ms(tokens.motion.drawerExit),
    '--motion-ease-enter': tokens.motion.easingEnterCss,
    '--motion-ease-exit': tokens.motion.easingExitCss,

    // Compatibility aliases for existing screens. New code should use semantic/runtime tokens above.
    '--color-primary': tokens.semantic.actionPrimary,
    '--color-accent': tokens.primitive.accent[500],
    '--primary-soft': tokens.semantic.selectionBg,
    '--surface': tokens.semantic.bgSurface,
    '--canvas': tokens.semantic.bgBase,
    '--text': tokens.semantic.textPrimary,
    '--muted': tokens.semantic.textSecondary,
    '--line': tokens.semantic.borderDefault,
    '--radius-base': px(tokens.radius.card),
    '--font-sans': tokens.typography.fontFamily,
    '--font-size': px(tokens.typography.textMd),
    '--space': px(tokens.spacing.space6),
    '--success': tokens.semantic.success,
    '--warning': tokens.semantic.warning,
    '--error': tokens.semantic.danger,
  });

  return variables;
}

export * from './palette.ts';
export * from './semantic.ts';
export * from './foundations.ts';
export * from './motion.ts';
