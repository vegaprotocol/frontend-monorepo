import { type Transaction } from '@vegaprotocol/wallet';
import { useConfig } from './use-config';
import { useWallet } from './use-wallet';

// Only for vega apps that expect a single selected key
export const useVegaWallet = () => {
  const config = useConfig();
  const store = useWallet((store) => store);

  return {
    current: store.current,
    currentConnector: store.currentConnector,
    status: store.status,
    pubKeys: store.keys,
    pubKey: store.pubKey,
    selectPubKey: (pubKey: string) =>
      config.store.setState({ pubKey, previousKey: pubKey }),
    isReadOnly: store.current === 'viewParty',
    disconnect: () => {
      return config.disconnect();
    },
    refreshKeys: config.refreshKeys,
    chainId: store.chainId,
    sendTx: (pubKey: string, transaction: Transaction) => {
      return config.sendTransaction({
        publicKey: pubKey,
        sendingMode: 'TYPE_SYNC',
        transaction,
      });
    },
  };
};
