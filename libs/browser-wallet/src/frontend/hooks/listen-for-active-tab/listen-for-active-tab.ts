import { useEffect } from 'react';

import { useTabStore } from '@/stores/tab-store';

export function useListenForActiveTab() {
  const { setup, teardown } = useTabStore((state) => ({
    setup: state.setup,
    teardown: state.teardown,
  }));
  useEffect(() => {
    setup();
    return teardown;
  }, [setup, teardown]);
}
