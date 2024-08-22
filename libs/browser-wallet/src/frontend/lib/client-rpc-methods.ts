export const RpcMethods = {
  // Wallets
  DeleteWallet: 'admin.delete_wallet',
  ListWallets: 'admin.list_wallets',
  ListKeys: 'admin.list_keys',
  GenerateKey: 'admin.generate_key',
  ExportKey: 'admin.export_key',
  ExportRecoveryPhrase: 'admin.export_recovery_phrase',
  RenameKey: 'admin.rename_key',
  CreateDerivedMnemonic: 'admin.create_derived_mnemonic',

  // Onboarding
  CreatePassphrase: 'admin.create_passphrase',
  GenerateRecoveryPhrase: 'admin.generate_recovery_phrase',
  ImportWallet: 'admin.import_wallet',
  AppGlobals: 'admin.app_globals',

  // Login
  Lock: 'admin.lock',
  Unlock: 'admin.unlock',

  // Connections
  ListConnections: 'admin.list_connections',
  ConnectionsChange: 'admin.connections_change',
  OpenPopout: 'admin.open_popout',
  UpdateSettings: 'admin.update_app_settings',
  RemoveConnection: 'admin.remove_connection',
  UpdateAutomaticConsent: 'admin.update_automatic_consent',

  // Networks
  ListNetworks: 'admin.list_networks',

  // Transaction
  ListTransactions: 'admin.list_transactions',

  // Misc
  SignMessage: 'admin.sign_message',
  Fetch: 'admin.fetch',

  // Transactions
  CheckTransaction: 'admin.check_transaction',
};
