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

export interface BlockMeta {
  block_id: BlockId;
  block_size: string;
  header: Header;
  num_txs: string;
}

export interface Result {
  last_height: string;
  block_metas: BlockMeta[];
}

export interface TendermintBlockchainResponse {
  jsonrpc: string;
  id: number;
  result: Result;
}
