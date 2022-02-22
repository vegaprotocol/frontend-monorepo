import { VegaKey } from '@vegaprotocol/vegawallet-service-api-client';
import { createContext } from 'react';
import { VegaConnector } from './vega-wallet-connectors';

interface VegaWalletContextShape {
  publicKey: VegaKey | null;
  publicKeys: VegaKey[] | null;
  setConnectDialog: (isOpen?: boolean) => void;
  connect: (connector: VegaConnector) => Promise<void>;
  disconnect: () => Promise<void>;
  connector: VegaConnector | null;
}

export const VegaWalletContext = createContext<
  VegaWalletContextShape | undefined
>(undefined);
