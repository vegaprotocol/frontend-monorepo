import { useConfig } from './use-config';
import { useWallet } from './use-wallet';

export function useConnector() {
  const config = useConfig();
  const current = useWallet((store) => store.current);

  const connector = config.connectors.find((c) => c.id === current);

  return {
    connector,
  };
}
