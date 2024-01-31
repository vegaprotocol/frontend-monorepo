import { t } from '@vegaprotocol/i18n';
import type { components } from '../../../types/explorer';
import { VoteIcon } from '../vote-icon/vote-icon';

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
  'Submit Order': 'Order',
  OrderCancellation: 'Cancel order',
  OrderAmendment: 'Order Amendment',
  VoteSubmission: 'Vote Submission',
  WithdrawSubmission: 'Withdraw Submission',
  Withdraw: 'Withdraw Request',
  LiquidityProvisionSubmission: 'LP order',
  'Liquidity Provision Order': 'LP order',
  LiquidityProvisionCancellation: 'LP cancel',
  'Cancel LiquidityProvision Order': 'LP cancel',
  LiquidityProvisionAmendment: 'LP update',
  'Amend LiquidityProvision Order': 'Amend LP',
  ProposalSubmission: 'Governance Proposal',
  AnnounceNode: 'Node Announcement',
  NodeVote: 'Node Vote',
  NodeSignature: 'Node Signature',
  ChainEvent: 'Chain Event',
  OracleDataSubmission: 'Oracle Data',
  DelegateSubmission: 'Delegation',
  UndelegateSubmission: 'Undelegation',
  KeyRotateSubmission: 'Key Rotation',
  StateVariableProposal: 'State Variable',
  'State Variable Proposal': 'State Variable',
  Transfer: 'Transfer',
  CancelTransfer: 'Cancel Transfer',
  'Cancel Transfer Funds': 'Cancel Transfer',
  ValidatorHeartbeat: 'Heartbeat',
  'Validator Heartbeat': 'Heartbeat',
  'Batch Market Instructions': 'Batch',
  'Stop Orders Submission': 'Stop',
  StopOrdersSubmission: 'Stop',
  StopOrdersCancellation: 'Cancel stop',
  'Stop Orders Cancellation': 'Cancel stop',
  'Apply Referral Code': 'Referral',
  'Create Referral Set': 'Create referral',
};

export function getLabelForStopOrderType(
  orderType: string,
  command: components['schemas']['v1InputData']
): string {
  if (command.stopOrdersSubmission) {
    if (
      command.stopOrdersSubmission.risesAbove &&
      command.stopOrdersSubmission.fallsBelow
    ) {
      return 'Stop ⇅';
    } else if (command.stopOrdersSubmission.risesAbove) {
      return 'Stop ↗';
    } else if (command.stopOrdersSubmission.fallsBelow) {
      return 'Stop ↘';
    }
  }
  return 'Stop';
}

export function getLabelForOrderType(
  orderType: string,
  command: components['schemas']['v1InputData']
): string {
  if (command.orderSubmission) {
    if (command.orderSubmission.peggedOrder) {
      return 'Peg';
    }
    if (command.orderSubmission.icebergOpts) {
      return 'Iceberg';
    }
    if (command.orderSubmission.type === 'TYPE_MARKET') {
      return 'Market order';
    }
    if (command.orderSubmission.type === 'TYPE_LIMIT') {
      return 'Limit order';
    }
  }
  return 'Order';
}

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
    if (proposal.terms?.newMarket.changes?.successor) {
      return t('Proposal: Successor market');
    } else {
      return t('Proposal: New market');
    }
  } else if (proposal.terms?.updateMarket) {
    return t('Proposal: Update market');
  } else if (proposal.terms?.updateSpotMarket) {
    return t('Proposal: Update spot');
  } else if (proposal.terms?.updateMarketState) {
    const type = proposal.terms.updateMarketState.changes?.updateType;
    if (type === 'MARKET_STATE_UPDATE_TYPE_TERMINATE') {
      return t('Proposal: Market terminate');
    } else if (type === 'MARKET_STATE_UPDATE_TYPE_SUSPEND') {
      return t('Proposal: Market suspend');
    } else if (type === 'MARKET_STATE_UPDATE_TYPE_RESUME') {
      return t('Proposal: Market resume');
    }
    return t('Proposal: Market state');
  } else if (proposal.terms?.updateNetworkParameter) {
    return t('Proposal: Network parameter');
  } else if (proposal.terms?.updateReferralProgram) {
    return t('Proposal: Referral program');
  } else if (proposal.terms?.updateVolumeDiscountProgram) {
    return t('Proposal: Discount program');
  } else if (proposal.terms?.newFreeform) {
    return t('Proposal: Freeform');
  } else if (proposal.terms?.newTransfer) {
    return t('Proposal: Transfer');
  } else if (proposal.terms?.cancelTransfer) {
    return t('Proposal: Transfer cancel');
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
  } else if (chainEvent.contractCall) {
    return t('Contract call');
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

  let colours =
    'text-white dark:text-white bg-vega-dark-150 dark:bg-vega-dark-250';

  // This will get unwieldy and should probably produce a different colour of tag
  // Note that colours are currently arbitrary
  if (type === 'Chain Event' && !!command?.chainEvent) {
    type = getLabelForChainEvent(command.chainEvent);
    colours = 'text-white dark-text-white bg-vega-pink dark:bg-vega-pink';
  } else if (type === 'Validator Heartbeat') {
    colours =
      'text-white dark-text-white bg-vega-light-200 dark:bg-vega-dark-100';
  } else if (type === 'Proposal' || type === 'Governance Proposal') {
    if (command && !!command.proposalSubmission) {
      type = getLabelForProposal(command.proposalSubmission);
    }
    colours = 'text-black bg-vega-yellow';
  } else if (type === 'Order' && command) {
    type = getLabelForOrderType(orderType, command);
    colours = 'text-white dark-text-white bg-vega-blue dark:bg-vega-blue';
  } else if (type === 'Stop' && command) {
    type = getLabelForStopOrderType(orderType, command);
    colours = 'text-white dark-text-white bg-vega-blue dark:bg-vega-blue';
  }

  if (type === 'Vote on Proposal') {
    return (
      <VoteIcon
        vote={command?.voteSubmission?.value === 'VALUE_YES'}
        yesText="Proposal vote"
        noText="Proposal vote"
        useVoteColour={false}
      />
    );
  }

  if (type === 'Vote on Proposal' || type === 'Vote Submission') {
    colours = 'text-black bg-vega-yellow';
  }

  return (
    <div
      data-testid="tx-type"
      className={`text-sm rounded-md leading-tight px-2 inline-block whitespace-nowrap ${colours}`}
    >
      {type}
    </div>
  );
};
