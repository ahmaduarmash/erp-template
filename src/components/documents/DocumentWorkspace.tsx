import type { ReactNode } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { MotionSurface } from '../../lib/motion';
import './document-workspace.css';

export function DocumentWorkspace({
  title,
  subtitle,
  reference,
  status,
  onBack,
  primaryAction,
  secondaryActions,
  children,
  sidebar,
  footer,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  reference?: ReactNode;
  status?: ReactNode;
  onBack: () => void;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <MotionSurface page>
      <section className="document-workspace" aria-label="Document workspace">
        <header className="document-workspace-header">
          <div className="document-workspace-heading">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} aria-label="Back to document list" />
            <div>
              <div className="document-workspace-title-row">
                <h1>{title}</h1>
                {status}
              </div>
              {subtitle ? <p>{subtitle}</p> : null}
              {reference ? <span className="document-workspace-reference">{reference}</span> : null}
            </div>
          </div>
          <Space wrap>
            {secondaryActions}
            {primaryAction}
          </Space>
        </header>
        <div className={sidebar ? 'document-workspace-layout has-sidebar' : 'document-workspace-layout'}>
          <main className="document-workspace-main">{children}</main>
          {sidebar ? <aside className="document-workspace-sidebar">{sidebar}</aside> : null}
        </div>
        {footer ? <footer className="document-workspace-footer">{footer}</footer> : null}
      </section>
    </MotionSurface>
  );
}

export function DocumentSection({
  title,
  description,
  extra,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="document-section">
      <header className="document-section-header">
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

export function DocumentSummary({ children }: { children: ReactNode }) {
  return <div className="document-summary">{children}</div>;
}
