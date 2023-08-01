import type { Transaction, VegaConnector } from './vega-connector';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

export const defaultSnapOrigin = 'local:http://localhost:8080';

// Requests permission for a website to communicate with the specified snaps
// and attempts to install them if they're not already installed.
// If the installation of any snap fails, returns the error that caused the failure.
// More informations here: https://docs.metamask.io/snaps/reference/rpc-api/#wallet_requestsnaps
//
// The snapId when release will be using the following
// pattern: `npm:@vegaprotocol/snapname` (prod snap ID)
// to use the localy running extension use: `local:http://localhost:8080` (local snap ID)
// params can contain an optional version
export const connectSnap = async (
  snapId: string,
  params: Record<'version' | string, unknown> = {}
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};

// the returns the list of installed snaps
// for more infos: https://docs.metamask.io/snaps/reference/rpc-api/#wallet_getsnaps
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

// returns the snap informations if connected with this
// webapp.
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

export class SnapConnector implements VegaConnector {
  description = "Connects using Vega Protocol's MetaMask snap";
  snapId: string = defaultSnapOrigin;
  nodeAddress: string | undefined = undefined;

  /**
   * @param nodeAddress url for the node (without pathname, eg /graphql)
   */
  constructor(nodeAddress?: string) {
    this.nodeAddress = nodeAddress;
  }

  async connectWallet() {
    return null;
  }

  async connect() {
    const res = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: defaultSnapOrigin,
        request: { method: 'client.list_keys' },
      },
    });

    // TODO: setConfig

    console.log(res);

    return res.keys;
  }

  async sendTx(pubKey: string, transaction: Transaction) {
    if (!this.nodeAddress) throw new Error('nodeAddress not set');
    const payload = JSON.parse(
      JSON.stringify({
        method: 'wallet_invokeSnap',
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: 'client.send_transaction',
            params: {
              publicKey: pubKey,
              transaction,
              sendingMode: 'TYPE_SYNC',
              networkEndpoints: [this.nodeAddress],
            },
          },
        },
      })
    );
    console.log(payload);
    const result = await window.ethereum.request(payload);

    console.log(result);

    return {
      transactionHash: result.transactionHash,
      receivedAt: result.receivedAt,
      sentAt: result.sentAt,
      signature: result.transaction.signature.value,
    };
  }

  async getChainId(): Promise<{ chainID: string }> {
    if (!this.nodeAddress) throw new Error('nodeAddress not set');
    return await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: defaultSnapOrigin,
        request: {
          method: 'client.get_chain_id',
          networkEndpoint: [this.nodeAddress],
        },
      },
    });
  }

  // NO-OP
  async disconnect() {
    return undefined;
  }

  // async signTransaction(params) {
  //   throw new Error('signTransaction not supported');
  // }
}
