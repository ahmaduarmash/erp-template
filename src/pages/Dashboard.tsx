import { lazy, Suspense } from 'react';
import {
  ArrowRightOutlined,
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
import { SectionHeader, StatCard, Surface, type SemanticTone } from '../components/primitives';
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
  const metrics: Array<{
    label: string;
    value: string;
    delta: string;
    detail: string;
    icon: React.ReactNode;
    tone: SemanticTone;
  }> = [
    {
      label: 'Open receivables',
      value: currency.format(receivables),
      delta: `${invoices.filter((row) => row.status === 'Overdue').length} overdue`,
      detail: 'Customer balances to collect',
      icon: <DollarOutlined />,
      tone: 'primary',
    },
    {
      label: 'Purchase orders open',
      value: String(purchaseOrders.filter((row) => !['Received', 'Cancelled'].includes(String(row.status))).length),
      delta: `${purchaseOrders.filter((row) => row.status === 'Ordered').length} awaiting receipt`,
      detail: 'Purchasing commitments',
      icon: <ShoppingOutlined />,
      tone: 'accent',
    },
    {
      label: 'Pending approvals',
      value: String(expenses.filter((row) => row.status === 'Pending').length),
      delta: 'Expense queue',
      detail: 'Requires finance action',
      icon: <TeamOutlined />,
      tone: 'info',
    },
    {
      label: 'Low-stock items',
      value: String(stock.filter((row) => Number(row.quantity) <= Number(row.reorder) || row.status === 'Low stock').length),
      delta: 'Needs review',
      detail: 'Check replenishment',
      icon: <WarningOutlined />,
      tone: 'warning',
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
                  metrics.map((metric) => [metric.label, metric.value]),
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
        {metrics.map((metric) => (
          <MotionSurface key={metric.label}>
            <StatCard
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
              tone={metric.tone}
              trend={metric.delta}
              hint={metric.detail}
            />
          </MotionSurface>
        ))}
      </div>
      <Suspense fallback={<Surface padding="lg"><Skeleton active /><Skeleton active /></Surface>}>
        <Charts />
      </Suspense>
      <Surface className="activity-panel" padding="lg">
        <SectionHeader
          title="Recent activity"
          description="The latest changes across your workspace"
          actions={
            <Button type="text" onClick={() => navigate('/system/audit-log')}>
              View audit log <ArrowRightOutlined />
            </Button>
          }
        />
        {workspace.activity.slice(0, 4).map((activity, index) => (
          <div className="activity-row" key={activity.id}>
            <Avatar className={index % 2 ? 'avatar accent-avatar' : 'avatar'}>
              {activity.name.split(' ').map((name) => name[0]).join('')}
            </Avatar>
            <div>
              <strong>{activity.action}</strong>
              <p>{activity.name} <span>·</span> {activity.module}</p>
            </div>
            <time>{new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
          </div>
        ))}
      </Surface>
    </MotionSurface>
  );
}
