import * as networks from './well-known-networks.js';
const mainnet = {
  isTest: false,
  title: 'Vega Wallet',
  defaultNetworkId: networks.mainnet.id,
  defaultChainId: networks.mainnet.chainId,
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
  sentryDsn:
    'https://7f7577b2eefe43a58dc25d2eda9b1a74@o286262.ingest.sentry.io/4505199579758592',
  userDataPolicy: 'https://vega.xyz/vega-wallet-user-data-policy/',
  logging: false,
  manifestReplacements: {
    buildName: 'Mainstream',
    geckoId: 'browser-extension-mainnet@vega.xyz',
    iconPrefix: 'Mainnet',
  },
  features: {
    popoutHeader: true,
  },
  autoOpenOnInstall: true,
};

export default mainnet;
