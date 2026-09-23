import { Suspense, useEffect, useState } from 'react';
import { Alert } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { Topbar } from './Topbar';
import { PrimaryRail } from './PrimaryRail';
import { SecondaryNav } from './SecondaryNav';
import { WorkspaceTabs } from './WorkspaceTabs';
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
  const location = useLocation();
  const sound = useSound();
  const [secondaryCollapsed, setSecondaryCollapsed] = useState(
    config.layout.sidebarDefaultCollapsed,
  );
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  useEffect(() => {
    setSecondaryCollapsed(config.layout.sidebarDefaultCollapsed);
  }, [config.layout.sidebarDefaultCollapsed]);

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavigationOpen(false);
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setSecondaryCollapsed((value) => !value);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div
      className={`app-shell ${secondaryCollapsed ? 'secondary-collapsed' : ''} ${
        mobileNavigationOpen ? 'nav-open' : ''
      }`}
      onClickCapture={(event) => {
        if ((event.target as HTMLElement).closest('button,a')) sound('click');
      }}
    >
      <NotificationReceiver />
      <div className="shell-navigation">
        <PrimaryRail onNavigate={() => setMobileNavigationOpen(false)} />
        <SecondaryNav
          collapsed={secondaryCollapsed}
          onCollapse={() => setSecondaryCollapsed(true)}
          onNavigate={() => setMobileNavigationOpen(false)}
        />
      </div>
      {mobileNavigationOpen && (
        <button
          className="navigation-backdrop"
          onClick={() => setMobileNavigationOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="shell-main">
        <Topbar
          toggleMobile={() => setMobileNavigationOpen((value) => !value)}
          toggleSecondary={() => setSecondaryCollapsed((value) => !value)}
          secondaryCollapsed={secondaryCollapsed}
          onLogout={onLogout}
        />
        <WorkspaceTabs />
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
