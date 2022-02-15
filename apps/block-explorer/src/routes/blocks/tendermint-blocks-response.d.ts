export interface Parts {
  total: number;
  hash: string;
}

export interface BlockId {
  hash: string;
  parts: Parts;
}

export interface Version {
  block: string;
}

export interface Header {
  version: Version;
  chain_id: string;
  height: string;
  time: string;
  last_block_id: BlockId;
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

export interface Data {
  txs: string[];
}

export interface Evidence {
  evidence: any[];
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
  data: Data;
  evidence: Evidence;
  last_commit: LastCommit;
}

export interface Result {
  block_id: BlockId;
  block: Block;
}

export interface TendermintBlocksResponse {
  jsonrpc: string;
  id: number;
  result: Result;
}
