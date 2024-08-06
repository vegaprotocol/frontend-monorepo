import { useEffect, useMemo } from 'react';

import { getExtensionApi } from '@/lib/extension-apis';

// import initKeepAlive from '../../lib/mv3-keep-alive';
export const usePing = () => {
  // const backgroundPort = useMemo(() => {
  //   const { runtime } = getExtensionApi();
  //   return runtime.connect({ name: 'popup' });
  // }, []);
  // const keepAlive = useMemo(() => initKeepAlive(), []);
  // useEffect(() => {
  //   keepAlive(backgroundPort);
  //   return () => {
  //     // Cancels the running keepAlive
  //     keepAlive(null);
  //   };
  // }, [backgroundPort, keepAlive]);
};
