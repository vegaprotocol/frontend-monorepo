export interface PubKey {
  type: string;
  value: string;
}

export interface Validator {
  address: string;
  pub_key: PubKey;
  voting_power: string;
  proposer_priority: string;
}

export interface Result {
  block_height: string;
  validators: Validator[];
  count: string;
  total: string;
}

export interface TendermintValidatorsResponse {
  jsonrpc: string;
  id: number;
  result: Result;
}
