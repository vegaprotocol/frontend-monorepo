import { VegaConnector } from '.';

/**
 * Dummy injected connector that we may use when browser wallet is implemented
 */
export class InjectedConnector implements VegaConnector {
  description = 'Connects using the Vega wallet browser extension';

  async connect() {
    return [
      {
        index: 9,
        pub: '0x123',
        algorithm: { name: 'algo', version: 2 },
        tainted: false,
        meta: [],
      },
    ];
  }

  async disconnect() {
    return;
  }
}
