import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTemplate } from '../../theme/ThemeProvider';
const trend = [
  { name: 'Apr', revenue: 42, expenses: 25 },
  { name: 'May', revenue: 61, expenses: 33 },
  { name: 'Jun', revenue: 49, expenses: 28 },
  { name: 'Jul', revenue: 78, expenses: 42 },
  { name: 'Aug', revenue: 65, expenses: 34 },
  { name: 'Sep', revenue: 92, expenses: 47 },
];
const categories = [
  { name: 'Electronics', value: 42 },
  { name: 'Furniture', value: 28 },
  { name: 'Accessories', value: 18 },
  { name: 'Office', value: 12 },
];
export default function DashboardCharts() {
  const { config } = useTemplate();
  const primary = config.theme.primaryColor;
  const accent = config.theme.accentColor;
  const colors = [
    primary,
    accent,
    `color-mix(in srgb, ${primary} 45%, transparent)`,
    `color-mix(in srgb, ${accent} 35%, transparent)`,
  ];
  return (
    <>
      <div className="chart-grid">
        <section className="panel chart-panel">
          <div className="widget-heading">
            <div>
              <h2>Revenue overview</h2>
              <p className="muted">Revenue and expenses over time</p>
            </div>
            <span className="small-label">Apr – Sep 2026</span>
          </div>
          <div className="chart-legend">
            <span>
              <i style={{ background: primary }} />
              Revenue
            </span>
            <span>
              <i style={{ background: accent }} />
              Expenses
            </span>
          </div>
          <div
            className="chart"
            role="img"
            aria-label="Illustrative revenue rises from 42 thousand in April to 92 thousand in September; expenses rise from 25 to 47 thousand."
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trend} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primary} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="4 5" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(v) => `${v}k`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    borderColor: 'var(--line)',
                    borderRadius: 12,
                  }}
                />
                <Area
                  dataKey="revenue"
                  stroke={primary}
                  strokeWidth={2.5}
                  fill="url(#revenue-fill)"
                  type="monotone"
                  isAnimationActive={false}
                />
                <Area
                  dataKey="expenses"
                  stroke={accent}
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray="4 4"
                  type="monotone"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel chart-panel">
          <div className="widget-heading">
            <div>
              <h2>Inventory mix</h2>
              <p className="muted">Share by product category</p>
            </div>
          </div>
          <div
            className="donut-wrap"
            role="img"
            aria-label="Inventory mix: Electronics 42%, Furniture 28%, Accessories 18%, Office 12%"
          >
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={76}
                  paddingAngle={4}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {categories.map((c, i) => (
                    <Cell key={c.name} fill={colors[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <strong>100%</strong>
              <small>of inventory</small>
            </div>
          </div>
          <div className="category-legend">
            {categories.map((c, i) => (
              <div key={c.name}>
                <span>
                  <i style={{ background: colors[i] }} />
                  {c.name}
                </span>
                <strong>{c.value}%</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel comparison-panel">
        <div>
          <h2>Order volume</h2>
          <p className="muted">A steady month across locations</p>
          <strong className="comparison-number">
            1,284 <span className="trend-positive">+12.8%</span>
          </strong>
          <p className="small-label">Illustrative monthly trend</p>
        </div>
        <div
          className="bar-chart"
          role="img"
          aria-label="Order comparison for central, north, and south warehouses"
        >
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={[
                { name: 'Central', orders: 580 },
                { name: 'North', orders: 420 },
                { name: 'South', orders: 284 },
              ]}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                width={65}
              />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
              />
              <Bar
                dataKey="orders"
                fill={primary}
                radius={[0, 5, 5, 0]}
                barSize={15}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
