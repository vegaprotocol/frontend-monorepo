import { type Transaction } from './transaction-types';
import { useConfig, useWallet } from './wallet';

// Only for vega apps that expect a single selected key
export const useVegaWallet = () => {
  const config = useConfig();
  const store = useWallet((store) => store);

  return {
    status: store.status,
    pubKeys: store.keys,
    pubKey: store.pubKey,
    selectPubKey: store.setPubKey,
    isReadOnly: store.current === 'readOnly',
    disconnect: config.disconnect,
    refreshKeys: config.refreshKeys,
    isAlive: store.keys.length > 0,
    sendTx: (pubKey: string, transaction: Transaction) =>
      // TODO: figure out how to type this better
      config.sendTransaction({
        publicKey: pubKey,
        sendingMode: 'TYPE_SYNC',
        ...transaction,
      }),
  };
};
