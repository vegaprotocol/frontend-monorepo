export const ROUTE_NAMES = {
  auth: 'auth',
  onboarding: 'onboarding',
  login: 'login',
  settings: 'settings',
  wallets: 'wallets',
  transactions: 'transactions',
  createPassword: 'create-password',
  saveMnemonic: 'save-mnemonic',
  createWallet: 'create-wallet',
  importWallet: 'import-wallet',
  networks: 'networks',
};

export const ROUTES = {
  home: '/',
  auth: `/${ROUTE_NAMES.auth}`,

  login: `/${ROUTE_NAMES.login}`,

  onboarding: `/${ROUTE_NAMES.onboarding}`,
  createPassword: ROUTE_NAMES.createPassword,
  saveMnemonic: ROUTE_NAMES.saveMnemonic,
  createWallet: ROUTE_NAMES.createWallet,
  importWallet: ROUTE_NAMES.importWallet,
  settings: ROUTE_NAMES.settings,
  networksSettings: ROUTE_NAMES.networks,
  wallets: ROUTE_NAMES.wallets,
  transactions: ROUTE_NAMES.transactions,
};

export const FULL_ROUTES = {
  home: '/',

  onboarding: `/${ROUTE_NAMES.onboarding}`,
  createPassword: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.createPassword}`,
  saveMnemonic: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.saveMnemonic}`,
  createWallet: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.createWallet}`,
  importWallet: `/${ROUTE_NAMES.onboarding}/${ROUTE_NAMES.importWallet}`,

  login: `/${ROUTE_NAMES.login}`,

  auth: `/${ROUTE_NAMES.auth}`,
  wallets: `/${ROUTE_NAMES.auth}/${ROUTE_NAMES.wallets}`,
  settings: `/${ROUTE_NAMES.auth}/${ROUTE_NAMES.settings}`,
  networksSettings: `/${ROUTE_NAMES.auth}/${ROUTE_NAMES.settings}/${ROUTE_NAMES.networks}`,
  transactions: `/${ROUTE_NAMES.auth}/${ROUTE_NAMES.transactions}`,
};
