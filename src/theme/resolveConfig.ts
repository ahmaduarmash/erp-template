import { templateConfig, type TemplateConfig } from '../config/template.config.ts';

type JsonObject = Record<string, unknown>;
const object = (value: unknown): value is JsonObject =>
  !!value && typeof value === 'object' && !Array.isArray(value);

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : null;
}

function safeLogoUrl(value: unknown) {
  if (value === '') return '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (/^https:\/\//i.test(trimmed) || /^data:image\/(?:png|jpeg|webp|svg\+xml);/i.test(trimmed))
    return trimmed.slice(0, 4000);
  return null;
}

/**
 * Validate persisted preferences and migrate legacy values.
 * Project defaults remain authoritative for unknown or invalid fields.
 */
export function resolveConfig(saved: unknown): TemplateConfig {
  const config = structuredClone(templateConfig);
  if (!object(saved)) return config;

  const allowed: Record<string, string[]> = {
    'theme.mode': ['light', 'dark', 'system'],
    'typography.fontFamily': ['Inter', 'Manrope', 'Public Sans'],
    'typography.baseFontSize': ['sm', 'md', 'lg'],
    'layout.density': ['compact', 'comfortable'],
    'layout.contentWidth': ['boxed', 'full'],
    'motion.speed': ['fast', 'normal'],
  };

  for (const group of Object.keys(config)) {
    if (!object(saved[group])) continue;
    const target = (config as unknown as Record<string, JsonObject>)[group];

    for (const [key, value] of Object.entries(saved[group])) {
      if (!(key in target)) continue;
      const path = `${group}.${key}`;

      if (group === 'brand') {
        if (key === 'name') {
          const cleaned = cleanText(value, 48);
          if (cleaned) config.brand.name = cleaned;
        } else if (key === 'tagline') {
          const cleaned = cleanText(value, 120);
          if (cleaned !== null) config.brand.tagline = cleaned;
        } else if (key === 'logoUrl') {
          const logoUrl = safeLogoUrl(value);
          if (logoUrl !== null) config.brand.logoUrl = logoUrl;
        }
      } else if (allowed[path]) {
        if (typeof value === 'string' && allowed[path].includes(value)) target[key] = value;
      } else if (group === 'theme' && key.endsWith('Color')) {
        if (typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)) target[key] = value;
      } else if (path === 'theme.borderRadius') {
        if (typeof value === 'number' && Number.isFinite(value))
          target[key] = Math.min(24, Math.max(0, value));
      } else if (path === 'sound.volume') {
        if (typeof value === 'number' && Number.isFinite(value))
          target[key] = Math.min(1, Math.max(0, value));
      } else if (path === 'table.defaultPageSize') {
        if (typeof value === 'number' && [10, 20, 50, 100, 250, 500].includes(value))
          target[key] = value;
      } else if (path === 'table.hiddenColumns') {
        if (Array.isArray(value)) target[key] = value.filter((v) => typeof v === 'string');
      } else if (path === 'sound.categories' && object(value)) {
        for (const category of Object.keys(config.sound.categories)) {
          if (typeof value[category] === 'boolean')
            config.sound.categories[category as keyof typeof config.sound.categories] = value[
              category
            ] as boolean;
        }
      } else if (typeof target[key] === 'boolean' && typeof value === 'boolean') {
        target[key] = value;
      }
    }
  }

  // v1 exposed a third density tier. Collapse it to the supported comfortable tier.
  if (object(saved.layout) && saved.layout.density === 'spacious') config.layout.density = 'comfortable';

  return config;
}
