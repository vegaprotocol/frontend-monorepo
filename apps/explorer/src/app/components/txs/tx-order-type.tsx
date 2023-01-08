import { t } from '@vegaprotocol/react-helpers';
import type { components } from '../../../types/explorer';

interface TxOrderTypeProps {
  orderType: string;
  command?: components['schemas']['v1InputData'];
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
  Withdraw: 'Withdraw Request',
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

/**
 * Given a proposal, will return a specific label
 * @param chainEvent
 * @returns
 */
export function getLabelForProposal(
  proposal: components['schemas']['v1ProposalSubmission']
): string {
  if (proposal.terms?.newAsset) {
    return t('Proposal: New asset');
  } else if (proposal.terms?.updateAsset) {
    return t('Proposal: Update asset');
  } else if (proposal.terms?.newMarket) {
    return t('Proposal: New market');
  } else if (proposal.terms?.updateMarket) {
    return t('Proposal: Update market');
  } else if (proposal.terms?.updateNetworkParameter) {
    return t('Proposal: Network parameter');
  } else if (proposal.terms?.newFreeform) {
    return t('Proposal: Freeform');
  } else {
    return t('Proposal');
  }
}

/**
 * Given a chain event, will try to provide a more useful label
 * @param chainEvent
 * @returns
 */
export function getLabelForChainEvent(
  chainEvent: components['schemas']['v1ChainEvent']
): string {
  if (chainEvent.builtin) {
    if (chainEvent.builtin.deposit) {
      return t('Built-in deposit');
    } else if (chainEvent.builtin.withdrawal) {
      return t('Built-in withdraw');
    }
    return t('Built-in event');
  } else if (chainEvent.erc20) {
    if (chainEvent.erc20.assetDelist) {
      return t('ERC20 delist');
    } else if (chainEvent.erc20.assetList) {
      return t('ERC20 list');
    } else if (chainEvent.erc20.bridgeResumed) {
      return t('Bridge resume');
    } else if (chainEvent.erc20.bridgeStopped) {
      return t('Bridge pause');
    } else if (chainEvent.erc20.deposit) {
      return t('ERC20 deposit');
    } else if (chainEvent.erc20.withdrawal) {
      return t('ERC20 withdraw');
    }
    return t('ERC20 event');
  } else if (chainEvent.stakingEvent) {
    if (chainEvent.stakingEvent.stakeDeposited) {
      return t('Stake add');
    } else if (chainEvent.stakingEvent.stakeRemoved) {
      return t('Stake remove');
    }
    return t('Staking event');
  } else if (chainEvent.erc20Multisig) {
    if (chainEvent.erc20Multisig.signerAdded) {
      return t('Signer added');
    } else if (chainEvent.erc20Multisig.signerRemoved) {
      return t('Signer remove');
    } else if (chainEvent.erc20Multisig.thresholdSet) {
      return t('Signer threshold');
    }
    return t('Multisig update');
  }
  return t('Chain Event');
}

/**
 * Actually it's a transaction type, rather than an order type - this just
 * hasn't been refactored yet.
 *
 * There's no logic to the colours used -
 * - Chain events are white text on pink background
 * - Proposals are black text on yellow background
 *
 * Both of these were opted as they're easy to pick out when scrolling
 * the infinite transaction list
 *
 * The multiple paths on this one are different types from the old chain
 * explorer and the new one. When there are no longer two different APIs
 * in use, these should be consistent. For now, the view on a block page
 * can have a different label to the transaction list - but the colours
 * are consistent.
 */
export const TxOrderType = ({ orderType, command }: TxOrderTypeProps) => {
  let type = displayString[orderType] || orderType;

  let colours = 'text-white dark:text-white bg-zinc-800 dark:bg-zinc-800';

  // This will get unwieldy and should probably produce a different colour of tag
  if (type === 'Chain Event' && !!command?.chainEvent) {
    type = getLabelForChainEvent(command.chainEvent);
    colours = 'text-white dark-text-white bg-vega-pink dark:bg-vega-pink';
  } else if (type === 'Proposal' || type === 'Governance Proposal') {
    if (command && !!command.proposalSubmission) {
      type = getLabelForProposal(command.proposalSubmission);
    }
    colours = 'text-black bg-vega-yellow';
  }

  if (type === 'Vote on Proposal' || type === 'Vote Submission') {
    colours = 'text-black bg-vega-yellow';
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
