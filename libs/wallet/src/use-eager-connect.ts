import { useEffect, useState } from 'react';
import { useConnect, useWallet } from './wallet';
import { useVegaWallet } from './use-vega-wallet';

export function useEagerConnect() {
  const current = useWallet((store) => store.current);
  const { connect } = useConnect();
  const { onConnect } = useVegaWallet();
  const [connecting, setConnecting] = useState(true);

  console.log(current);

  useEffect(() => {
    const attemptConnect = async () => {
      // No stored config, or config was malformed or no risk accepted
      if (!current) {
        setConnecting(false);
        return;
      }

      try {
        await connect(current);
        onConnect();
      } catch {
        console.warn(`Failed to connect with connector: ${current}`);
      } finally {
        setConnecting(false);
      }
    };

    if (typeof window !== 'undefined') {
      attemptConnect();
    }
  }, [connect, onConnect, current]);

  return connecting;
}
