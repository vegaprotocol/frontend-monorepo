import { useEffect, useState } from 'react';
import { useWallet } from './use-wallet';
import { useConnect } from './use-connect';

export function useEagerConnect() {
  const current = useWallet((store) => store.current);
  const { connect } = useConnect();
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    const attemptConnect = async () => {
      // No stored config, or config was malformed or no risk accepted
      if (!current) {
        setConnecting(false);
        return;
      }

      try {
        await connect(current);
      } catch {
        console.warn(`Failed to connect with connector: ${current}`);
      } finally {
        setConnecting(false);
      }
    };

    if (typeof window !== 'undefined') {
      attemptConnect();
    }
  }, [connect, current, connecting]);

  return connecting;
}
