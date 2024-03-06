import { useEffect } from 'react';
import { useWallet } from './use-wallet';
import { useConnect } from './use-connect';

export function useEagerConnect() {
  const current = useWallet((store) => store.current);
  const status = useWallet((store) => store.status);
  const { connect } = useConnect();

  useEffect(() => {
    const attemptConnect = async () => {
      // No stored config, or config was malformed or no risk accepted
      if (!current) {
        return;
      }

      if (status !== 'disconnected') {
        return;
      }

      try {
        await connect(current);
      } catch {
        console.warn(`Failed to connect with connector: ${current}`);
      }
    };

    if (typeof window !== 'undefined') {
      attemptConnect();
    }
  }, [connect, current]);

  return status;
}
