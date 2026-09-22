import { Avatar, Badge, Button, Dropdown, Empty, Input, Modal, Tooltip } from 'antd';
import {
  BellOutlined,
  DownOutlined,
  MenuOutlined,
  MoonOutlined,
  SearchOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTemplate } from '../../theme/ThemeProvider';
import { useWorkspace } from '../../data/WorkspaceProvider';
import { modules } from '../../data/modules';

export function Topbar({ toggle, onLogout }: { toggle: () => void; onLogout: () => void }) {
  const { dark, setGroup, config } = useTemplate();
  const { profile, notices, markRead } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const routes = [
    { title: 'Overview', path: '/dashboard' },
    ...modules.map((m) => ({ title: m.title, path: `/${m.group.toLowerCase()}/${m.key}` })),
    { title: 'Settings', path: '/settings' },
    { title: 'Profile', path: '/profile' },
    { title: 'Notifications', path: '/system/notifications' },
    { title: 'Audit log', path: '/system/audit-log' },
  ];
  const filtered = routes.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()));
  const visibleNotices = notices.filter((n) => config.notifications[n.category]);

  return (
    <>
      <header className="topbar">
        <Button
          className="mobile-menu"
          type="text"
          icon={<MenuOutlined />}
          aria-label="Open navigation"
          onClick={toggle}
        />
        <span className="topbar-location">
          Workspace <span>/</span>{' '}
          <strong>{routes.find((r) => r.path === location.pathname)?.title || 'Overview'}</strong>
        </span>
        <div className="topbar-tools">
          <button className="search-trigger" onClick={() => setSearch(true)}>
            <SearchOutlined />
            <span>Search workspace</span>
            <kbd>⌘ K</kbd>
          </button>
          <Tooltip title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Button
              type="text"
              aria-label="Toggle theme"
              icon={dark ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => setGroup('theme', { mode: dark ? 'light' : 'dark' })}
            />
          </Tooltip>
          <Dropdown
            trigger={['click']}
            popupRender={() => (
              <div className="notification-dropdown panel">
                <div className="flex items-center justify-between mb-3">
                  <strong>Notifications</strong>
                  <Button size="small" type="text" onClick={() => markRead()}>
                    Mark all read
                  </Button>
                </div>
                {visibleNotices.length ? (
                  visibleNotices.slice(0, 4).map((n) => (
                    <button
                      className={`notice-compact ${n.read ? '' : 'unread'}`}
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        navigate('/system/notifications');
                      }}
                    >
                      <strong>{n.title}</strong>
                      <span>{n.detail}</span>
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
            <Badge count={visibleNotices.filter((n) => !n.read).length} size="small">
              <Button type="text" aria-label="Notifications" icon={<BellOutlined />} />
            </Badge>
          </Dropdown>
          <span className="topbar-divider" />
          <Dropdown
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
            <button className="profile-trigger">
              <Avatar size={30} className="avatar">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </Avatar>
              <DownOutlined />
            </button>
          </Dropdown>
        </div>
      </header>
      <Modal title="Search workspace" open={search} onCancel={() => setSearch(false)} footer={null}>
        <Input
          autoFocus
          prefix={<SearchOutlined />}
          placeholder="Find a page…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Find a page"
        />
        <div className="search-results">
          {filtered.map((r) => (
            <button
              key={r.path}
              onClick={() => {
                navigate(r.path);
                setSearch(false);
                setQuery('');
              }}
            >
              {r.title}
              <span>↗</span>
            </button>
          ))}
          {!filtered.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </div>
      </Modal>
    </>
  );
}
