import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { App, ConfigProvider, theme } from 'antd';
import { templateConfig, type TemplateConfig } from '../config/template.config';
import { resolveConfig } from './resolveConfig';
import { readStored, writeStored } from '../lib/storage';
import { designTokensToCssVariables, resolveDesignTokens, type DesignTokens } from './tokens';

function loadConfig(userId: string): TemplateConfig {
  return resolveConfig(readStored<unknown>(`aster:preferences:v1:${userId}`, {}));
}

const Context = createContext<{
  config: TemplateConfig;
  dark: boolean;
  tokens: DesignTokens;
  setGroup: <K extends keyof TemplateConfig>(group: K, value: Partial<TemplateConfig[K]>) => void;
  reset: () => void;
  storageError: boolean;
}>(null!);

export const useTemplate = () => useContext(Context);

function TokenSync({ children }: { children: ReactNode }) {
  const { config, dark, tokens } = useTemplate();

  useEffect(() => {
    const variables = designTokensToCssVariables(tokens);
    for (const [name, value] of Object.entries(variables))
      document.documentElement.style.setProperty(name, value);

    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.density = config.layout.density;
    document.documentElement.dataset.motion = config.motion.enabled ? 'on' : 'off';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    document.documentElement.style.fontSize = `${tokens.typography.rootSize}px`;
    document.title = `${config.brand.name} · Workspace`;

    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.href =
      config.brand.logoUrl ||
      `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="${tokens.semantic.actionPrimary}"/><path d="M16 5v22M5 16h22M8 8l16 16M8 24L24 8" stroke="white" stroke-width="3"/></svg>`)}`;
  }, [config, dark, tokens]);

  return children;
}

export function ThemeProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [config, setConfig] = useState(() => loadConfig(userId));
  const [storageError, setStorageError] = useState(false);
  const [systemDark, setSystemDark] = useState(
    () => matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const dark = config.theme.mode === 'dark' || (config.theme.mode === 'system' && systemDark);
  const tokens = useMemo(() => resolveDesignTokens(config, dark), [config, dark]);

  const value = useMemo(
    () => ({
      config,
      dark,
      tokens,
      storageError,
      setGroup: <K extends keyof TemplateConfig>(group: K, patch: Partial<TemplateConfig[K]>) =>
        setConfig((previous) => ({ ...previous, [group]: { ...previous[group], ...patch } })),
      reset: () => setConfig(structuredClone(templateConfig)),
    }),
    [config, dark, tokens, storageError],
  );

  useEffect(() => {
    setStorageError(!writeStored(`aster:preferences:v1:${userId}`, config));
  }, [config, userId]);

  const themeValue = useMemo(
    () => ({
      algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: tokens.semantic.actionPrimary,
        colorPrimaryHover: tokens.semantic.actionPrimaryHover,
        colorPrimaryActive: tokens.semantic.actionPrimaryActive,
        colorBgBase: tokens.semantic.bgBase,
        colorBgContainer: tokens.semantic.bgSurface,
        colorBgElevated: tokens.semantic.bgElevated,
        colorText: tokens.semantic.textPrimary,
        colorTextSecondary: tokens.semantic.textSecondary,
        colorTextDisabled: tokens.semantic.textDisabled,
        colorBorder: tokens.semantic.borderDefault,
        colorBorderSecondary: tokens.semantic.borderSubtle,
        colorSuccess: tokens.semantic.success,
        colorWarning: tokens.semantic.warning,
        colorError: tokens.semantic.danger,
        colorInfo: tokens.semantic.info,
        borderRadius: tokens.radius.card,
        borderRadiusSM: tokens.radius.sm,
        borderRadiusLG: tokens.radius.lg,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.textMd,
        controlHeight: tokens.layout.controlHeight,
        motion: config.motion.enabled,
        boxShadow: tokens.elevation.sm,
        boxShadowSecondary: tokens.elevation.md,
      },
      components: {
        Table: {
          cellPaddingBlock: config.layout.density === 'compact' ? tokens.spacing.space2 : tokens.spacing.space3,
          headerBg: tokens.semantic.bgSubtle,
          headerColor: tokens.semantic.textSecondary,
          rowHoverBg: tokens.semantic.bgSelected,
          borderColor: tokens.semantic.borderDefault,
        },
        Button: {
          primaryShadow: tokens.elevation.xs,
          defaultShadow: 'none',
          fontWeight: 590,
          borderRadius: tokens.radius.control,
        },
        Input: { borderRadius: tokens.radius.control },
        Select: { borderRadius: tokens.radius.control },
        DatePicker: { borderRadius: tokens.radius.control },
        Modal: {
          borderRadiusLG: tokens.radius.overlay,
          paddingContentHorizontalLG: tokens.spacing.space6,
        },
        Drawer: {
          paddingLG: tokens.spacing.space6,
        },
        Dropdown: {
          borderRadiusLG: tokens.radius.overlay,
        },
        Tabs: {
          inkBarColor: tokens.semantic.actionPrimary,
          itemSelectedColor: tokens.semantic.actionPrimary,
          itemHoverColor: tokens.semantic.actionPrimaryHover,
        },
      },
    }),
    [config.layout.density, config.motion.enabled, dark, tokens],
  );

  return (
    <Context.Provider value={value}>
      <ConfigProvider
        theme={themeValue}
        componentSize={config.layout.density === 'compact' ? 'small' : 'middle'}
      >
        <App>
          <TokenSync>{children}</TokenSync>
        </App>
      </ConfigProvider>
    </Context.Provider>
  );
}
