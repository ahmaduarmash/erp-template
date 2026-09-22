import {
  AppstoreOutlined,
  ApartmentOutlined,
  BankOutlined,
  DashboardOutlined,
  LeftOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { NavLink } from 'react-router-dom';
import { useTemplate } from '../../theme/ThemeProvider';
import { routeRegistry } from '../../config/routes';
import { MotionSurface } from '../../lib/motion';

export function Brand() {
  const { config } = useTemplate();
  return (
    <div className="brand">
      {config.brand.logoUrl ? (
        <img src={config.brand.logoUrl} alt="" className="brand-mark" />
      ) : (
        <span className="brand-mark">✳</span>
      )}
      <span className="brand-text">
        {config.brand.name}
        <span className="brand-edition">workspace</span>
      </span>
    </div>
  );
}

const iconFor = (group: string) => {
  if (group === 'Workspace') return <DashboardOutlined />;
  if (group === 'Inventory') return <AppstoreOutlined />;
  if (group === 'Accounting') return <BankOutlined />;
  return <SafetyCertificateOutlined />;
};

export function Sidebar({
  collapsed,
  toggle,
  onNavigate,
}: {
  collapsed: boolean;
  toggle: () => void;
  onNavigate: () => void;
}) {
  const { config } = useTemplate();
  const link = (path: string, label: string, icon: React.ReactNode) => (
    <Tooltip key={path} title={collapsed ? label : undefined} placement="right">
      <NavLink
        to={path}
        onClick={onNavigate}
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">{icon}</span>
        <span className="nav-label">{label}</span>
      </NavLink>
    </Tooltip>
  );
  const groups = ['Workspace', 'Inventory', 'Accounting', 'Organization'] as const;
  return (
    <MotionSurface className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-head">
        <Brand />
      </div>
      <div className="workspace-switch">
        <span className="workspace-symbol">{config.brand.name.slice(0, 1)}</span>
        <div className="nav-label">
          <strong>{config.brand.name} Operations</strong>
          <small>Demo workspace</small>
        </div>
      </div>
      <nav aria-label="Main navigation">
        {groups.map((group) => (
          <div key={group}>
            <div className="nav-section">{group}</div>
            {routeRegistry
              .filter((route) => route.group === group)
              .map((route) => link(route.path, route.title, iconFor(group)))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="nav-label">
          <ApartmentOutlined /> Workspace starter
        </span>
        <Button
          type="text"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
          onClick={toggle}
        />
      </div>
    </MotionSurface>
  );
}
