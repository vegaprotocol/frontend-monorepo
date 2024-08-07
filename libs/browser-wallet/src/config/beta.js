import * as networks from './well-known-networks.js';

const testnet = {
  title: 'Vega Wallet - Beta',
  isTest: false,
  defaultNetworkId: networks.fairground.id,
  defaultChainId: networks.fairground.chainId,
  networks: [
    networks.mainnet,
    networks.fairground,
    networks.devnet,
    networks.stagnet1,
    networks.mirror,
    networks.validatorTestnet,
  ],
  feedbackLink: 'https://github.com/vegaprotocol/feedback/discussions',
  encryptionSettings: undefined,
  closeWindowOnPopupOpen: true,
  userDataPolicy: 'https://vega.xyz/vega-wallet-user-data-policy/',
  sentryDsn:
    'https://7f7577b2eefe43a58dc25d2eda9b1a74@o286262.ingest.sentry.io/4505199579758592',
  logging: false,
  features: {
    popoutHeader: true,
  },
  manifestReplacements: {
    buildName: 'Beta',
    geckoId: 'browser-extension@vega.xyz',
    iconPrefix: 'Beta',
  },
  autoOpenOnInstall: true,
};

export default testnet;
