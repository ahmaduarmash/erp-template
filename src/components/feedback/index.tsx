import { App, Empty, Skeleton } from 'antd';
import { useSound } from '../../lib/sound/useSound';
import { useMemo } from 'react';
export function useFeedback() {
  const { message } = App.useApp();
  const sound = useSound();
  return useMemo(
    () => ({
      success: (text: string) => {
        void message.success(text);
        sound('success');
      },
      error: (text: string) => {
        void message.error(text);
        sound('warning');
      },
      info: (text: string) => {
        void message.info(text);
        sound('notification');
      },
    }),
    [message, sound],
  );
}
export const EmptyState = () => (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No records match your search" />
);
export const PageSkeleton = () => (
  <div className="page-stack" aria-busy="true" aria-label="Loading page">
    <Skeleton active />
    <Skeleton active />
    <Skeleton active />
  </div>
);
