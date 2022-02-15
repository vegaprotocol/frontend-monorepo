export interface ChainExplorerTxResponse {
  Type: string;
  Command: string;
  Sig: string;
  PubKey: string;
  Nonce: number;
  TxHash: string;
}
