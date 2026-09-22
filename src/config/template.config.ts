/** The only file a project needs to edit to reskin the starter. */
export interface TemplateConfig {
  brand: { name: string; logoUrl: string; tagline: string };
  theme: {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    accentColor: string;
    borderRadius: number;
  };
  typography: { fontFamily: 'Inter' | 'Manrope' | 'Public Sans'; baseFontSize: 'sm' | 'md' | 'lg' };
  layout: {
    density: 'compact' | 'comfortable';
    sidebarDefaultCollapsed: boolean;
    contentWidth: 'boxed' | 'full';
  };
  motion: { enabled: boolean; respectReducedMotion: boolean; speed: 'fast' | 'normal' };
  sound: {
    enabled: boolean;
    volume: number;
    categories: { click: boolean; success: boolean; warning: boolean; notification: boolean };
  };
  table: { defaultPageSize: number; hiddenColumns: string[] };
  notifications: { inventory: boolean; finance: boolean; security: boolean };
}

export const templateConfig: TemplateConfig = {
  brand: { name: 'Aster', logoUrl: '', tagline: 'Your operations, in focus.' },
  theme: {
    mode: 'light',
    primaryColor: '#6155d9',
    accentColor: '#149b8b',
    borderRadius: 12,
  },
  typography: { fontFamily: 'Inter', baseFontSize: 'md' },
  layout: { density: 'comfortable', sidebarDefaultCollapsed: false, contentWidth: 'full' },
  motion: { enabled: true, respectReducedMotion: true, speed: 'normal' },
  sound: {
    enabled: false,
    volume: 0.18,
    categories: { click: true, success: true, warning: true, notification: true },
  },
  table: { defaultPageSize: 10, hiddenColumns: [] },
  notifications: { inventory: true, finance: true, security: true },
};

export const allowedFonts = ['Inter', 'Manrope', 'Public Sans'] as const;
