import { useId, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  ColorPicker,
  Form,
  Input,
  Radio,
  Select,
  Slider,
  Switch,
  Tabs,
} from 'antd';
import {
  DesktopOutlined,
  MoonOutlined,
  ReloadOutlined,
  SoundOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { allowedFonts } from '../config/template.config';
import { useFeedback } from '../components/feedback';
import { StatusPill } from '../components/primitives';
import { PageHeader } from '../components/shell/PageHeader';
import { useWorkspace } from '../data/WorkspaceProvider';
import { MotionSurface } from '../lib/motion';
import { useSound } from '../lib/sound/useSound';
import { useTemplate } from '../theme/ThemeProvider';
import './settings.css';

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="settings-row">
      <div className="settings-row-copy">
        <strong id={id}>{title}</strong>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="settings-row-control" aria-labelledby={id}>{children}</div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  extra,
  children,
}: {
  title: string;
  description?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="settings-section">
      <header className="settings-section-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {extra}
      </header>
      {children}
    </section>
  );
}

export default function Settings() {
  const {
    config,
    setGroup,
    reset,
    reducedMotion,
    motionEnabled,
    storageError,
  } = useTemplate();
  const sound = useSound();
  const feedback = useFeedback();
  const workspace = useWorkspace();

  const studio = (
    <div className="settings-studio">
      <div className="settings-stack">
        {storageError ? (
          <Alert
            type="warning"
            showIcon
            message="Preferences could not be saved"
            description="Your live changes still apply for this session, but browser storage is unavailable."
          />
        ) : null}

        <SettingsSection
          title="Brand"
          description="Project identity is part of the same live runtime configuration as the rest of the design system."
        >
          <div className="settings-brand-grid">
            <div>
              <label htmlFor="brand-name">Product name</label>
              <Input
                id="brand-name"
                value={config.brand.name}
                maxLength={48}
                onChange={(event) => setGroup('brand', { name: event.target.value })}
              />
            </div>
            <div>
              <label htmlFor="brand-tagline">Tagline</label>
              <Input
                id="brand-tagline"
                value={config.brand.tagline}
                maxLength={120}
                onChange={(event) => setGroup('brand', { tagline: event.target.value })}
              />
            </div>
            <div className="settings-brand-wide">
              <label htmlFor="brand-logo">Logo URL</label>
              <Input
                id="brand-logo"
                value={config.brand.logoUrl}
                placeholder="https://… or leave empty for the generated mark"
                onChange={(event) => setGroup('brand', { logoUrl: event.target.value })}
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Appearance" description="Tune the visual system without rebuilding the application.">
          <SettingRow title="Color mode" description="Use light, dark, or follow the operating system.">
            <Radio.Group
              value={config.theme.mode}
              onChange={(event) => setGroup('theme', { mode: event.target.value })}
              optionType="button"
              options={[
                { value: 'light', label: <><SunOutlined /> Light</> },
                { value: 'dark', label: <><MoonOutlined /> Dark</> },
                { value: 'system', label: <><DesktopOutlined /> System</> },
              ]}
            />
          </SettingRow>
          <SettingRow title="Primary color" description="Primary actions, focus, and selected states.">
            <div className="settings-color-control">
              <ColorPicker
                value={config.theme.primaryColor}
                showText
                onChange={(color) => setGroup('theme', { primaryColor: color.toHexString() })}
              />
            </div>
          </SettingRow>
          <SettingRow title="Accent color" description="Secondary identity and restrained category emphasis.">
            <div className="settings-color-control">
              <ColorPicker
                value={config.theme.accentColor}
                showText
                onChange={(color) => setGroup('theme', { accentColor: color.toHexString() })}
              />
            </div>
          </SettingRow>
          <SettingRow title="Font family" description="Self-hosted fonts only; no external font request is required.">
            <Select
              value={config.typography.fontFamily}
              options={allowedFonts.map((font) => ({ label: font, value: font }))}
              onChange={(fontFamily) => setGroup('typography', { fontFamily })}
            />
          </SettingRow>
          <SettingRow title="Text size">
            <Radio.Group
              optionType="button"
              value={config.typography.baseFontSize}
              options={[
                { label: 'Small', value: 'sm' },
                { label: 'Medium', value: 'md' },
                { label: 'Large', value: 'lg' },
              ]}
              onChange={(event) => setGroup('typography', { baseFontSize: event.target.value })}
            />
          </SettingRow>
          <SettingRow title="Density" description="Controls spacing and control/table density throughout the shell.">
            <Select
              value={config.layout.density}
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'comfortable', label: 'Comfortable' },
              ]}
              onChange={(density: 'compact' | 'comfortable') => setGroup('layout', { density })}
            />
          </SettingRow>
          <SettingRow title="Corner radius" description={`${config.theme.borderRadius}px base radius`}>
            <Slider
              min={0}
              max={24}
              value={config.theme.borderRadius}
              onChange={(borderRadius) => setGroup('theme', { borderRadius })}
            />
          </SettingRow>
          <SettingRow title="Content width">
            <Radio.Group
              value={config.layout.contentWidth}
              optionType="button"
              options={[
                { label: 'Boxed', value: 'boxed' },
                { label: 'Full', value: 'full' },
              ]}
              onChange={(event) => setGroup('layout', { contentWidth: event.target.value })}
            />
          </SettingRow>
          <SettingRow title="Collapse navigation by default">
            <Switch
              checked={config.layout.sidebarDefaultCollapsed}
              onChange={(sidebarDefaultCollapsed) => setGroup('layout', { sidebarDefaultCollapsed })}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Motion & sound" description="Feedback should be crisp, optional, and respectful of user preferences.">
          <SettingRow title="Interface motion" description="Controls product motion unless the operating system requests reduced motion.">
            <Switch
              checked={config.motion.enabled}
              onChange={(enabled) => setGroup('motion', { enabled })}
            />
          </SettingRow>
          <SettingRow title="Motion speed">
            <Radio.Group
              value={config.motion.speed}
              optionType="button"
              options={[
                { label: 'Fast', value: 'fast' },
                { label: 'Normal', value: 'normal' },
              ]}
              onChange={(event) => setGroup('motion', { speed: event.target.value })}
            />
          </SettingRow>
          <SettingRow
            title="Effective motion policy"
            description="The OS reduced-motion preference is an accessibility veto and always wins."
          >
            <div className="settings-effective-policy">
              <StatusPill tone={reducedMotion ? 'warning' : motionEnabled ? 'success' : 'neutral'}>
                {reducedMotion ? 'Reduced by OS' : motionEnabled ? 'Motion on' : 'Motion off'}
              </StatusPill>
              <span className="settings-effective-note">
                {reducedMotion ? 'prefers-reduced-motion detected' : 'OS allows motion'}
              </span>
            </div>
          </SettingRow>
          <SettingRow title="Interface sounds" description="Quiet synthesized tones; no audio files are shipped.">
            <Switch
              checked={config.sound.enabled}
              onChange={(enabled) => setGroup('sound', { enabled })}
            />
          </SettingRow>
          <SettingRow title="Volume">
            <div className="settings-volume-control">
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={config.sound.volume}
                disabled={!config.sound.enabled}
                onChange={(volume) => setGroup('sound', { volume })}
              />
              <Button
                aria-label="Test interface sound"
                disabled={!config.sound.enabled}
                icon={<SoundOutlined />}
                onClick={() => sound('success')}
              />
            </div>
          </SettingRow>
          <SettingRow title="Sound categories">
            <Checkbox.Group
              value={Object.entries(config.sound.categories).filter(([, enabled]) => enabled).map(([key]) => key)}
              options={['click', 'success', 'warning', 'notification']}
              onChange={(keys) => setGroup('sound', {
                categories: {
                  click: keys.includes('click'),
                  success: keys.includes('success'),
                  warning: keys.includes('warning'),
                  notification: keys.includes('notification'),
                },
              })}
            />
          </SettingRow>
        </SettingsSection>
      </div>

      <aside className="settings-preview" aria-label="Live preview">
        <div className="settings-preview-caption">
          <span>Live preview</span>
          <StatusPill tone="success">Synced</StatusPill>
        </div>
        <MotionSurface>
          <section className="settings-preview-card">
            <div className="settings-preview-nav">
              <span className="settings-preview-logo" aria-hidden="true">
                {config.brand.logoUrl ? <img src={config.brand.logoUrl} alt="" /> : '✳'}
              </span>
              <strong>{config.brand.name || 'Untitled workspace'}</strong>
            </div>
            <div className="settings-preview-body">
              <span className="settings-preview-kicker">Your workspace</span>
              <h3>{config.brand.tagline || 'A clear view of everything that matters.'}</h3>
              <p>Changes use the same runtime tokens as the shell, tables, forms, drawers, and documents.</p>
              <div className="settings-preview-metric">
                <span>Total revenue</span>
                <strong>$24,680</strong>
                <StatusPill tone="success">Up 12.4%</StatusPill>
              </div>
              <div className="settings-preview-row">
                <span>Office essentials</span>
                <StatusPill tone="success">Active</StatusPill>
              </div>
              <div className="settings-preview-row">
                <span>Workspace supplies</span>
                <StatusPill>Draft</StatusPill>
              </div>
              <Button block type="primary" onClick={() => feedback.success('Live theme interaction confirmed')}>
                Preview interaction
              </Button>
            </div>
          </section>
        </MotionSurface>
        <div className="settings-preview-note">
          One runtime configuration drives CSS variables, Ant Design, Tailwind utilities, and shared primitives.
        </div>
      </aside>
    </div>
  );

  const tablePreferences = (
    <div className="settings-stack">
      <SettingsSection title="Table defaults" description="Global defaults; individual workspaces can still expose domain-valid column controls.">
        <SettingRow title="Rows per page" description="Larger client-side result sets can use virtualization.">
          <Select
            value={config.table.defaultPageSize}
            options={[10, 20, 50, 100, 250, 500].map((value) => ({ value, label: String(value) }))}
            onChange={(defaultPageSize) => setGroup('table', { defaultPageSize })}
          />
        </SettingRow>
        <SettingRow title="Hide columns by default" description="Applies when a matching optional column exists.">
          <Checkbox.Group
            value={config.table.hiddenColumns}
            options={['status', 'email', 'phone', 'location', 'category']}
            onChange={(hiddenColumns) => setGroup('table', { hiddenColumns: hiddenColumns as string[] })}
          />
        </SettingRow>
      </SettingsSection>
    </div>
  );

  const notifications = (
    <div className="settings-stack">
      <SettingsSection title="Notification categories" description="Choose which business categories appear in the workspace inbox.">
        {(['inventory', 'finance', 'security'] as const).map((category) => (
          <SettingRow key={category} title={category[0].toUpperCase() + category.slice(1)}>
            <Switch
              checked={config.notifications[category]}
              onChange={(checked) => setGroup('notifications', { [category]: checked })}
            />
          </SettingRow>
        ))}
      </SettingsSection>
    </div>
  );

  const general = (
    <div className="settings-stack">
      <SettingsSection title="Organization details" description="Demo organization values are stored on this device.">
        <Form
          layout="vertical"
          initialValues={workspace.org}
          onFinish={(values) => {
            workspace.updateOrg(values);
            feedback.success('Organization updated');
          }}
        >
          <Form.Item name="name" label="Organization name" rules={[{ required: true, whitespace: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Contact email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="currency" label="Reporting currency">
            <Select options={['USD', 'EUR', 'GBP', 'PKR', 'AED'].map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Button type="primary" htmlType="submit">Save organization</Button>
        </Form>
      </SettingsSection>
    </div>
  );

  return (
    <MotionSurface page>
      <PageHeader
        title="Settings"
        description="Customize the starter live without creating a second theme system."
        action={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              reset();
              feedback.success('Reset to project defaults');
            }}
          >
            Reset to project defaults
          </Button>
        }
      />
      <Tabs
        items={[
          { key: 'studio', label: 'Theme studio', children: studio },
          { key: 'table', label: 'Table preferences', children: tablePreferences },
          { key: 'notifications', label: 'Notifications', children: notifications },
          { key: 'general', label: 'General', children: general },
        ]}
      />
    </MotionSurface>
  );
}
