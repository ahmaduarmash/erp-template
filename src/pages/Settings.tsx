import {
  Alert,
  Button,
  ColorPicker,
  Form,
  Input,
  Radio,
  Select,
  Slider,
  Switch,
  Tabs,
  Checkbox,
  Tag,
} from 'antd';
import {
  CheckOutlined,
  DesktopOutlined,
  MoonOutlined,
  ReloadOutlined,
  SoundOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useTemplate } from '../theme/ThemeProvider';
import { allowedFonts } from '../config/template.config';
import { PageHeader } from '../components/shell/PageHeader';
import { MotionSurface } from '../lib/motion';
import { useSound } from '../lib/sound/useSound';
import { useFeedback } from '../components/feedback';
import { useWorkspace } from '../data/WorkspaceProvider';
import type { ReactNode } from 'react';

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { config, setGroup, reset } = useTemplate();
  const sound = useSound();
  const feedback = useFeedback();
  const workspace = useWorkspace();

  const appearance = (
    <div className="settings-layout">
      <section className="panel settings-panel">
        <div className="section-heading">
          <h2>Appearance</h2>
          <p className="muted">Make this workspace feel like yours.</p>
        </div>
        <SettingRow title="Color mode" description="Choose how your workspace looks.">
          <Radio.Group
            value={config.theme.mode}
            onChange={(e) => setGroup('theme', { mode: e.target.value })}
            optionType="button"
            options={[
              {
                value: 'light',
                label: (
                  <>
                    <SunOutlined /> Light
                  </>
                ),
              },
              {
                value: 'dark',
                label: (
                  <>
                    <MoonOutlined /> Dark
                  </>
                ),
              },
              {
                value: 'system',
                label: (
                  <>
                    <DesktopOutlined /> System
                  </>
                ),
              },
            ]}
          />
        </SettingRow>
        <SettingRow title="Primary color" description="Used for actions, highlights, and charts.">
          <div className="color-swatches">
            {['#6155d9', '#2563eb', '#128578', '#b55278', '#b76a16', '#405168'].map((color) => (
              <button
                key={color}
                aria-label={`Use ${color}`}
                aria-pressed={config.theme.primaryColor === color}
                onClick={() => setGroup('theme', { primaryColor: color })}
                style={{ background: color }}
              >
                {config.theme.primaryColor === color && <CheckOutlined />}
              </button>
            ))}
            <ColorPicker
              value={config.theme.primaryColor}
              onChange={(color) => setGroup('theme', { primaryColor: color.toHexString() })}
            />
          </div>
        </SettingRow>
        <SettingRow title="Accent color">
          <ColorPicker
            value={config.theme.accentColor}
            showText
            onChange={(color) => setGroup('theme', { accentColor: color.toHexString() })}
          />
        </SettingRow>
        <SettingRow title="Font family" description="Self-hosted. No external font requests.">
          <Select
            value={config.typography.fontFamily}
            options={allowedFonts.map((f) => ({ label: f, value: f }))}
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
            onChange={(e) => setGroup('typography', { baseFontSize: e.target.value })}
          />
        </SettingRow>
        <SettingRow title="Density" description="Spacing in forms, tables, and the shell.">
          <Select
            value={config.layout.density}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'comfortable', label: 'Comfortable' },
            ]}
            onChange={(density: 'compact' | 'comfortable') => setGroup('layout', { density })}
          />
        </SettingRow>
        <SettingRow title="Corner radius">
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
            options={['boxed', 'full']}
            onChange={(e) => setGroup('layout', { contentWidth: e.target.value })}
          />
        </SettingRow>
        <SettingRow title="Collapse navigation by default">
          <Switch
            checked={config.layout.sidebarDefaultCollapsed}
            onChange={(sidebarDefaultCollapsed) => setGroup('layout', { sidebarDefaultCollapsed })}
          />
        </SettingRow>
        <SettingRow
          title="Interface motion"
          description="Always disabled when your OS requests reduced motion."
        >
          <Switch
            checked={config.motion.enabled}
            onChange={(enabled) => setGroup('motion', { enabled })}
          />
        </SettingRow>
        <SettingRow title="Motion speed">
          <Radio.Group
            value={config.motion.speed}
            options={['fast', 'normal']}
            onChange={(e) => setGroup('motion', { speed: e.target.value })}
          />
        </SettingRow>
        <SettingRow title="Interface sounds" description="Quiet synthesized tones for feedback.">
          <Switch
            checked={config.sound.enabled}
            onChange={(enabled) => setGroup('sound', { enabled })}
          />
        </SettingRow>
        <SettingRow title="Volume">
          <div className="volume-control">
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={config.sound.volume}
              disabled={!config.sound.enabled}
              onChange={(volume) => setGroup('sound', { volume })}
            />
            <Button
              aria-label="Test sound"
              disabled={!config.sound.enabled}
              icon={<SoundOutlined />}
              onClick={() => sound('success')}
            />
          </div>
        </SettingRow>
        <SettingRow title="Sound categories">
          <Checkbox.Group
            value={Object.entries(config.sound.categories)
              .filter(([, v]) => v)
              .map(([k]) => k)}
            options={['click', 'success', 'warning', 'notification']}
            onChange={(keys) =>
              setGroup('sound', {
                categories: {
                  click: keys.includes('click'),
                  success: keys.includes('success'),
                  warning: keys.includes('warning'),
                  notification: keys.includes('notification'),
                },
              })
            }
          />
        </SettingRow>
      </section>
      <aside className="preview-column">
        <div className="preview-caption">
          <span>LIVE PREVIEW</span>
          <Tag bordered={false} color="success">
            Synced
          </Tag>
        </div>
        <MotionSurface>
          <section className="panel live-preview">
            <div className="preview-mini-nav">
              <span className="preview-logo">✳</span>
              <strong>{config.brand.name}</strong>
              <span className="preview-nav-dots">•••</span>
            </div>
            <div className="preview-body">
              <p className="small-label">YOUR WORKSPACE</p>
              <h2>A little more you.</h2>
              <p className="muted">A clear view of everything that matters.</p>
              <div className="preview-metric">
                <span>Total revenue</span>
                <strong>$24,680</strong>
                <span className="trend-positive">↗ 12.4% this month</span>
              </div>
              <div className="preview-bars" aria-hidden="true">
                {[40, 65, 48, 80, 60, 92, 75, 100].map((height, i) => (
                  <i key={i} style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="preview-row">
                <span>Office essentials</span>
                <Tag color="success" bordered={false}>
                  Active
                </Tag>
              </div>
              <div className="preview-row">
                <span>Workspace supplies</span>
                <Tag bordered={false}>Draft</Tag>
              </div>
              <Button
                block
                type="primary"
                onClick={() => feedback.success('Your theme is looking good')}
              >
                Preview interaction
              </Button>
            </div>
          </section>
        </MotionSurface>
        <div className="preview-note">
          <strong>One theme. Every surface.</strong>
          <p>
            Changes apply immediately across charts, forms, navigation, and tables. Preferences are
            saved on this browser for the demo user.
          </p>
        </div>
      </aside>
    </div>
  );

  return (
    <MotionSurface page>
      <PageHeader
        title="Settings"
        description="A workspace that works the way you do."
        action={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              reset();
              feedback.success('Default appearance restored');
            }}
          >
            Reset preferences
          </Button>
        }
      />
      <Tabs
        items={[
          { key: 'appearance', label: 'Appearance', children: appearance },
          {
            key: 'table',
            label: 'Table preferences',
            children: (
              <section className="panel settings-panel">
                <div className="section-heading">
                  <h2>Table preferences</h2>
                </div>
                <SettingRow
                  title="Rows per page"
                  description="Tables with over 200 matching rows use virtualization."
                >
                  <Select
                    value={config.table.defaultPageSize}
                    options={[10, 20, 50, 100, 250, 500].map((value) => ({
                      value,
                      label: String(value),
                    }))}
                    onChange={(defaultPageSize) => setGroup('table', { defaultPageSize })}
                  />
                </SettingRow>
                <SettingRow
                  title="Hide columns by default"
                  description="Applies to matching columns across all modules."
                >
                  <Checkbox.Group
                    value={config.table.hiddenColumns}
                    options={['status', 'email', 'phone', 'location', 'category']}
                    onChange={(hiddenColumns) =>
                      setGroup('table', { hiddenColumns: hiddenColumns as string[] })
                    }
                  />
                </SettingRow>
              </section>
            ),
          },
          {
            key: 'notifications',
            label: 'Notifications',
            children: (
              <section className="panel settings-panel">
                <div className="section-heading">
                  <h2>Notification categories</h2>
                </div>
                {(['inventory', 'finance', 'security'] as const).map((category) => (
                  <SettingRow
                    key={category}
                    title={category[0].toUpperCase() + category.slice(1)}
                    description={`Show ${category} notifications in your inbox and topbar.`}
                  >
                    <Switch
                      checked={config.notifications[category]}
                      onChange={(checked) => setGroup('notifications', { [category]: checked })}
                    />
                  </SettingRow>
                ))}
              </section>
            ),
          },
          {
            key: 'general',
            label: 'General',
            children: (
              <section className="panel settings-panel p-6">
                <h2>Organization details</h2>
                <Alert
                  className="my-4"
                  type="info"
                  message="Demo organization settings are stored on this device."
                />
                <Form
                  layout="vertical"
                  initialValues={workspace.org}
                  onFinish={(values) => {
                    workspace.updateOrg(values);
                    feedback.success('Organization updated');
                  }}
                >
                  <Form.Item
                    name="name"
                    label="Organization name"
                    rules={[{ required: true, whitespace: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Contact email"
                    rules={[{ required: true, type: 'email' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="currency" label="Reporting currency">
                    <Select
                      options={['USD', 'EUR', 'GBP', 'PKR', 'AED'].map((value) => ({
                        value,
                        label: value,
                      }))}
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Save organization
                  </Button>
                </Form>
              </section>
            ),
          },
        ]}
      />
    </MotionSurface>
  );
}
