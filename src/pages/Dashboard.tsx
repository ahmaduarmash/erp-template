import { lazy, Suspense } from 'react';
import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shell/PageHeader';
import { MotionSurface } from '../lib/motion';
import { useWorkspace } from '../data/WorkspaceProvider';
import { downloadCsv } from '../lib/csv';
const Charts = lazy(() => import('../components/charts/DashboardCharts'));
export default function Dashboard() {
  const workspace = useWorkspace();
  const navigate = useNavigate();
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: workspace.org.currency,
    maximumFractionDigits: 0,
  });
  const total = workspace.records['sales-invoices'].reduce((sum, r) => sum + Number(r.amount), 0);
  const metrics = [
    {
      label: 'Total invoiced',
      value: currency.format(total),
      delta: '+14.2%',
      detail: 'vs. previous period',
      icon: <DollarOutlined />,
      accent: 'primary',
    },
    {
      label: 'Products in catalog',
      value: String(workspace.records.products.length),
      delta: '+8.1%',
      detail: 'across all categories',
      icon: <ShoppingOutlined />,
      accent: 'accent',
    },
    {
      label: 'Active customers',
      value: String(workspace.records.customers.filter((r) => r.status === 'Active').length),
      delta: '+6.4%',
      detail: 'customer accounts',
      icon: <TeamOutlined />,
      accent: 'primary',
    },
    {
      label: 'Low-stock items',
      value: String(
        workspace.records['stock-levels'].filter(
          (r) => Number(r.quantity) <= Number(r.reorder) || r.status === 'Low stock',
        ).length,
      ),
      delta: 'Needs review',
      detail: 'check reorder points',
      icon: <WarningOutlined />,
      accent: 'warning',
    },
  ];
  return (
    <MotionSurface page>
      <PageHeader
        title="Workspace overview"
        description={`Welcome back, ${workspace.profile.name.split(' ')[0]}. Here’s where things stand.`}
        action={
          <>
            <span className="date-pill">
              <CalendarOutlined /> September 2026
            </span>
            <Button
              onClick={() =>
                downloadCsv(
                  'workspace-summary',
                  ['Metric', 'Value'],
                  metrics.map((m) => [m.label, m.value]),
                )
              }
            >
              Export report
            </Button>
          </>
        }
      />
      <div className="overview-label">
        <span>AT A GLANCE</span>
        <span>Sample trends · Live local totals</span>
      </div>
      <div className="kpi-grid">
        {metrics.map((m, i) => (
          <MotionSurface key={m.label}>
            <section className={`panel stat-card stat-${m.accent}`}>
              <div className="stat-top">
                <span>{m.label}</span>
                <span className="stat-icon">{m.icon}</span>
              </div>
              <div className="stat-value">
                {m.value}
                <svg className="sparkline" viewBox="0 0 90 32" aria-hidden="true">
                  <polyline
                    points={
                      i === 3
                        ? '0,8 15,15 28,10 42,23 55,15 72,25 90,22'
                        : '0,27 13,21 24,25 39,12 51,17 64,6 75,10 90,2'
                    }
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="stat-bottom">
                <span className={i === 3 ? 'trend-warning' : 'trend-positive'}>
                  {i === 3 ? <ArrowDownOutlined /> : <ArrowUpOutlined />} {m.delta}
                </span>
                <span>{m.detail}</span>
              </div>
            </section>
          </MotionSurface>
        ))}
      </div>
      <Suspense
        fallback={
          <div className="panel p-6">
            <Skeleton active />
            <Skeleton active />
          </div>
        }
      >
        <Charts />
      </Suspense>
      <section className="panel activity-panel">
        <div className="widget-heading">
          <div>
            <h2>Recent activity</h2>
            <p className="muted">The latest changes across your workspace</p>
          </div>
          <Button type="text" onClick={() => navigate('/system/audit-log')}>
            View audit log <ArrowRightOutlined />
          </Button>
        </div>
        {workspace.activity.slice(0, 4).map((a, i) => (
          <div className="activity-row" key={a.id}>
            <Avatar className={i % 2 ? 'avatar accent-avatar' : 'avatar'}>
              {a.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </Avatar>
            <div>
              <strong>{a.action}</strong>
              <p>
                {a.name} <span>·</span> {a.module}
              </p>
            </div>
            <time>
              {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
        ))}
      </section>
    </MotionSurface>
  );
}
