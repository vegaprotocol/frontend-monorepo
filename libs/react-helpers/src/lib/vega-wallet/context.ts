import { VegaKey } from '@vegaprotocol/vegawallet-service-api-client';
import { createContext } from 'react';
import { VegaConnector } from './connectors';

export interface VegaKeyExtended extends VegaKey {
  name: string;
}

export interface VegaWalletContextShape {
  /** Public keys stored in users wallet */
  publicKeys: VegaKeyExtended[] | null;

  /** Calls connect on the supplied connector, storing the returned keys  */
  connect: (connector: VegaConnector) => Promise<void>;

  /** Disconnects from the connector and clears public key state */
  disconnect: () => Promise<void>;

  /** Reference to the connector */
  connector: VegaConnector | null;
}

export const VegaWalletContext = createContext<
  VegaWalletContextShape | undefined
>(undefined);
