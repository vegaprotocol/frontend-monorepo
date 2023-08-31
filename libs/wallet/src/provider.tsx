import { LocalStorage } from '@vegaprotocol/utils';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { WalletClientError } from '@vegaprotocol/wallet-client';
import type { VegaWalletContextShape } from '.';
import type {
  PubKey,
  Transaction,
  VegaConnector,
} from './connectors/vega-connector';
import { VegaWalletContext } from './context';
import { WALLET_KEY, WALLET_RISK_ACCEPTED_KEY } from './storage';
import { ViewConnector } from './connectors';
import { useLocalStorage } from '@vegaprotocol/react-helpers';

type Networks =
  | 'MAINNET'
  | 'MAINNET_MIRROR'
  | 'TESTNET'
  | 'VALIDATOR_TESTNET'
  | 'STAGNET1'
  | 'DEVNET'
  | 'CUSTOM';

interface VegaWalletLinks {
  explorer: string;
  concepts: string;
  chromeExtensionUrl: string;
  mozillaExtensionUrl: string;
}

export interface VegaWalletConfig {
  network: Networks;
  vegaUrl: string;
  vegaWalletServiceUrl: string;
  links: VegaWalletLinks;
}

const ExternalLinks = {
  VEGA_WALLET_URL_ABOUT: 'https://vega.xyz/wallet/#overview',
  VEGA_WALLET_BROWSER_LIST: '',
};

interface VegaWalletProviderProps {
  children: ReactNode;
  config: VegaWalletConfig;
}

export const VegaWalletProvider = ({
  children,
  config,
}: VegaWalletProviderProps) => {
  // Current selected pubKey
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  // Array of public keys retrieved from the connector
  const [pubKeys, setPubKeys] = useState<PubKey[] | null>(null);

  // Reference to the current connector instance
  const connector = useRef<VegaConnector | null>(null);

  const selectPubKey = useCallback((pk: string) => {
    setPubKey(pk);
    LocalStorage.setItem(WALLET_KEY, pk);
  }, []);

  const fetchPubKeys = useCallback(async () => {
    if (!connector.current) {
      throw new Error('No connector');
    }
    try {
      const keys = await connector.current.connect();

      if (keys?.length) {
        setPubKeys(keys);
        setIsReadOnly(connector.current instanceof ViewConnector);
        return keys;
      } else {
        return null;
      }
    } catch (err) {
      if (err instanceof WalletClientError) {
        throw err;
      }
      return null;
    }
  }, []);

  const connect = useCallback(async (c: VegaConnector) => {
    connector.current = c;
    try {
      const keys = await connector.current.connect();

      if (keys?.length) {
        setPubKeys(keys);
        setIsReadOnly(connector.current instanceof ViewConnector);
        const lastUsedPubKey = LocalStorage.getItem(WALLET_KEY);
        const foundKey = keys.find((key) => key.publicKey === lastUsedPubKey);
        if (foundKey) {
          setPubKey(foundKey.publicKey);
        } else {
          setPubKey(keys[0].publicKey);
        }

        return keys;
      } else {
        return null;
      }
    } catch (err) {
      if (err instanceof WalletClientError) {
        throw err;
      }
      return null;
    }
  }, []);

  const disconnect = useCallback(async () => {
    // always clear state after attempted disconnection.. this
    // is because long lived token sessions (used in tests)
    // cannot be cleared. Clearing state will force user to reconnect
    // again as expected
    setPubKeys(null);
    setPubKey(null);
    setIsReadOnly(false);
    LocalStorage.removeItem(WALLET_KEY);
    try {
      await connector.current?.disconnect();
      connector.current = null;
    } catch (err) {
      console.error(err);
      connector.current = null;
    }
  }, []);

  const sendTx = useCallback((pubkey: string, transaction: Transaction) => {
    if (!connector.current) {
      throw new Error('No connector');
    }
    return connector.current.sendTx(pubkey, transaction);
  }, []);

  const [riskAcceptedValue] = useLocalStorage(WALLET_RISK_ACCEPTED_KEY);
  const acknowledgeNeeded =
    config.network === 'MAINNET' && riskAcceptedValue !== 'true';

  const contextValue = useMemo<VegaWalletContextShape>(() => {
    return {
      vegaUrl: config.vegaUrl,
      vegaWalletServiceUrl: config.vegaWalletServiceUrl,
      network: config.network,
      links: {
        explorer: config.links.explorer,
        about: ExternalLinks.VEGA_WALLET_URL_ABOUT,
        browserList: ExternalLinks.VEGA_WALLET_BROWSER_LIST,
        concepts: config.links.concepts,
        chromeExtensionUrl: config.links.chromeExtensionUrl,
        mozillaExtensionUrl: config.links.mozillaExtensionUrl,
      },
      isReadOnly,
      pubKey,
      pubKeys,
      selectPubKey,
      connect,
      disconnect,
      sendTx,
      fetchPubKeys,
      acknowledgeNeeded,
    };
  }, [
    config,
    isReadOnly,
    pubKey,
    pubKeys,
    selectPubKey,
    connect,
    disconnect,
    sendTx,
    fetchPubKeys,
    acknowledgeNeeded,
  ]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
    </VegaWalletContext.Provider>
  );
};
