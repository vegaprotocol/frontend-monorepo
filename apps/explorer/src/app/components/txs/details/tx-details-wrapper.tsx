import { useMemo } from 'react';
import { DATA_SOURCES } from '../../../config';
import { t } from '@vegaprotocol/i18n';
import { useFetch } from '@vegaprotocol/react-helpers';
import { TxDetailsOrder } from './tx-order';
import { type BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { type TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsHeartbeat } from './tx-hearbeat';
import { TxDetailsGeneric } from './tx-generic';
import { TxDetailsBatch } from './tx-batch';
import { TxDetailsChainEvent } from './tx-chain-event';
import { TxDetailsNodeVote } from './tx-node-vote';
import { TxDetailsOrderCancel } from './tx-order-cancel';
import { TxDetailsStopOrderCancel } from './tx-stop-order-cancel';
import { TxDetailsOrderAmend } from './tx-order-amend';
import { TxDetailsWithdrawSubmission } from './tx-withdraw-submission';
import { TxDetailsDelegate } from './tx-delegation';
import { TxDetailsUndelegate } from './tx-undelegation';
import { TxDetailsLiquidityAmendment } from './tx-liquidity-amend';
import { TxDetailsLiquidityCancellation } from './tx-liquidity-cancel';
import { TxDetailsDataSubmission } from './tx-data-submission';
import { TxProposalVote } from './tx-proposal-vote';
import { TxDetailsProtocolUpgrade } from './tx-details-protocol-upgrade';
import { TxDetailsIssueSignatures } from './tx-issue-signatures';
import { TxDetailsNodeAnnounce } from './tx-node-announce';
import { TxDetailsStateVariable } from './tx-state-variable-proposal';
import { TxProposal } from './tx-proposal';
import { TxDetailsTransfer } from './tx-transfer';
import { TxDetailsStopOrderSubmission } from './tx-stop-order-submission';
import { TxDetailsLiquiditySubmission } from './tx-liquidity-submission';
import { TxDetailsCreateReferralSet } from './tx-create-referral-set';
import { TxDetailsApplyReferralCode } from './tx-apply-referral-code';
import { TxDetailsUpdateReferralSet } from './tx-update-referral-set';
import { TxDetailsJoinTeam } from './tx-join-team';
import { TxDetailsUpdateMarginMode } from './tx-update-margin-mode';
import { TxBatchProposal } from './tx-batch-proposal';
import { TxDetailsUpdatePartyProfile } from './proposal/tx-update-party-profile';
import { TxDetailsAMMCancel } from './tx-amm-cancel';
import { TxDetailsAMMSubmit } from './tx-amm-submit';
import { TxDetailsAMMAmend } from './tx-amm-amend';

interface TxDetailsWrapperProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  height: string;
}

export const TxDetailsWrapper = ({
  txData,
  pubKey,
  height,
}: TxDetailsWrapperProps) => {
  const {
    state: { data: blockData },
  } = useFetch<TendermintBlocksResponse>(
    `${DATA_SOURCES.tendermintUrl}/block?height=${height}`,
    { cache: 'force-cache' }
  );

  const child = useMemo(() => getTransactionComponent(txData), [txData]);

  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <div key={`txd-${txData.hash}`}>
      <section>{child({ txData, pubKey, blockData })}</section>
    </div>
  );
};

/**
 * Chooses the appropriate component to render the full details of a transaction.
 * The generic view that is default here displays as much detail as it can in a
 * detail table at the top of the page.
 *
 * @param txData
 * @returns JSX.Element
 */
function getTransactionComponent(txData?: BlockExplorerTransactionResult) {
  if (!txData) {
    return TxDetailsGeneric;
  }

  // These come from https://github.com/vegaprotocol/vega/blob/develop/core/txn/command.go#L72-L98
  switch (txData.type) {
    case 'Register new Node':
      return TxDetailsNodeAnnounce;
    case 'Issue Signatures':
      return TxDetailsIssueSignatures;
    case 'Submit Order':
      return TxDetailsOrder;
    case 'Submit Oracle Data':
      return TxDetailsDataSubmission;
    case 'Protocol Upgrade':
      return TxDetailsProtocolUpgrade;
    case 'Cancel Order':
      return TxDetailsOrderCancel;
    case 'Stop Orders Cancellation':
      return TxDetailsStopOrderCancel;
    case 'Amend Order':
      return TxDetailsOrderAmend;
    case 'Validator Heartbeat':
      return TxDetailsHeartbeat;
    case 'Proposal':
      return TxProposal;
    case 'Vote on Proposal':
      return TxProposalVote;
    case 'Batch Market Instructions':
      return TxDetailsBatch;
    case 'Chain Event':
      return TxDetailsChainEvent;
    case 'Node Vote':
      return TxDetailsNodeVote;
    case 'Withdraw':
      return TxDetailsWithdrawSubmission;
    case 'Liquidity Provision Order':
      return TxDetailsLiquiditySubmission;
    case 'Amend Liquidity Provision Order':
      return TxDetailsLiquidityAmendment;
    case 'Cancel LiquidityProvision Order':
      return TxDetailsLiquidityCancellation;
    case 'Delegate':
      return TxDetailsDelegate;
    case 'Undelegate':
      return TxDetailsUndelegate;
    case 'State Variable Proposal':
      return TxDetailsStateVariable;
    case 'Stop Orders Submission':
      return TxDetailsStopOrderSubmission;
    case 'Transfer Funds':
      return TxDetailsTransfer;
    case 'Create Referral Set':
      return TxDetailsCreateReferralSet;
    case 'Update Referral Set':
      return TxDetailsUpdateReferralSet;
    case 'Apply Referral Code':
      return TxDetailsApplyReferralCode;
    case 'Join Team':
      return TxDetailsJoinTeam;
    case 'Update Margin Mode':
      return TxDetailsUpdateMarginMode;
    case 'Batch Proposal':
      return TxBatchProposal;
    case 'Update Party Profile':
      return TxDetailsUpdatePartyProfile;
    case 'Cancel AMM':
      return TxDetailsAMMCancel;
    case 'Submit AMM':
      return TxDetailsAMMSubmit;
    case 'Amend AMM':
      return TxDetailsAMMAmend;
    default:
      return TxDetailsGeneric;
  }
}
