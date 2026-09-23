import { Avatar, Badge, Button, Empty, Input, Tooltip } from 'antd';
import {
  BellOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SearchOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTemplate } from '../../theme/ThemeProvider';
import { useWorkspace } from '../../data/WorkspaceProvider';
import { routeForPath, routeGroupFor, routeRegistry } from '../../config/routes';
import { useAuth } from '../../auth/AuthProvider';
import { AnimatedDropdown, AnimatedModal } from '../../lib/motion/overlays';
import { ShellIcon } from './ShellIcon';

export function Topbar({
  toggleMobile,
  mobileNavigationOpen,
  toggleSecondary,
  secondaryCollapsed,
  onLogout,
}: {
  toggleMobile: () => void;
  mobileNavigationOpen: boolean;
  toggleSecondary: () => void;
  secondaryCollapsed: boolean;
  onLogout: () => void;
}) {
  const { dark, setGroup, config } = useTemplate();
  const { profile, notices, markRead, org } = useWorkspace();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const current = routeForPath(location.pathname);
  const group = routeGroupFor(current?.group ?? 'Overview');

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearch((value) => !value);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const searchableRoutes = useMemo(() => routeRegistry.filter((route) => auth.can(route.permission)), [auth]);
  const filtered = searchableRoutes.filter((route) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${route.title} ${route.description} ${route.group}`.toLowerCase().includes(needle);
  });
  const visibleNotices = notices.filter((notice) => config.notifications[notice.category]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-context">
          <Button
            className="mobile-menu"
            type="text"
            icon={<MenuOutlined />}
            aria-label={mobileNavigationOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileNavigationOpen}
            aria-controls="shell-navigation"
            onClick={toggleMobile}
          />
          <Tooltip title={secondaryCollapsed ? 'Show section navigation' : 'Hide section navigation'}>
            <Button
              className="secondary-nav-toggle"
              type="text"
              icon={secondaryCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              aria-label={secondaryCollapsed ? 'Show section navigation' : 'Hide section navigation'}
              aria-expanded={!secondaryCollapsed}
              aria-controls="shell-navigation"
              onClick={toggleSecondary}
            />
          </Tooltip>
          <div className="topbar-location">
            <span className="topbar-domain">{group.title}</span>
            <strong>{current?.title ?? 'Workspace'}</strong>
            <small>{current?.description ?? group.description}</small>
          </div>
        </div>
        <div className="topbar-tools">
          <button className="search-trigger" onClick={() => setSearch(true)} aria-label="Search workspace">
            <SearchOutlined />
            <span>Search</span>
            <kbd aria-hidden="true">⌘ K</kbd>
          </button>
          <Tooltip title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Button
              type="text"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              icon={dark ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => setGroup('theme', { mode: dark ? 'light' : 'dark' })}
            />
          </Tooltip>
          <AnimatedDropdown
            trigger={['click']}
            popupRender={() => (
              <div className="notification-dropdown panel" aria-label="Notifications menu">
                <div className="notification-dropdown-head">
                  <div>
                    <strong>Notifications</strong>
                    <small>{visibleNotices.filter((notice) => !notice.read).length} unread</small>
                  </div>
                  <Button size="small" type="text" onClick={() => markRead()}>
                    Mark all read
                  </Button>
                </div>
                {visibleNotices.length ? (
                  visibleNotices.slice(0, 4).map((notice) => (
                    <button
                      className={`notice-compact ${notice.read ? '' : 'unread'}`}
                      key={notice.id}
                      onClick={() => {
                        markRead(notice.id);
                        navigate('/system/notifications');
                      }}
                    >
                      <strong>{notice.title}</strong>
                      <span>{notice.detail}</span>
                    </button>
                  ))
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
                <Button block type="link" onClick={() => navigate('/system/notifications')}>
                  View all notifications
                </Button>
              </div>
            )}
          >
            <Badge count={visibleNotices.filter((notice) => !notice.read).length} size="small">
              <Button type="text" aria-label="Notifications" icon={<BellOutlined />} />
            </Badge>
          </AnimatedDropdown>
          <span className="topbar-divider" aria-hidden="true" />
          <AnimatedDropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'profile', label: 'My profile' },
                { key: 'settings', label: 'Workspace settings' },
                { type: 'divider' },
                { key: 'logout', label: 'Sign out' },
              ],
              onClick: ({ key }) => (key === 'logout' ? onLogout() : navigate(`/${key}`)),
            }}
          >
            <button className="profile-trigger" aria-label="Open user menu">
              <Avatar size={30} className="avatar">
                {profile.name.split(' ').map((name) => name[0]).join('').slice(0, 2)}
              </Avatar>
              <span className="profile-trigger-copy">
                <strong>{profile.name}</strong>
                <small>{org.name}</small>
              </span>
              <DownOutlined aria-hidden="true" />
            </button>
          </AnimatedDropdown>
        </div>
      </header>
      <AnimatedModal title="Search workspace" open={search} onCancel={() => setSearch(false)} footer={null} width={560}>
        <Input
          autoFocus
          prefix={<SearchOutlined />}
          placeholder="Find a page, workflow or business area…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Find a page"
        />
        <div className="search-results" aria-label="Workspace search results">
          {filtered.map((route) => (
            <button
              key={route.path}
              onClick={() => {
                navigate(route.path);
                setSearch(false);
                setQuery('');
              }}
            >
              <span className="search-result-icon" aria-hidden="true">
                <ShellIcon name={route.icon} />
              </span>
              <span className="search-result-copy">
                <strong>{route.title}</strong>
                <small>{route.description}</small>
              </span>
              <span className="search-result-group">{route.group}</span>
            </button>
          ))}
          {!filtered.length ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matching workspace" /> : null}
        </div>
      </AnimatedModal>
    </>
  );
}
