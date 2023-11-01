import type { components } from '../../../types/explorer';
import type { UnknownObject } from '../../components/nested-data-list';

export interface BlockExplorerTransactionResult {
  block: string;
  index: number;
  hash: string;
  submitter: string;
  type: string;
  code: number;
  cursor: string;
  command: components['schemas']['blockexplorerv1transaction'];
  signature: {
    value: string;
  };
  error?: string;
  // These aren't strictly optional but are new in 0.73.0 so we need to make them optional
  createdAt?: string;
  version?: string;
  pow?: string;
}

export interface BlockExplorerTransactions {
  transactions: BlockExplorerTransactionResult[];
}

export interface BlockExplorerTransaction {
  transaction: BlockExplorerTransactionResult;
}

export interface ValidatorHeartbeat {
  blockHeight: string;
  nonce: string;
  validatorHeartbeat: {
    nodeId: string;
    ethereumSignature: ValidatorHeartbeatSignature;
    vegaSignature: ValidatorHeartbeatSignature;
  };
}

export interface ValidatorHeartbeatSignature {
  algo: string;
  value: string;
  version: number;
}

export interface SubmitOrder {
  orderSubmission: {
    marketId: string;
  };
}

export interface StateVariableProposal {
  proposal: {
    stateVarId: string;
    eventId: string;
    kvb: StateVariableProposalValues[];
  };
}

export interface StateVariableProposalValues {
  key: 'up' | 'down';
  tolerance: string;
  value: UnknownObject;
}

export interface AmendLiquidityProvisionOrder {
  blockHeight: string;
  nonce: string;
  liquidityProvisionAmendment: {
    marketId: string;
    commitmentAmount: string;
    fee: string;
    sells: LiquidityProvisionOrderChange[];
    buys: LiquidityProvisionOrderChange[];
    reference: string;
  };
}

export interface LiquidityProvisionOrderChange {
  string: Reference;
  proportion: number;
  offset: string;
}

export interface BatchMarketInstructions {
  blockHeight: string;
  nonce: string;
  batchMarketInstructions: {
    amendments: BatchInstruction[];
    submissions: BatchInstruction[];
    cancellations: BatchCancellationInstruction[];
  };
}

export interface BatchInstruction {
  orderId: string;
  marketId: string;
}

export interface BatchCancellationInstruction {
  orderId: string;
  marketId: string;
}

export interface ChainEvent {
  blockHeight: string;
  nonce: string;
  chainEvent: components['schemas']['v1ChainEvent'];
}

export interface ChainEventErc20Multisig {
  erc20Multisig: {
    block: string;
    index: string;
  };
}

export interface ChainEventErc20Deposit {
  erc20: {
    deposit: {
      vegaAssetId: string;
      sourceEthereumAddress: string;
      targetPartyId: string;
      amount: string;
    };
  };
}
