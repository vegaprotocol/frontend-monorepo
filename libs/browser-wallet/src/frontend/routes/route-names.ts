export const ROUTE_NAMES = {
  auth: 'auth',
  onboarding: 'onboarding',
  connections: 'connections',
  login: 'login',
  settings: 'settings',
  wallets: 'wallets',
  transactions: 'transactions',
  createPassword: 'create-password',
  saveMnemonic: 'save-mnemonic',
  // telemetry: 'telemetry',
  createWallet: 'create-wallet',
  getStarted: 'get-started',
  importWallet: 'import-wallet',
  networks: 'networks',
};

export const ROUTES = {
  home: '/',
  auth: `/${ROUTE_NAMES.auth}`,

  login: `/${ROUTE_NAMES.login}`,

  onboarding: `/${ROUTE_NAMES.onboarding}`,
  getStarted: ROUTE_NAMES.getStarted,
  createPassword: ROUTE_NAMES.createPassword,
  saveMnemonic: ROUTE_NAMES.saveMnemonic,
  // telemetry: ROUTE_NAMES.telemetry,
  createWallet: ROUTE_NAMES.createWallet,
  importWallet: ROUTE_NAMES.importWallet,
  networkDetails: ROUTE_NAMES.networks,
  settings: ROUTE_NAMES.settings,
  networksSettings: ROUTE_NAMES.networks,
  wallets: ROUTE_NAMES.wallets,
  transactions: ROUTE_NAMES.transactions,
  connections: ROUTE_NAMES.connections,
};

export const FULL_ROUTES = {
  home: '/',

  onboarding: `/${ROUTE_NAMES.onboarding}`,
  getStarted: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.getStarted}`,
  createPassword: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.createPassword}`,
  saveMnemonic: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.saveMnemonic}`,
  // telemetry: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.telemetry}`,
  createWallet: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.createWallet}`,
  importWallet: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.importWallet}`,

  login: `/${ROUTE_NAMES.login}`,

  auth: `/${ROUTE_NAMES.auth}`,
  wallets: `/${ROUTE_NAMES.auth}/${ROUTE_NAMES.wallets}`,
  connections: `/${ROUTE_NAMES.auth}/${ROUTE_NAMES.connections}`,
  settings: `/${ROUTE_NAMES.auth}/${ROUTE_NAMES.settings}`,
  networksSettings: `/${ROUTE_NAMES.auth}/${ROUTE_NAMES.settings}/${ROUTE_NAMES.networks}`,
  transactions: `/${ROUTE_NAMES.auth}/${ROUTE_NAMES.transactions}`,
};
