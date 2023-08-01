export type TendermintBlockResponse = {
  jsonrpc: string;
  id: number;
  result: {
    block_id: Id;
    block: Block;
  };
};

type Id = {
  hash: string;
  parts: {
    total: number;
    hash: string;
  };
};

type Header = {
  version: {
    block: string;
  };
  chain_id: string;
  height: string;
  time: string;
  last_block_id: Id;
  last_commit_hash: string;
  data_hash: string;
  validators_hash: string;
  next_validators_hash: string;
  consensus_hash: string;
  app_hash: string;
  last_results_hash: string;
  evidence_hash: string;
  proposer_address: string;
};

type Block = {
  header: Header;
  data: {
    txs: string[];
  };
  evidence: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evidence: any[];
  };
  last_commit: {
    height: string;
    round: number;
    block_id: Id;
    signatures: {
      block_id_flag: number;
      validator_address: string;
      timestamp: string;
      signature: string;
    }[];
  };
};
