export interface Result {
  n_txs: string;
  total: string;
  total_bytes: string;
  txs: string[];
}

export interface TendermintUnconfirmedTransactionsResponse {
  jsonrpc: string;
  id: number;
  result: Result;
}
