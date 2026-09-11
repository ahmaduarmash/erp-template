import { useState } from 'react';
import { Badge, Button, Empty, Segmented } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/shell/PageHeader';
import { useWorkspace } from '../../data/WorkspaceProvider';
import { useTemplate } from '../../theme/ThemeProvider';
import { useFeedback } from '../../components/feedback';
import { MotionSurface } from '../../lib/motion';
export default function Notifications() {
  const { notices, markRead, receiveNotice } = useWorkspace();
  const { config } = useTemplate();
  const [filter, setFilter] = useState('All');
  const feedback = useFeedback();
  const list = notices.filter(
    (n) => config.notifications[n.category] && (filter === 'All' || !n.read),
  );
  return (
    <MotionSurface page>
      <PageHeader
        title="Notifications"
        group="System"
        description="The updates that need your attention."
        action={
          <>
            <Button
              onClick={() =>
                receiveNotice({
                  title: 'Test notification received',
                  detail: 'Your notification adapter is working in this browser.',
                  category: 'security',
                })
              }
            >
              Send test
            </Button>
            <Button
              icon={<CheckOutlined />}
              onClick={() => {
                markRead();
                feedback.success('All notifications marked as read');
              }}
            >
              Mark all read
            </Button>
          </>
        }
      />
      <Segmented className="mb-5" options={['All', 'Unread']} value={filter} onChange={setFilter} />
      <section className="panel">
        {list.length ? (
          list.map((n) => (
            <div className={`notification-row ${n.read ? '' : 'unread'}`} key={n.id}>
              <span className="notification-icon">
                <BellOutlined />
              </span>
              <div className="flex-1">
                <Badge dot={!n.read} offset={[8, 0]}>
                  <strong>{n.title}</strong>
                </Badge>
                <p className="muted">{n.detail}</p>
                <small className="muted">
                  {n.category} · {new Date(n.date).toLocaleString()}
                </small>
              </div>
              {!n.read && (
                <Button
                  size="small"
                  onClick={() => {
                    markRead(n.id);
                    feedback.success('Marked as read');
                  }}
                >
                  Mark read
                </Button>
              )}
            </div>
          ))
        ) : (
          <Empty className="p-8" description="You’re all caught up" />
        )}
      </section>
    </MotionSurface>
  );
}
