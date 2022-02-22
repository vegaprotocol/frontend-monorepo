import { VegaKey } from '@vegaprotocol/vegawallet-service-api-client';
import { createContext } from 'react';
import { VegaConnector } from './connectors';

interface VegaWalletContextShape {
  publicKey: VegaKey | null;
  publicKeys: VegaKey[] | null;
  connect: (connector: VegaConnector) => Promise<void>;
  disconnect: () => Promise<void>;
  connector: VegaConnector | null;
}

export const VegaWalletContext = createContext<
  VegaWalletContextShape | undefined
>(undefined);
