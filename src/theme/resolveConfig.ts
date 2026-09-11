import { templateConfig, type TemplateConfig } from '../config/template.config.ts';
type JsonObject = Record<string, unknown>;
const object = (value: unknown): value is JsonObject =>
  !!value && typeof value === 'object' && !Array.isArray(value);
/** Validate persisted overrides. Defaults remain authoritative for unknown/invalid fields. */
export function resolveConfig(saved: unknown): TemplateConfig {
  const config = structuredClone(templateConfig);
  if (!object(saved)) return config;
  const allowed: Record<string, string[]> = {
    'theme.mode': ['light', 'dark', 'system'],
    'theme.algorithm': ['default', 'dark', 'compact'],
    'typography.fontFamily': ['Inter', 'Manrope', 'Public Sans'],
    'typography.baseFontSize': ['sm', 'md', 'lg'],
    'layout.density': ['compact', 'comfortable', 'spacious'],
    'layout.contentWidth': ['boxed', 'full'],
    'motion.speed': ['fast', 'normal'],
  };
  for (const group of Object.keys(config)) {
    if (!object(saved[group])) continue;
    const target = (config as unknown as Record<string, JsonObject>)[group];
    for (const [key, value] of Object.entries(saved[group])) {
      if (!(key in target) || group === 'brand') continue; // Identity always comes from the project config.
      const path = `${group}.${key}`;
      if (allowed[path]) {
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
      } else if (typeof target[key] === 'boolean' && typeof value === 'boolean')
        target[key] = value;
    }
  }
  return config;
}
