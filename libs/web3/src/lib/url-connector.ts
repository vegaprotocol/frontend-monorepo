import { Wallet } from 'ethers';
import { Connector } from '@web3-react/types';

import type { ConnectionInfo } from '@ethersproject/web';
import type { Actions } from '@web3-react/types';
import { initializeConnector } from '@web3-react/core';
import type { Eip1193Bridge } from '@ethersproject/experimental';
import { Eip1193CustomBridge } from './eip-1193-custom-bridge';

type url = string | ConnectionInfo;

export class UrlConnector extends Connector {
  /** {@inheritdoc Connector.provider} */
  public override provider: Eip1193Bridge | undefined;

  private eagerConnection?: Promise<void>;
  private url: url;
  private ethWalletMnemonic: string;

  /**
   * @param url - An RPC url.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(
    actions: Actions,
    url: url,
    ethWalletMnemonic: string,
    connectEagerly = false
  ) {
    super(actions);

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error(
        'connectEagerly = true is invalid for SSR, instead use the activate method in a useEffect'
      );
    }

    this.url = url;
    this.ethWalletMnemonic = ethWalletMnemonic;

    if (connectEagerly) void this.activate();
  }

  private async isomorphicInitialize() {
    if (this.eagerConnection) return this.eagerConnection;

    await (this.eagerConnection = import('@ethersproject/providers')
      .then(({ JsonRpcProvider }) => JsonRpcProvider)
      .then((JsonRpcProvider) => {
        const provider = new JsonRpcProvider(this.url);
        const privateKey = Wallet.fromMnemonic(
          this.ethWalletMnemonic,
          `m/44'/60'/0'/0/0`
        ).privateKey;
        const signer = new Wallet(privateKey, provider);
        this.provider = new Eip1193CustomBridge(signer, provider);
        this.actions.update({ accounts: [signer.address], chainId: 1440 });
      }));
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    this.actions.startActivation();

    await this.isomorphicInitialize();

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const chainId = await this.provider!.request({ method: 'eth_chainId' });
      this.actions.update({ chainId: Number(chainId) });
    } catch (error) {
      this.onError?.(error as Error);
    }
  }
}

export const initializeUrlConnector = (
  localProviderUrl: string,
  walletMnemonic: string
) => {
  return initializeConnector<UrlConnector>(
    (actions) => new UrlConnector(actions, localProviderUrl, walletMnemonic)
  );
};
