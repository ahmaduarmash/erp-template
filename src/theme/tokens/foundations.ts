import type { TemplateConfig } from '../../config/template.config.ts';

export interface SpacingTokens {
  unit: number;
  space1: number;
  space2: number;
  space3: number;
  space4: number;
  space5: number;
  space6: number;
  space8: number;
  space12: number;
}

export interface RadiusTokens {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  control: number;
  card: number;
  overlay: number;
}

export interface TypographyTokens {
  fontFamily: string;
  rootSize: number;
  textXs: number;
  textSm: number;
  textMd: number;
  textLg: number;
  textXl: number;
  headingSm: number;
  headingMd: number;
  headingLg: number;
  statSm: number;
  statMd: number;
  statLg: number;
  lineHeightTight: number;
  lineHeightNormal: number;
}

export interface ElevationTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
}

export interface LayoutTokens {
  railWidth: number;
  secondaryNavWidth: number;
  headerHeight: number;
  tabbarHeight: number;
  contentMaxWidth: string;
  controlHeight: number;
  tableRowHeight: number;
  drawerWidthSm: number;
  drawerWidthMd: number;
  drawerWidthLg: number;
}

export function deriveSpacing(density: TemplateConfig['layout']['density']): SpacingTokens {
  const unit = density === 'compact' ? 3 : 4;
  return {
    unit,
    space1: unit,
    space2: unit * 2,
    space3: unit * 3,
    space4: unit * 4,
    space5: unit * 5,
    space6: unit * 6,
    space8: unit * 8,
    space12: unit * 12,
  };
}

export function deriveRadius(baseRadius: number): RadiusTokens {
  const base = Math.min(24, Math.max(0, baseRadius));
  if (base === 0) return { sm: 0, md: 0, lg: 0, xl: 0, control: 0, card: 0, overlay: 0 };
  const rounded = (value: number) => Math.round(Math.min(32, Math.max(2, value)));
  return {
    sm: rounded(base * 0.5),
    md: rounded(base * 0.75),
    lg: rounded(base),
    xl: rounded(base * 1.34),
    control: rounded(base * 0.67),
    card: rounded(base),
    overlay: rounded(base + 4),
  };
}

export function deriveTypography(
  fontFamily: TemplateConfig['typography']['fontFamily'],
  baseFontSize: TemplateConfig['typography']['baseFontSize'],
): TypographyTokens {
  const base = { sm: 14, md: 15, lg: 16 }[baseFontSize];
  return {
    fontFamily: `'${fontFamily} Variable', '${fontFamily}', sans-serif`,
    rootSize: base + 1,
    textXs: Math.max(11, base - 3),
    textSm: base - 1,
    textMd: base,
    textLg: base + 2,
    textXl: base + 5,
    headingSm: base + 3,
    headingMd: base + 7,
    headingLg: base + 13,
    statSm: base + 7,
    statMd: base + 13,
    statLg: base + 20,
    lineHeightTight: 1.25,
    lineHeightNormal: 1.55,
  };
}

export function deriveElevation(dark: boolean): ElevationTokens {
  if (dark) {
    return {
      xs: 'inset 0 1px 0 rgba(255, 255, 255, 0.025)',
      sm: '0 1px 0 rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.035)',
      md: '0 10px 28px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      lg: '0 18px 48px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.045)',
    };
  }
  return {
    xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
    sm: '0 2px 8px rgba(15, 23, 42, 0.06)',
    md: '0 12px 32px rgba(15, 23, 42, 0.09)',
    lg: '0 22px 56px rgba(15, 23, 42, 0.13)',
  };
}

export function deriveLayout(config: TemplateConfig): LayoutTokens {
  const compact = config.layout.density === 'compact';
  return {
    railWidth: compact ? 58 : 64,
    secondaryNavWidth: compact ? 224 : 240,
    headerHeight: compact ? 58 : 64,
    tabbarHeight: compact ? 38 : 42,
    contentMaxWidth: config.layout.contentWidth === 'boxed' ? '1280px' : 'none',
    controlHeight: compact ? 30 : 34,
    tableRowHeight: compact ? 36 : 44,
    drawerWidthSm: 360,
    drawerWidthMd: 480,
    drawerWidthLg: 640,
  };
}
