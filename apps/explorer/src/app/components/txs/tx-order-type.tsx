import type { components } from '../../../types/explorer';

interface TxOrderTypeProps {
  orderType: string;
  command?: string;
  decodedCommand?: components['schemas']['v1InputData'];
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

export const TxOrderType = ({
  orderType,
  command,
  decodedCommand,
}: TxOrderTypeProps) => {
  let type = displayString[orderType] || orderType;

  let colours = 'text-white dark:text-white bg-zinc-800 dark:bg-zinc-800';

  // This will get unwieldy and should probably produce a different colour of tag
  if (type === 'Chain Event' && (!!command || !!decodedCommand)) {
    const cmd = decodedCommand ? decodedCommand : JSON.parse(command || '');
    colours =
      'text-white dark-text-white bg-vega-pink-dark dark:bg-vega-pink-dark';

    // The double check is due to decodedCommand being slightly different to command
    // Remove when we no longer use chainExplorer api
    if (cmd?.builtin || cmd?.chainEvent?.builtin) {
      if (cmd?.builtin?.deposit) {
        type = 'Built-in deposit';
      } else {
        type = 'Built-in event';
      }
    } else if (cmd?.erc20 || cmd?.chainEvent?.erc20) {
      type = 'ERC20 event';
    } else if (cmd?.stakingEvent || cmd?.chainEvent?.stakingEvent) {
      type = 'Staking event';
    } else if (cmd?.erc20Multisig) {
      type = 'Multisig update';
    }
  }
  return (
    <div
      data-testid="tx-type"
      className={`text-sm rounded-md leading-none px-2 py-2 inline-block ${colours}`}
    >
      {type}
    </div>
  );
};
