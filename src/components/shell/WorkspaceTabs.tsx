import { Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { routeForPath, routeRegistry } from '../../config/routes';
import { useAuth } from '../../auth/AuthProvider';
import { readStored, writeStored } from '../../lib/storage';
import { ShellIcon } from './ShellIcon';

const STORAGE_KEY = 'aster:workspace-tabs:v2';
const MAX_TABS = 10;

function loadTabs() {
  const saved = readStored<string[]>(STORAGE_KEY, ['/dashboard']);
  const valid = saved.filter((path) => routeForPath(path));
  return valid.length ? Array.from(new Set(valid)).slice(-MAX_TABS) : ['/dashboard'];
}

export function WorkspaceTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [tabs, setTabs] = useState<string[]>(loadTabs);

  const permittedPaths = useMemo(
    () => new Set(routeRegistry.filter((route) => auth.can(route.permission)).map((route) => route.path)),
    [auth],
  );

  useEffect(() => {
    const route = routeForPath(location.pathname);
    if (!route || !auth.can(route.permission)) return;
    setTabs((current) => {
      const permitted = current.filter((path) => permittedPaths.has(path));
      const next = permitted.includes(location.pathname)
        ? permitted
        : [...permitted, location.pathname].slice(-MAX_TABS);
      writeStored(STORAGE_KEY, next);
      return next;
    });
  }, [auth, location.pathname, permittedPaths]);

  const closeTab = (path: string) => {
    setTabs((current) => {
      if (current.length === 1) return current;
      const index = current.indexOf(path);
      const next = current.filter((item) => item !== path);
      writeStored(STORAGE_KEY, next);
      if (path === location.pathname) {
        const fallback = next[Math.max(0, Math.min(index - 1, next.length - 1))] ?? '/dashboard';
        navigate(fallback);
      }
      return next;
    });
  };

  return (
    <div className="workspace-tabs" role="tablist" aria-label="Open workspaces">
      {tabs.filter((path) => permittedPaths.has(path)).map((path) => {
        const route = routeForPath(path)!;
        const selected = path === location.pathname;
        return (
          <div className={`workspace-tab ${selected ? 'selected' : ''}`} key={path} role="presentation">
            <NavLink
              to={path}
              role="tab"
              aria-selected={selected}
              className="workspace-tab-link"
            >
              <span className="workspace-tab-icon" aria-hidden="true">
                <ShellIcon name={route.icon} />
              </span>
              <span>{route.title}</span>
            </NavLink>
            {tabs.length > 1 && (
              <Tooltip title={`Close ${route.title}`}>
                <Button
                  type="text"
                  size="small"
                  className="workspace-tab-close"
                  aria-label={`Close ${route.title}`}
                  icon={<CloseOutlined />}
                  onClick={() => closeTab(path)}
                />
              </Tooltip>
            )}
          </div>
        );
      })}
    </div>
  );
}
