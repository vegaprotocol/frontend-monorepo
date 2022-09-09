import { createContext } from 'react';
import type {
  Transaction,
  TransactionResponse,
  VegaConnector,
} from './connectors';

export interface VegaWalletContextShape {
  /** The current select public key */
  pubKey: string | null;

  /** Public keys stored in users wallet */
  pubKeys: string[] | null;

  /** Calls connect on the supplied connector, storing the returned keys  */
  connect: (connector: VegaConnector) => Promise<string[] | null>;

  /** Disconnects from the connector and clears public key state */
  disconnect: () => Promise<boolean>;

  /** Sets the current selected public key */
  selectPublicKey: (publicKey: string) => void;

  /** Reference to the connector */
  connector: VegaConnector | null;

  /** Send a transaction to the network, only order submissions for now */
  sendTx: (
    pubKey: string,
    transaction: Transaction
  ) => Promise<TransactionResponse>;
}

export const VegaWalletContext = createContext<
  VegaWalletContextShape | undefined
>(undefined);
