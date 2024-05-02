import { useConfig } from './use-config';

export function useDisconnect() {
  const config = useConfig();

  return {
    disconnect: () => {
      config.store.setState({
        current: undefined,
        keys: [],
        pubKey: undefined,
      });
      return config.disconnect();
    },
  };
}
