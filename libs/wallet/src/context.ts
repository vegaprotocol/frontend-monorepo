import { createContext } from 'react';
import type {
  PubKey,
  Transaction,
  TransactionResponse,
  VegaConnector,
} from './connectors';

export interface VegaWalletContextShape {
  /** Current connected network */
  network: string;

  /** Url of current connected node */
  vegaUrl: string;

  /** Url of running wallet service */
  vegaWalletServiceUrl: string;

  /** If the current connector does not support signing transactions */
  isReadOnly: boolean;
  /** The current select public key */
  pubKey: string | null;

  /** Public keys stored in users wallet */
  pubKeys: PubKey[] | null;

  /** Calls connect on the supplied connector, storing the returned keys  */
  connect: (connector: VegaConnector) => Promise<PubKey[] | null>;

  /** Disconnects from the connector and clears public key state */
  disconnect: () => Promise<void>;

  /** Sets the current selected public key */
  selectPubKey: (pubKey: string) => void;

  /** Sign and send a transaction to the network */
  sendTx: (
    /** Public key to use in connected wallet */
    pubKey: string,
    /** Transaction payload */
    transaction: Transaction
  ) => Promise<TransactionResponse | null>;

  /** Fetch public keys */
  fetchPubKeys?: () => Promise<PubKey[] | null>;

  /** Acknowledge disclaimer */
  acknowledgeNeeded?: boolean;

  /** Useful links for wallet users */
  links: {
    explorer: string;
    about: string;
    concepts: string;
    browserList: string;
    chromeExtensionUrl: string;
    mozillaExtensionUrl: string;
  };
}

export const VegaWalletContext = createContext<
  VegaWalletContextShape | undefined
>(undefined);
