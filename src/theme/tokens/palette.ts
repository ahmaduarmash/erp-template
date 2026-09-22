export const shadeSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export type ShadeStep = (typeof shadeSteps)[number];
export type ColorScale = Record<ShadeStep, string>;

type Rgb = { r: number; g: number; b: number };

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  const short = /^#([\da-f])([\da-f])([\da-f])$/i.exec(trimmed);
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
  if (/^#[\da-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase();
  throw new Error(`Invalid hex color: ${value}`);
}

function toRgb(hex: string): Rgb {
  const value = normalizeHex(hex).slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const channel = (value: number) => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** Mix `from` toward `to` by a 0..1 amount. */
export function mixHex(from: string, to: string, amount: number): string {
  const a = toRgb(from);
  const b = toRgb(to);
  const ratio = Math.min(1, Math.max(0, amount));
  return toHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  });
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, alpha))})`;
}

export function generateShadeScale(baseColor: string): ColorScale {
  const base = normalizeHex(baseColor);
  return {
    50: mixHex(base, '#ffffff', 0.92),
    100: mixHex(base, '#ffffff', 0.84),
    200: mixHex(base, '#ffffff', 0.68),
    300: mixHex(base, '#ffffff', 0.48),
    400: mixHex(base, '#ffffff', 0.26),
    500: base,
    600: mixHex(base, '#000000', 0.12),
    700: mixHex(base, '#000000', 0.24),
    800: mixHex(base, '#000000', 0.36),
    900: mixHex(base, '#000000', 0.48),
    950: mixHex(base, '#000000', 0.62),
  };
}

export const neutralScale: ColorScale = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#111827',
  950: '#090e18',
};

export interface PrimitiveColorTokens {
  primary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  danger: ColorScale;
  info: ColorScale;
  category: {
    inventory: string;
    purchasing: string;
    sales: string;
    accounting: string;
    organization: string;
    system: string;
  };
}

export function createPrimitiveColors(primaryColor: string, accentColor: string): PrimitiveColorTokens {
  const primary = generateShadeScale(primaryColor);
  const accent = generateShadeScale(accentColor);
  const success = generateShadeScale('#168a5b');
  const warning = generateShadeScale('#b7791f');
  const danger = generateShadeScale('#c74455');
  const info = generateShadeScale('#3478c8');

  return {
    primary,
    accent,
    neutral: neutralScale,
    success,
    warning,
    danger,
    info,
    category: {
      inventory: accent[500],
      purchasing: warning[500],
      sales: info[500],
      accounting: primary[500],
      organization: success[500],
      system: neutralScale[600],
    },
  };
}
