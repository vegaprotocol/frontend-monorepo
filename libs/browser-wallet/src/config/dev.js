import testnet from './beta.js';

const dev = {
  ...testnet,
  isTest: false,
  logging: true,
  sentryDsn: undefined,
  autoOpenOnInstall: true,
};

export default dev;
