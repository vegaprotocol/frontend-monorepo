export interface BlockExplorerTransaction {
  block: string;
  index: number;
  hash: string;
  submitter: string;
  type: string;
  code: number;
  cursor: string;
  command: Record<string, unknown>;
}

export interface BlockExplorerTransactions {
  transactions: BlockExplorerTransaction[];
}
