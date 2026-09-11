import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { App, ConfigProvider, theme } from 'antd';
import { templateConfig, type TemplateConfig } from '../config/template.config';
import { resolveConfig } from './resolveConfig';
import { readStored, writeStored } from '../lib/storage';

function loadConfig(userId: string): TemplateConfig {
  return resolveConfig(readStored<unknown>(`aster:preferences:v1:${userId}`, {}));
}
const Context = createContext<{
  config: TemplateConfig;
  dark: boolean;
  setGroup: <K extends keyof TemplateConfig>(group: K, value: Partial<TemplateConfig[K]>) => void;
  reset: () => void;
  storageError: boolean;
}>(null!);
export const useTemplate = () => useContext(Context);
function TokenSync({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  const { config, dark } = useTemplate();
  useEffect(() => {
    const vars: Record<string, string> = {
      '--color-primary': token.colorPrimary,
      '--color-accent': config.theme.accentColor,
      '--primary-soft': token.colorPrimaryBg,
      '--surface': token.colorBgContainer,
      '--canvas': token.colorBgLayout,
      '--text': token.colorText,
      '--muted': token.colorTextSecondary,
      '--line': token.colorBorderSecondary,
      '--radius-base': `${token.borderRadius}px`,
      '--font-sans': token.fontFamily,
      '--font-size': `${token.fontSize}px`,
      '--space': `${{ compact: 16, comfortable: 24, spacious: 32 }[config.layout.density] || 24}px`,
      '--success': token.colorSuccess,
      '--warning': token.colorWarning,
      '--error': token.colorError,
    };
    for (const [name, value] of Object.entries(vars))
      document.documentElement.style.setProperty(name, value);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.motion = config.motion.enabled ? 'on' : 'off';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    document.documentElement.style.fontSize = `${(token.fontSize / 15) * 16}px`;
    document.title = `${config.brand.name} · Workspace`;
    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.href =
      config.brand.logoUrl ||
      `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="${config.theme.primaryColor}"/><path d="M16 5v22M5 16h22M8 8l16 16M8 24L24 8" stroke="white" stroke-width="3"/></svg>`)}`;
  }, [token, config, dark]);
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
  const dark =
    config.theme.mode === 'dark' ||
    (config.theme.mode === 'system' && systemDark) ||
    config.theme.algorithm === 'dark';
  const value = useMemo(
    () => ({
      config,
      dark,
      storageError,
      setGroup: <K extends keyof TemplateConfig>(group: K, patch: Partial<TemplateConfig[K]>) =>
        setConfig((previous) => ({ ...previous, [group]: { ...previous[group], ...patch } })),
      reset: () => setConfig(structuredClone(templateConfig)),
    }),
    [config, dark, storageError],
  );
  useEffect(() => {
    setStorageError(!writeStored(`aster:preferences:v1:${userId}`, config));
  }, [config, userId]);
  const themeValue = useMemo(
    () => ({
      algorithm: [
        dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        ...(config.theme.algorithm === 'compact' || config.layout.density === 'compact'
          ? [theme.compactAlgorithm]
          : []),
      ],
      token: {
        colorPrimary: config.theme.primaryColor,
        borderRadius: config.theme.borderRadius,
        fontFamily: `'${config.typography.fontFamily} Variable', sans-serif`,
        fontSize: { sm: 14, md: 15, lg: 16 }[config.typography.baseFontSize],
        motion: false,
      },
      components: {
        Table: {
          cellPaddingBlock: { compact: 8, comfortable: 13, spacious: 18 }[config.layout.density],
        },
        Button: { primaryShadow: 'none' },
      },
    }),
    [config, dark],
  );
  return (
    <Context.Provider value={value}>
      <ConfigProvider
        theme={themeValue}
        componentSize={
          config.layout.density === 'compact'
            ? 'small'
            : config.layout.density === 'spacious'
              ? 'large'
              : 'middle'
        }
      >
        <App>
          <TokenSync>{children}</TokenSync>
        </App>
      </ConfigProvider>
    </Context.Provider>
  );
}
