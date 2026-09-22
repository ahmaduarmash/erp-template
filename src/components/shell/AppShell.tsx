import { Suspense, useEffect, useState } from 'react';
import { Alert, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useTemplate } from '../../theme/ThemeProvider';
import { useWorkspace } from '../../data/WorkspaceProvider';
import { PageSkeleton } from '../feedback';
import { useSound } from '../../lib/sound/useSound';
import { useWorkspaceTools } from '../../lib/useWorkspaceTools';
import { useButtonMotion } from '../../lib/motion';
import { PageTransition } from '../../lib/motion/transitions';
import { NotificationReceiver } from '../feedback/NotificationReceiver';

export default function AppShell({ onLogout }: { onLogout: () => void }) {
  useWorkspaceTools();
  useButtonMotion();
  const { config, storageError } = useTemplate();
  const workspace = useWorkspace();
  const [collapsed, setCollapsed] = useState(config.layout.sidebarDefaultCollapsed);
  const [mobile, setMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState(['/dashboard']);
  const sound = useSound();

  useEffect(() => {
    setTabs((t) => (t.includes(location.pathname) ? t : [...t, location.pathname].slice(-8)));
  }, [location.pathname]);
  useEffect(
    () => setCollapsed(config.layout.sidebarDefaultCollapsed),
    [config.layout.sidebarDefaultCollapsed],
  );

  return (
    <div
      className={`app-shell ${collapsed ? 'is-collapsed' : ''} ${mobile ? 'nav-open' : ''}`}
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest('button,a')) sound('click');
      }}
    >
      <NotificationReceiver />
      <Sidebar
        collapsed={collapsed}
        toggle={() => setCollapsed((s) => !s)}
        onNavigate={() => setMobile(false)}
      />
      {mobile && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="shell-main">
        <Topbar toggle={() => setMobile((s) => !s)} onLogout={onLogout} />
        <div className="page-tabs" aria-label="Open pages">
          {tabs.map((path) => (
            <div className={`page-tab ${path === location.pathname ? 'selected' : ''}`} key={path}>
              <NavLink to={path}>
                {path === '/dashboard' ? 'Overview' : path.split('/').pop()!.replaceAll('-', ' ')}
              </NavLink>
              {tabs.length > 1 && (
                <Button
                  type="text"
                  size="small"
                  aria-label={`Close ${path.split('/').pop()} tab`}
                  icon={<CloseOutlined />}
                  onClick={() => {
                    const next = tabs.filter((p) => p !== path);
                    setTabs(next);
                    if (path === location.pathname) navigate(next[next.length - 1]);
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <main className={`main-content ${config.layout.contentWidth === 'boxed' ? 'boxed' : ''}`}>
          {(storageError || workspace.storageError) && (
            <Alert
              className="mb-4"
              type="warning"
              showIcon
              message="Browser storage is unavailable. Changes will last only for this session."
            />
          )}
          <PageTransition transitionKey={location.pathname}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </PageTransition>
          <footer className="page-footer">
            <span>{config.brand.name} workspace</span>
            <span>Demo data · No live financial transactions</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
