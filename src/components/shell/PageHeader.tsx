import { Breadcrumb } from 'antd';
import type { ReactNode } from 'react';
export function PageHeader({
  title,
  description,
  group,
  action,
}: {
  title: string;
  description?: string;
  group?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <Breadcrumb
          items={[{ title: 'Workspace' }, ...(group ? [{ title: group }] : []), { title }]}
        />
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      <div className="header-actions">{action}</div>
    </header>
  );
}
