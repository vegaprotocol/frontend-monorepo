export interface Attribute {
  key: string;
  value: string;
  index: boolean;
}

export interface Event {
  type: string;
  attributes: Attribute[];
}

export interface TxResult {
  code: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  log: string;
  info: string;
  gas_wanted: string;
  gas_used: string;
  events: Event[];
  codespace: string;
}

export interface Result {
  hash: string;
  height: string;
  index: number;
  tx_result: TxResult;
  tx: string;
}

export interface TendermintTransactionResponse {
  jsonrpc: string;
  id: number;
  result: Result;
}
