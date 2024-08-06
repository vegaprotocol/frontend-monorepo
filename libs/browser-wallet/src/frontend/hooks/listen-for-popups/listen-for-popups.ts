import { useEffect } from 'react';

import { usePopoverStore } from '@/stores/popover-store';

export function useListenForPopups() {
  // const { setup, teardown } = usePopoverStore((state) => ({
  //   setup: state.setup,
  //   teardown: state.teardown,
  // }));
  // useEffect(() => {
  //   setup();
  //   return teardown;
  // }, [setup, teardown]);
}
