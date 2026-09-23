import { Tooltip } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import { routeForPath, routeGroups, routesForGroup } from '../../config/routes';
import { useAuth } from '../../auth/AuthProvider';
import { useTemplate } from '../../theme/ThemeProvider';
import { ShellIcon } from './ShellIcon';

export function PrimaryRail({ onNavigate }: { onNavigate: () => void }) {
  const { config } = useTemplate();
  const auth = useAuth();
  const location = useLocation();
  const current = routeForPath(location.pathname);

  return (
    <aside className="primary-rail" aria-label="Business areas">
      <div className="rail-brand" aria-label={config.brand.name}>
        {config.brand.logoUrl ? (
          <img src={config.brand.logoUrl} alt="" className="rail-brand-mark" />
        ) : (
          <span className="rail-brand-mark" aria-hidden="true">
            {config.brand.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <nav className="rail-navigation">
        {routeGroups.map((group) => {
          const visibleRoutes = routesForGroup(group.key).filter((route) => auth.can(route.permission));
          if (!visibleRoutes.length) return null;
          const destination = visibleRoutes.some((route) => route.path === group.defaultPath)
            ? group.defaultPath
            : visibleRoutes[0].path;
          const active = current?.group === group.key;
          return (
            <Tooltip key={group.key} title={group.title} placement="right">
              <NavLink
                to={destination}
                className={`rail-action ${active ? 'active' : ''}`}
                aria-label={group.title}
                aria-current={active ? 'page' : undefined}
                onClick={onNavigate}
              >
                <ShellIcon name={group.icon} />
              </NavLink>
            </Tooltip>
          );
        })}
      </nav>
      <div className="rail-spacer" />
      <div className="rail-user" aria-hidden="true">
        {config.brand.name.slice(0, 1).toUpperCase()}
      </div>
    </aside>
  );
}
