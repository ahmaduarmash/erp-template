import { useEffect, useRef } from 'react';
import { App } from 'antd';
import { useWorkspace } from '../../data/WorkspaceProvider';
import { useTemplate } from '../../theme/ThemeProvider';
import { useSound } from '../../lib/sound/useSound';
/** Call workspace.receiveNotice from your authenticated SSE/WebSocket adapter. */
export function NotificationReceiver() {
  const { notices } = useWorkspace();
  const { config } = useTemplate();
  const { notification } = App.useApp();
  const sound = useSound();
  const seen = useRef(new Set(notices.map((n) => n.id)));
  useEffect(() => {
    for (const notice of notices) {
      if (!seen.current.has(notice.id)) {
        seen.current.add(notice.id);
        if (config.notifications[notice.category]) {
          notification.info({ message: notice.title, description: notice.detail });
          sound('notification');
        }
      }
    }
  }, [notices, config.notifications, notification, sound]);
  return null;
}
