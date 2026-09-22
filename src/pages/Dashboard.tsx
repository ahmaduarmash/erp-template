import { lazy, Suspense } from 'react';
import {
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
  const invoices = workspace.records['sales-invoices'];
  const purchaseOrders = workspace.records['purchase-orders'];
  const stock = workspace.records['stock-levels'];
  const expenses = workspace.records.expenses;
  const receivables = invoices
    .filter((row) => row.status !== 'Paid')
    .reduce((sum, row) => sum + Number(row.amount), 0);
  const metrics = [
    {
      label: 'Open receivables',
      value: currency.format(receivables),
      delta: `${invoices.filter((row) => row.status === 'Overdue').length} overdue`,
      detail: 'customer balances to collect',
      icon: <DollarOutlined />,
      accent: 'primary',
    },
    {
      label: 'Purchase orders open',
      value: String(purchaseOrders.filter((row) => !['Received', 'Cancelled'].includes(String(row.status))).length),
      delta: `${purchaseOrders.filter((row) => row.status === 'Ordered').length} awaiting receipt`,
      detail: 'purchasing commitments',
      icon: <ShoppingOutlined />,
      accent: 'accent',
    },
    {
      label: 'Pending approvals',
      value: String(expenses.filter((row) => row.status === 'Pending').length),
      delta: 'Expense queue',
      detail: 'requires finance action',
      icon: <TeamOutlined />,
      accent: 'primary',
    },
    {
      label: 'Low-stock items',
      value: String(stock.filter((row) => Number(row.quantity) <= Number(row.reorder) || row.status === 'Low stock').length),
      delta: 'Needs review',
      detail: 'check replenishment',
      icon: <WarningOutlined />,
      accent: 'warning',
    },
  ];
  return (
    <MotionSurface page>
      <PageHeader
        title="Workspace overview"
        description={`Welcome back, ${workspace.profile.name.split(' ')[0]}. Here are the operational queues that need attention.`}
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
        <span>OPERATIONS AT A GLANCE</span>
        <span>Financial · purchasing · approvals · inventory</span>
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
                    points={i === 3 ? '0,8 15,15 28,10 42,23 55,15 72,25 90,22' : '0,27 13,21 24,25 39,12 51,17 64,6 75,10 90,2'}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="stat-bottom">
                <span className={i === 3 ? 'trend-warning' : 'trend-positive'}>
                  <ArrowUpOutlined /> {m.delta}
                </span>
                <span>{m.detail}</span>
              </div>
            </section>
          </MotionSurface>
        ))}
      </div>
      <Suspense fallback={<div className="panel p-6"><Skeleton active /><Skeleton active /></div>}>
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
              {a.name.split(' ').map((n) => n[0]).join('')}
            </Avatar>
            <div>
              <strong>{a.action}</strong>
              <p>{a.name} <span>·</span> {a.module}</p>
            </div>
            <time>{new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
          </div>
        ))}
      </section>
    </MotionSurface>
  );
}
