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
    isReadOnly: store.current === 'viewParty',
    disconnect: () => {
      config.disconnect();
      config.store.setState({ pubKey: undefined });
    },
    refreshKeys: config.refreshKeys,
    sendTx: (pubKey: string, transaction: Transaction) => {
      return config.sendTransaction({
        publicKey: pubKey,
        sendingMode: 'TYPE_SYNC',
        transaction,
      });
    },
  };
};
