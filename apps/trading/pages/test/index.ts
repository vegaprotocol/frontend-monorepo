export enum JsonRpcMethod {
  ConnectWallet = 'client.connect_wallet',
  DisconnectWallet = 'client.disconnect_wallet',
  ListKeys = 'client.list_keys',
  SignTransaction = 'client.sign_transaction',
  SendTransaction = 'client.send_transaction',
  GetChainId = 'client.get_chain_id',
}

export interface IWalletError {
  error: string;
}

export interface Connector {
  id: string;

  connectWallet(chainId: string): Promise<{ success: boolean } | IWalletError>;
  disconnectWallet(): Promise<{ success: boolean } | IWalletError>;
  getChainId(): Promise<{ chainId: string } | IWalletError>;
  listKeys(): Promise<
    Array<{ publicKey: string; name: string }> | IWalletError
  >;
  isConnected(): Promise<{ connected: boolean } | IWalletError>;
  // sendTransaction(...args: any[]): Promise<{ txHash: string }>;

  on(event: string, callback: () => void): void;
  off(event: string, callback: () => void): void;
}
