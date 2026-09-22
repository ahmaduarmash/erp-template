import type { PrimitiveColorTokens } from './palette.ts';
import { mixHex, rgba } from './palette.ts';

export interface SemanticColorTokens {
  bgBase: string;
  bgSurface: string;
  bgSubtle: string;
  bgElevated: string;
  bgSelected: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  textOnAction: string;
  borderDefault: string;
  borderStrong: string;
  borderSubtle: string;
  actionPrimary: string;
  actionPrimaryHover: string;
  actionPrimaryActive: string;
  focusRing: string;
  selectionBg: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  overlayMask: string;
}

export function createSemanticColors(
  primitive: PrimitiveColorTokens,
  dark: boolean,
): SemanticColorTokens {
  const { neutral, primary, success, warning, danger, info } = primitive;

  if (dark) {
    return {
      bgBase: neutral[950],
      bgSurface: neutral[900],
      bgSubtle: mixHex(neutral[900], neutral[800], 0.5),
      bgElevated: neutral[800],
      bgSelected: mixHex(neutral[900], primary[800], 0.34),
      textPrimary: neutral[50],
      textSecondary: neutral[300],
      textMuted: neutral[400],
      textDisabled: neutral[600],
      textOnAction: '#ffffff',
      borderDefault: neutral[700],
      borderStrong: neutral[600],
      borderSubtle: neutral[800],
      actionPrimary: primary[400],
      actionPrimaryHover: primary[300],
      actionPrimaryActive: primary[500],
      focusRing: rgba(primary[400], 0.42),
      selectionBg: rgba(primary[400], 0.18),
      success: success[400],
      warning: warning[400],
      danger: danger[400],
      info: info[400],
      overlayMask: rgba(neutral[950], 0.72),
    };
  }

  return {
    bgBase: neutral[50],
    bgSurface: '#ffffff',
    bgSubtle: neutral[100],
    bgElevated: '#ffffff',
    bgSelected: primary[50],
    textPrimary: neutral[950],
    textSecondary: neutral[600],
    textMuted: neutral[500],
    textDisabled: neutral[400],
    textOnAction: '#ffffff',
    borderDefault: neutral[200],
    borderStrong: neutral[300],
    borderSubtle: neutral[100],
    actionPrimary: primary[500],
    actionPrimaryHover: primary[600],
    actionPrimaryActive: primary[700],
    focusRing: rgba(primary[500], 0.3),
    selectionBg: primary[100],
    success: success[600],
    warning: warning[600],
    danger: danger[600],
    info: info[600],
    overlayMask: rgba(neutral[950], 0.46),
  };
}
