import { Lozenge, Intent } from '@vegaprotocol/ui-toolkit';

interface TxOrderTypeProps {
  orderType: string;
  className?: string;
}

interface StringMap {
  [key: string]: string;
}

// Using https://github.com/vegaprotocol/protos/blob/e0f646ce39aab1fc66a9200ceec0262306d3beb3/commands/transaction.go#L93 as a reference
const displayString: StringMap = {
  OrderSubmission: 'Order Submission',
  OrderCancellation: 'Order Cancellation',
  OrderAmendment: 'Order Amendment',
  VoteSubmission: 'Vote Submission',
  WithdrawSubmission: 'Withdraw Submission',
  LiquidityProvisionSubmission: 'Liquidity Provision',
  LiquidityProvisionCancellation: 'Liquidity Cancellation',
  LiquidityProvisionAmendment: 'Liquidity Amendment',
  ProposalSubmission: 'Governance Proposal',
  AnnounceNode: 'Node Announcement',
  NodeVote: 'Node Vote',
  NodeSignature: 'Node Signature',
  ChainEvent: 'Chain Event',
  OracleDataSubmission: 'Oracle Data',
  DelegateSubmission: 'Delegation',
  UndelegateSubmission: 'Undelegation',
  KeyRotateSubmission: 'Key Rotation',
  StateVariableProposal: 'State Variable Proposal',
  Transfer: 'Transfer',
  CancelTransfer: 'Cancel Transfer',
  ValidatorHeartbeat: 'Validator Heartbeat',
};

export const TxOrderType = ({ orderType, className }: TxOrderTypeProps) => {
  return (
    <Lozenge data-testid="tx-type" variant={Intent.None} className={className}>
      {displayString[orderType] || orderType}
    </Lozenge>
  );
};
