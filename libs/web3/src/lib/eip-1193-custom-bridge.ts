import { Eip1193Bridge } from '@ethersproject/experimental';
import { ethers } from 'ethers';

export class Eip1193CustomBridge extends Eip1193Bridge {
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
      if (params && params.length && params[0].from && method === 'eth_call') {
        delete params[0].from;
      }
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
