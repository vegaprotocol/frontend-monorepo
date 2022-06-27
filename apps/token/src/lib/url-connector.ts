import { ethers, Wallet } from 'ethers';
import { Connector } from '@web3-react/types';

import { Eip1193Bridge } from '@ethersproject/experimental';
import type { ConnectionInfo } from '@ethersproject/web';
import type { Actions } from '@web3-react/types';
import { ENV } from '../config/env';

export class CustomizedBridge extends Eip1193Bridge {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendAsync(...args: any) {
    console.debug('sendAsync called', ...args);
    return this.send(...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async send(...args: any) {
    console.debug('send called', ...args);
    const isCallbackForm =
      typeof args[0] === 'object' && typeof args[1] === 'function';
    let callback;
    let method;
    let params;
    if (isCallbackForm) {
      callback = args[1];
      method = args[0].method;
      params = args[0].params;
    } else {
      method = args[0];
      params = args[1];
    }
    try {
      // Hacky, https://github.com/ethers-io/ethers.js/issues/1683#issuecomment-1016227588

      // If from is present on eth_call it errors, removing it makes the library set
      // from as the connected wallet which works fine
      if (params && params.length && params[0].from && method === 'eth_call')
        delete params[0].from;
      let result;
      // For sending a transaction if we call send it will error
      // as it wants gasLimit in sendTransaction but hexlify sets the property gas
      // to gasLimit which makes sensd transaction error.
      // This has taken the code from the super method for sendTransaction and altered
      // it slightly to make it work with the gas limit issues.
      if (
        params &&
        params.length &&
        params[0].from &&
        method === 'eth_sendTransaction'
      ) {
        // Hexlify will not take gas, must be gasLimit, set this property to be gasLimit
        params[0].gasLimit = params[0].gas;
        delete params[0].gas;
        // If from is present on eth_sendTransaction it errors, removing it makes the library set
        // from as the connected wallet which works fine
        delete params[0].from;
        const req = ethers.providers.JsonRpcProvider.hexlifyTransaction(
          params[0]
        );
        // Hexlify sets the gasLimit property to be gas again and send transaction requires gasLimit
        req['gasLimit'] = req['gas'];
        delete req['gas'];

        if (!this.signer) {
          throw new Error('No signer');
        }

        // Send the transaction
        const tx = await this.signer.sendTransaction(req);
        result = tx.hash;
      } else {
        // All other transactions the base class works for
        result = await super.send(method, params);
      }
      console.debug('result received', method, params, result);
      if (isCallbackForm) {
        callback(null, { result });
      } else {
        return result;
      }
    } catch (error) {
      console.error(error);
      if (isCallbackForm) {
        callback(error, null);
      } else {
        throw error;
      }
    }
  }
}

type url = string | ConnectionInfo;

export class Url extends Connector {
  /** {@inheritdoc Connector.provider} */
  public override provider: Eip1193Bridge | undefined;

  private eagerConnection?: Promise<void>;
  private url: url;

  /**
   * @param url - An RPC url.
   * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
   */
  constructor(actions: Actions, url: url, connectEagerly = false) {
    super(actions);

    if (connectEagerly && typeof window === 'undefined') {
      throw new Error(
        'connectEagerly = true is invalid for SSR, instead use the activate method in a useEffect'
      );
    }

    this.url = url;

    if (connectEagerly) void this.activate();
  }

  private async isomorphicInitialize() {
    if (this.eagerConnection) return this.eagerConnection;

    await (this.eagerConnection = import('@ethersproject/providers')
      .then(({ JsonRpcProvider }) => JsonRpcProvider)
      .then((JsonRpcProvider) => {
        const provider = new JsonRpcProvider(this.url);
        const privateKey = Wallet.fromMnemonic(
          ENV.ethWalletMnemonic,
          `m/44'/60'/0'/0/0`
        ).privateKey;
        const signer = new Wallet(privateKey, provider);
        this.provider = new CustomizedBridge(signer, provider);
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
      this.actions.reportError(error as Error);
    }
  }
}
