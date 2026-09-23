import type { CSSProperties, ReactNode } from 'react';
import {
  Button,
  Dropdown,
  Empty,
  Progress,
  Segmented,
  Space,
  Tooltip,
  type ButtonProps,
  type MenuProps,
} from 'antd';
import { MoreOutlined } from '@ant-design/icons';

export type SemanticTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type SurfaceTone = 'default' | 'subtle' | 'elevated';

export function Surface({
  children,
  className = '',
  tone = 'default',
  padding = 'md',
  as: Component = 'section',
}: {
  children: ReactNode;
  className?: string;
  tone?: SurfaceTone;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'section' | 'div' | 'article' | 'aside';
}) {
  return (
    <Component className={`ui-surface ui-surface-${tone} ui-surface-pad-${padding} ${className}`.trim()}>
      {children}
    </Component>
  );
}

export function IconChip({
  icon,
  tone = 'primary',
  size = 'md',
  label,
}: {
  icon: ReactNode;
  tone?: SemanticTone;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}) {
  return (
    <span className={`ui-icon-chip ui-tone-${tone} ui-icon-chip-${size}`} aria-label={label} aria-hidden={label ? undefined : true}>
      {icon}
    </span>
  );
}

export function Metric({
  label,
  value,
  hint,
  className = '',
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ui-metric ${className}`.trim()}>
      <span className="ui-metric-label">{label}</span>
      <strong className="ui-metric-value">{value}</strong>
      {hint ? <span className="ui-metric-hint">{hint}</span> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'primary',
  progress,
  trend,
  hint,
  footer,
}: {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  tone?: SemanticTone;
  progress?: number;
  trend?: ReactNode;
  hint?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Surface className={`ui-stat-card ui-tone-${tone}`} padding="md">
      <span className="ui-stat-accent" aria-hidden="true" />
      <div className="ui-stat-head">
        <span className="ui-stat-label">{label}</span>
        {icon ? <IconChip icon={icon} tone={tone} /> : null}
      </div>
      <div className="ui-stat-value">{value}</div>
      {progress !== undefined ? (
        <Progress percent={Math.max(0, Math.min(100, progress))} showInfo={false} size="small" />
      ) : null}
      {(trend || hint) ? (
        <div className="ui-stat-meta">
          {trend ? <span className="ui-stat-trend">{trend}</span> : null}
          {hint ? <span>{hint}</span> : null}
        </div>
      ) : null}
      {footer ? <div className="ui-stat-footer">{footer}</div> : null}
    </Surface>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: SemanticTone;
}) {
  return (
    <span className={`ui-status-pill ui-tone-${tone}`}>
      <span className="ui-status-dot" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}

export function ActionIcon({
  label,
  icon,
  danger,
  ...buttonProps
}: {
  label: string;
  icon: ReactNode;
  danger?: boolean;
} & Omit<ButtonProps, 'children' | 'icon' | 'aria-label'>) {
  return (
    <Tooltip title={label} mouseEnterDelay={0.35}>
      <Button
        {...buttonProps}
        type={buttonProps.type ?? 'text'}
        size={buttonProps.size ?? 'small'}
        danger={danger}
        className={`ui-action-icon ${buttonProps.className ?? ''}`.trim()}
        aria-label={label}
        icon={icon}
      />
    </Tooltip>
  );
}

export type OverflowAction = {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function OverflowMenu({ actions, label = 'More actions' }: { actions: OverflowAction[]; label?: string }) {
  const items: MenuProps['items'] = actions.map((action) => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    danger: action.danger,
    disabled: action.disabled,
    onClick: action.onClick,
  }));
  if (!actions.length) return null;
  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <span>
        <ActionIcon label={label} icon={<MoreOutlined />} />
      </span>
    </Dropdown>
  );
}

export function FilterBar({
  search,
  filters,
  actions,
  className = '',
}: {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ui-filter-bar ${className}`.trim()}>
      {search ? <div className="ui-filter-search">{search}</div> : null}
      {filters ? <div className="ui-filter-controls">{filters}</div> : null}
      {actions ? <div className="ui-filter-actions">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'primary',
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: SemanticTone;
}) {
  return (
    <div className="ui-empty-state">
      {icon ? <IconChip icon={icon} tone={tone} size="lg" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />}
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action ? <div className="ui-empty-action">{action}</div> : null}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="ui-section-header">
      <div>
        {eyebrow ? <span className="ui-section-eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="ui-section-actions">{actions}</div> : null}
    </header>
  );
}

export function EntityCell({
  title,
  subtitle,
  leading,
  onClick,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      {leading ? <span className="ui-entity-leading">{leading}</span> : null}
      <span className="ui-entity-copy">
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
    </>
  );
  return onClick ? (
    <button type="button" className="ui-entity-cell ui-entity-button" onClick={onClick}>
      {content}
    </button>
  ) : (
    <span className="ui-entity-cell">{content}</span>
  );
}

export function MoneyCell({
  value,
  currency = 'USD',
  muted,
}: {
  value: number | string;
  currency?: string;
  muted?: boolean;
}) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
  return <span className={`ui-money-cell ${muted ? 'muted' : ''}`.trim()}>{formatted}</span>;
}

export function ProgressCell({
  value,
  max = 100,
  label,
  status,
}: {
  value: number;
  max?: number;
  label?: ReactNode;
  status?: 'normal' | 'exception' | 'success' | 'active';
}) {
  const percent = Math.max(0, Math.min(100, Math.round((value / Math.max(max, 1)) * 100)));
  return (
    <div className="ui-progress-cell">
      <Progress percent={percent} size="small" showInfo={false} status={status} />
      <small>{label ?? `${value} / ${max}`}</small>
    </div>
  );
}

export function QuickFilterTabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (value: string) => void;
  items: Array<{ label: ReactNode; value: string }>;
}) {
  return (
    <div className="ui-quick-filter-tabs">
      <Segmented value={value} onChange={(next) => onChange(String(next))} options={items} />
    </div>
  );
}

export function ObjectHeader({
  title,
  subtitle,
  status,
  leading,
  actions,
  meta,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="ui-object-header">
      <div className="ui-object-identity">
        {leading ? <span className="ui-object-leading">{leading}</span> : null}
        <div>
          <div className="ui-object-title-row">
            <h2>{title}</h2>
            {status}
          </div>
          {subtitle ? <p>{subtitle}</p> : null}
          {meta ? <div className="ui-object-meta">{meta}</div> : null}
        </div>
      </div>
      {actions ? <div className="ui-object-actions">{actions}</div> : null}
    </header>
  );
}

export function CommandBar({
  primary,
  secondary,
  overflow,
  sticky = false,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  overflow?: OverflowAction[];
  sticky?: boolean;
}) {
  return (
    <div className={`ui-command-bar ${sticky ? 'is-sticky' : ''}`}>
      <Space wrap>{secondary}</Space>
      <Space wrap>
        {overflow?.length ? <OverflowMenu actions={overflow} /> : null}
        {primary}
      </Space>
    </div>
  );
}

export const primitiveToneStyle = (tone: SemanticTone): CSSProperties => ({
  '--primitive-tone': `var(--${tone === 'danger' ? 'semantic-danger' : tone === 'primary' ? 'action-primary' : tone === 'accent' ? 'color-accent' : tone === 'neutral' ? 'text-muted' : `semantic-${tone}`})`,
} as CSSProperties);
