import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { NavLink, useLocation } from 'react-router-dom';
import { routeForPath, routeGroupFor, routesForGroup } from '../../config/routes';
import { useAuth } from '../../auth/AuthProvider';
import { ShellIcon } from './ShellIcon';

export function SecondaryNav({
  collapsed,
  onCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  onNavigate: () => void;
}) {
  const auth = useAuth();
  const location = useLocation();
  const current = routeForPath(location.pathname);
  const group = routeGroupFor(current?.group ?? 'Overview');
  const routes = routesForGroup(group.key).filter((route) => auth.can(route.permission));

  return (
    <aside className={`secondary-nav ${collapsed ? 'collapsed' : ''}`} aria-label={`${group.title} navigation`}>
      <div className="secondary-nav-header">
        <div>
          <strong>{group.title}</strong>
          <p>{group.description}</p>
        </div>
        <Button
          type="text"
          size="small"
          icon={<LeftOutlined />}
          aria-label="Collapse section navigation"
          onClick={onCollapse}
        />
      </div>
      <nav className="secondary-nav-list">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            onClick={onNavigate}
            className={({ isActive }) => `secondary-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="secondary-nav-icon" aria-hidden="true">
              <ShellIcon name={route.icon} />
            </span>
            <span className="secondary-nav-copy">
              <strong>{route.title}</strong>
              <small>{route.description}</small>
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
