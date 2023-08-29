import {
  WalletError,
  type PubKey,
  type Transaction,
  type VegaConnector,
} from './vega-connector';
import { clearConfig, setConfig } from '../storage';

type RequestArguments = {
  method: string;
  params?: unknown[] | object;
};
type WindowEthereumProvider = {
  isMetaMask: boolean;
  request<T = unknown>(args: RequestArguments): Promise<T>;
};

export const SnapConnectorErrors = {
  ETHEREUM_UNDEFINED: new Error('MetaMask extension could not be found'),
  NODE_ADDRESS_NOT_SET: new Error('nodeAddress is not set'),
  SNAP_ID_NOT_SET: new Error('snapId is not set'),
  TRANSACTION_PARSE: new Error('could not parse transaction data'),
};

const ethereumRequest = <T>(args: RequestArguments): Promise<T> => {
  // can't declare `EthereumProvider` here because of the conflict with
  // type definitions of `@web3-react`
  if (
    'ethereum' in window &&
    typeof window.ethereum === 'object' &&
    window.ethereum &&
    'request' in window.ethereum &&
    'isMetaMask' in window.ethereum &&
    window.ethereum.isMetaMask &&
    typeof window.ethereum.request === 'function'
  ) {
    return (window.ethereum as WindowEthereumProvider).request<T>(args);
  }
  throw SnapConnectorErrors.ETHEREUM_UNDEFINED;
};

export const LOCAL_SNAP_ID = 'local:http://localhost:8080';
export const DEFAULT_SNAP_ID = 'npm:@vegaprotocol/snap';

type GetSnapsResponse = Record<string, Snap>;

type Snap = {
  id: string;
  initialPermissions?: Record<string, unknown>;
  version: string;
  enables: boolean;
  blocked: boolean;
};

type InvokeSnapRequest = {
  method: string;
  params?: object;
};

type SendTransactionResponse =
  | {
      transactionHash: string;
      receivedAt: string;
      sentAt: string;
      transaction?: {
        signature?: {
          value: string;
        };
      };
    }
  | {
      error: Error & {
        code: number;
        data: unknown;
      };
    };
type GetChainIdResponse = {
  chainID: string;
};
type ListKeysResponse = { keys: PubKey[] };

/**
 * Requests permission for a website to communicate with the specified snaps
 * and attempts to install them if they're not already installed.
 * If the installation of any snap fails, returns the error that caused the failure.
 * More informations here: https://docs.metamask.io/snaps/reference/rpc-api/#wallet_requestsnaps
 */
export const requestSnap = async (
  snapId: string,
  params: Record<'version' | string, unknown> = {}
) => {
  try {
    await ethereumRequest({
      method: 'wallet_requestSnaps',
      params: {
        [snapId]: params,
      },
    });
  } catch (err) {
    // NOOP - rejected by user
  }
};

/**
 * Gets the list of all installed snaps.
 * More information here: https://docs.metamask.io/snaps/reference/rpc-api/#wallet_getsnaps
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await ethereumRequest({
    method: 'wallet_getSnaps',
  })) as GetSnapsResponse;
};

/**
 * Gets the requested snap by `snapId` and an optional `version`
 */
export const getSnap = async (
  snapId: string,
  version?: string
): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();
    return Object.values(snaps).find(
      (snap) => snap.id === snapId && (!version || snap.version === version)
    );
  } catch (e) {
    return undefined;
  }
};

export const invokeSnap = async <T>(
  snapId: string,
  request: InvokeSnapRequest
) => {
  const req = {
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request,
    },
  };
  return await ethereumRequest<T>(req);
};

export class SnapConnector implements VegaConnector {
  description = "Connects using Vega Protocol's MetaMask snap";
  snapId: string | undefined = undefined;
  nodeAddress: string | undefined = undefined;

  constructor(snapId = DEFAULT_SNAP_ID) {
    this.snapId = snapId;
  }

  async listKeys() {
    if (!this.snapId) throw SnapConnectorErrors.SNAP_ID_NOT_SET;
    return await invokeSnap<ListKeysResponse>(this.snapId, {
      method: 'client.list_keys',
    });
  }

  async connect() {
    const res = await this.listKeys();
    setConfig({
      connector: 'snap',
      token: null, // no token required for snap
      url: null, // no url required for snap
    });
    return res?.keys;
  }

  async sendTx(pubKey: string, transaction: Transaction) {
    if (!this.nodeAddress) throw SnapConnectorErrors.NODE_ADDRESS_NOT_SET;
    if (!this.snapId) throw SnapConnectorErrors.SNAP_ID_NOT_SET;

    // This step is needed to strip the transaction object from any additional
    // properties, such as `__proto__`, etc.
    let txData = null;
    try {
      txData = JSON.parse(JSON.stringify(transaction));
    } catch (err) {
      throw SnapConnectorErrors.TRANSACTION_PARSE;
    }

    const payload = {
      method: 'client.send_transaction',
      params: {
        sendingMode: 'TYPE_SYNC',
        transaction: txData,
        publicKey: pubKey,
        networkEndpoints: [this.nodeAddress],
      },
    };

    const result = await invokeSnap<SendTransactionResponse>(
      this.snapId,
      payload
    );

    if ('error' in result) {
      const { message, code, data } = result.error;
      throw new WalletError(
        message,
        code,
        typeof data === 'string' ? data : ''
      );
    }

    if (!result?.transaction?.signature) {
      throw new Error('could not retrieve transaction siganture');
    }

    return {
      transactionHash: result.transactionHash,
      signature: result?.transaction?.signature?.value,
      receivedAt: result.receivedAt,
      sentAt: result.sentAt,
    };
  }

  async getChainId(): Promise<GetChainIdResponse> {
    if (!this.nodeAddress) throw SnapConnectorErrors.NODE_ADDRESS_NOT_SET;
    if (!this.snapId) throw SnapConnectorErrors.SNAP_ID_NOT_SET;

    const response = await invokeSnap<GetChainIdResponse>(this.snapId, {
      method: 'client.get_chain_id',
      params: { networkEndpoints: [this.nodeAddress] },
    });

    return response;
  }

  async disconnect() {
    clearConfig();
  }
}
