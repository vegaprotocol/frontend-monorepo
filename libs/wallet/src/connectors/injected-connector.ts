import type { VegaConnector } from './vega-connector';

/**
 * Dummy injected connector that we may use when browser wallet is implemented
 */
export class InjectedConnector implements VegaConnector {
  description = 'Connects using the Vega wallet browser extension';

  async connect() {
    return ['0x123'];
  }

  async disconnect() {
    return;
  }

  // @ts-ignore injected connector is not implemented
  sendTx() {
    throw new Error('Not implemented');
  }
}
