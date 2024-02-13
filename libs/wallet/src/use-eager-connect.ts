import { useEffect, useState } from 'react';
import { getConfig } from './storage';
import { useConnect } from './wallet';
import { useVegaWallet } from './use-vega-wallet';

export function useEagerConnect() {
  const { connect, connectors } = useConnect();
  const { onConnect } = useVegaWallet();
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    const attemptConnect = async () => {
      const cfg = getConfig();
      // No stored config, or config was malformed or no risk accepted
      if (!cfg || !cfg.type) {
        setConnecting(false);
        return;
      }

      try {
        await connect(cfg.type);
        onConnect();
      } catch {
        console.warn(`Failed to connect with connector: ${cfg.type}`);
      } finally {
        setConnecting(false);
      }
    };

    if (typeof window !== 'undefined') {
      attemptConnect();
    }
  }, [connect, connectors, onConnect]);

  return connecting;
}
