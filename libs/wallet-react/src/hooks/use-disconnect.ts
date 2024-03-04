import { useConfig } from './use-config';

export function useDisconnect() {
  const config = useConfig();
  return {
    disconnect: config.disconnect,
  };
}
