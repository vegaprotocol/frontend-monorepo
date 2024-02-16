import { type Transaction } from '@vegaprotocol/wallet';
import { useConfig } from './use-config';
import { useWallet } from './use-wallet';

// Only for vega apps that expect a single selected key
export const useVegaWallet = () => {
  const config = useConfig();
  const store = useWallet((store) => store);

  return {
    status: store.status,
    pubKeys: store.keys,
    pubKey: store.pubKey,
    selectPubKey: (pubKey: string) => config.store.setState({ pubKey }),
    isReadOnly: store.current === 'readOnly',
    disconnect: config.disconnect,
    refreshKeys: config.refreshKeys,
    isAlive: store.status === 'connected',
    sendTx: (pubKey: string, transaction: Transaction) =>
      // @ts-ignore TODO: figure out how to type this better
      config.sendTransaction({
        publicKey: pubKey,
        sendingMode: 'TYPE_SYNC',
        ...transaction,
      }),
  };
};
