import {
  AppstoreOutlined,
  ApartmentOutlined,
  BankOutlined,
  BellOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { NavLink } from 'react-router-dom';
import { useTemplate } from '../../theme/ThemeProvider';
import { modules } from '../../data/modules';
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
        <div className="nav-section">Workspace</div>
        {link('/dashboard', 'Overview', <DashboardOutlined />)}
        {(['Inventory', 'Accounting'] as const).map((group) => (
          <div key={group}>
            <div className="nav-section">{group}</div>
            {modules
              .filter((m) => m.group === group)
              .map((m) =>
                link(
                  `/${group.toLowerCase()}/${m.key}`,
                  m.title,
                  group === 'Inventory' ? <AppstoreOutlined /> : <BankOutlined />,
                ),
              )}
          </div>
        ))}
        <div className="nav-section">Organization</div>
        {link('/system/users', 'Team & access', <TeamOutlined />)}
        {link('/system/notifications', 'Notifications', <BellOutlined />)}
        {link('/system/audit-log', 'Audit log', <FileSearchOutlined />)}
        {link('/settings', 'Settings', <SettingOutlined />)}
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
