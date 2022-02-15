export interface Version {
  block: string;
}

export interface Parts {
  total: number;
  hash: string;
}

export interface LastBlockId {
  hash: string;
  parts: Parts;
}

export interface Header {
  version: Version;
  chain_id: string;
  height: string;
  time: string;
  last_block_id: LastBlockId;
  last_commit_hash: string;
  data_hash: string;
  validators_hash: string;
  next_validators_hash: string;
  consensus_hash: string;
  app_hash: string;
  last_results_hash: string;
  evidence_hash: string;
  proposer_address: string;
}

export interface TransactionData {
  txs: string[];
}

export interface Evidence {
  evidence: any[];
}

export interface BlockId {
  hash: string;
  parts: Parts;
}

export interface Signature {
  block_id_flag: number;
  validator_address: string;
  timestamp: string;
  signature: string;
}

export interface LastCommit {
  height: string;
  round: number;
  block_id: BlockId;
  signatures: Signature[];
}

export interface Block {
  header: Header;
  data: TransactionData;
  evidence: Evidence;
  last_commit: LastCommit;
}

export interface ResultBeginBlock {}

export interface ResultEndBlock {
  validator_updates?: any;
}

export interface Value {
  block: Block;
  result_begin_block: ResultBeginBlock;
  result_end_block: ResultEndBlock;
}

export interface Data {
  type: string;
  value: Value;
}

export interface Events {
  "tm.event": string[];
}

export interface Result {
  query: string;
  data: Data;
  events: Events;
}

export interface NewBlockMessage {
  jsonrpc: string;
  id: string;
  result: Result;
}
