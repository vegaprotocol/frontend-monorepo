import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import {
  AsyncRenderer,
  Button,
  ButtonLink,
  ExternalLink,
} from '@vegaprotocol/ui-toolkit';
import { addDecimal, toBigNum } from '@vegaprotocol/utils';
import { ProposalState, VoteValue } from '@vegaprotocol/types';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../../lib/bignumber';
import { DATE_FORMAT_LONG } from '../../../../lib/date-formats';
import { VoteState } from './use-user-vote';
import { ProposalMinRequirements, ProposalUserAction } from '../shared';
import { VoteTransactionDialog } from './vote-transaction-dialog';
import { useVoteButtonsQuery } from './__generated__/Stake';
import type { DialogProps, VegaTxState } from '@vegaprotocol/proposals';
import { filterAcceptableGraphqlErrors } from '../../../../lib/party';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { type ProposalChangeType } from '../../types';

interface VoteButtonsContainerProps {
  changeType: ProposalChangeType;
  voteState: VoteState | null;
  voteDatetime: Date | null;
  proposalId: string | null;
  proposalState: ProposalState;
  submit: (voteValue: VoteValue, proposalId: string | null) => Promise<void>;
  transaction: VegaTxState | null;
  dialog: (props: DialogProps) => JSX.Element;
  className?: string;
}

export const VoteButtonsContainer = (props: VoteButtonsContainerProps) => {
  const { pubKey } = useVegaWallet();

  const {
    appState: { decimals },
  } = useAppState();

  const { data, loading, error } = useVoteButtonsQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const { params: networkParams } = useNetworkParams([
    NetworkParams.governance_proposal_market_minVoterBalance,
    NetworkParams.governance_proposal_updateMarket_minVoterBalance,
    NetworkParams.governance_proposal_asset_minVoterBalance,
    NetworkParams.governance_proposal_updateAsset_minVoterBalance,
    NetworkParams.governance_proposal_updateNetParam_minVoterBalance,
    NetworkParams.governance_proposal_freeform_minVoterBalance,
    NetworkParams.governance_proposal_referralProgram_minVoterBalance,
    NetworkParams.governance_proposal_VolumeDiscountProgram_minVoterBalance,
    NetworkParams.spam_protection_voting_min_tokens,
    NetworkParams.governance_proposal_market_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajorityLP,
    NetworkParams.governance_proposal_asset_requiredMajority,
    NetworkParams.governance_proposal_updateAsset_requiredMajority,
    NetworkParams.governance_proposal_updateNetParam_requiredMajority,
    NetworkParams.governance_proposal_freeform_requiredMajority,
    NetworkParams.governance_proposal_referralProgram_requiredMajority,
    NetworkParams.governance_proposal_VolumeDiscountProgram_requiredMajority,
  ]);

  let minVoterBalance = null;

  if (networkParams) {
    switch (props.changeType) {
      case 'UpdateMarket':
      case 'UpdateMarketState':
        minVoterBalance =
          networkParams.governance_proposal_updateMarket_minVoterBalance;
        break;
      case 'NewMarket':
        minVoterBalance =
          networkParams.governance_proposal_market_minVoterBalance;
        break;
      case 'NewAsset':
        minVoterBalance =
          networkParams.governance_proposal_asset_minVoterBalance;
        break;
      case 'UpdateAsset':
        minVoterBalance =
          networkParams.governance_proposal_updateAsset_minVoterBalance;
        break;
      case 'UpdateNetworkParameter':
        minVoterBalance =
          networkParams.governance_proposal_updateNetParam_minVoterBalance;
        break;
      case 'NewFreeform':
        minVoterBalance =
          networkParams.governance_proposal_freeform_minVoterBalance;
        break;
      case 'NewTransfer':
        // TODO: check minVoterBalance for 'NewTransfer'
        minVoterBalance =
          networkParams.governance_proposal_freeform_minVoterBalance;
        break;
      case 'CancelTransfer':
        // TODO: check minVoterBalance for 'CancelTransfer'
        minVoterBalance =
          networkParams.governance_proposal_freeform_minVoterBalance;
        break;
      case 'UpdateReferralProgram':
        minVoterBalance =
          networkParams.governance_proposal_referralProgram_minVoterBalance;
        break;
      case 'UpdateVolumeDiscountProgram':
        minVoterBalance =
          networkParams.governance_proposal_VolumeDiscountProgram_minVoterBalance;
        break;
    }
  }

  const filteredErrors = filterAcceptableGraphqlErrors(error);

  return (
    <AsyncRenderer loading={loading} error={filteredErrors} data={data}>
      <VoteButtons
        {...props}
        minVoterBalance={minVoterBalance}
        spamProtectionMinTokens={
          networkParams.spam_protection_voting_min_tokens
        }
        currentStakeAvailable={toBigNum(
          data?.party?.stakingSummary.currentStakeAvailable || 0,
          decimals
        )}
      />
    </AsyncRenderer>
  );
};

interface VoteButtonsProps extends VoteButtonsContainerProps {
  currentStakeAvailable: BigNumber;
  minVoterBalance: string | null;
  spamProtectionMinTokens: string | null;
}

export const VoteButtons = ({
  voteState,
  voteDatetime,
  proposalState,
  proposalId,
  currentStakeAvailable,
  minVoterBalance,
  spamProtectionMinTokens,
  submit,
  transaction,
  dialog: Dialog,
}: VoteButtonsProps) => {
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  const [changeVote, setChangeVote] = React.useState(false);
  const proposalVotable = useMemo(
    () =>
      [
        ProposalState.STATE_OPEN,
        ProposalState.STATE_WAITING_FOR_NODE_VOTE,
      ].includes(proposalState),
    [proposalState]
  );

  const cantVoteUI = React.useMemo(() => {
    if (!proposalVotable) {
      return t('votingEnded');
    }

    if (!pubKey) {
      return (
        <div data-testid="connect-wallet">
          <ButtonLink
            onClick={() => {
              openVegaWalletDialog();
            }}
          >
            {t('connectVegaWallet')}
          </ButtonLink>{' '}
          {t('toVote')}
        </div>
      );
    }

    if (minVoterBalance && spamProtectionMinTokens) {
      const formattedMinVoterBalance = new BigNumber(
        addDecimal(minVoterBalance, 18)
      );
      const formattedSpamProtectionMinTokens = new BigNumber(
        addDecimal(spamProtectionMinTokens, 18)
      );

      if (
        currentStakeAvailable.isLessThan(formattedMinVoterBalance) ||
        currentStakeAvailable.isLessThan(formattedSpamProtectionMinTokens)
      ) {
        return (
          <ProposalMinRequirements
            minProposalBalance={minVoterBalance}
            spamProtectionMin={spamProtectionMinTokens}
            userAction={ProposalUserAction.VOTE}
          />
        );
      }
    }

    return false;
  }, [
    proposalVotable,
    pubKey,
    currentStakeAvailable,
    minVoterBalance,
    spamProtectionMinTokens,
    t,
    openVegaWalletDialog,
  ]);

  function submitVote(vote: VoteValue) {
    setChangeVote(false);
    submit(vote, proposalId);
  }

  // Should only render null for a split second while initial vote state
  // null is set to either Yes, No or NotCast
  if (!voteState) {
    return null;
  }

  if (cantVoteUI) {
    return <div>{cantVoteUI}</div>;
  }

  return (
    <>
      {changeVote || (voteState === VoteState.NotCast && proposalVotable) ? (
        <>
          {currentStakeAvailable.isLessThanOrEqualTo(0) && (
            <>
              <p data-testid="no-stake-available">{t('noGovernanceTokens')}.</p>
              <ExternalLink href="https://blog.vega.xyz/how-to-vote-on-vega-2195d1e52ec5">
                {t('findOutMoreAboutHowToVote')}
              </ExternalLink>
            </>
          )}

          <div className="flex gap-4" data-testid="vote-buttons">
            <Button
              data-testid="vote-for"
              onClick={() => submitVote(VoteValue.VALUE_YES)}
              variant="primary"
              disabled={currentStakeAvailable.isLessThanOrEqualTo(0)}
            >
              {t('voteFor')}
            </Button>
            <Button
              data-testid="vote-against"
              onClick={() => submitVote(VoteValue.VALUE_NO)}
              variant="primary"
              disabled={currentStakeAvailable.isLessThanOrEqualTo(0)}
            >
              {t('voteAgainst')}
            </Button>
          </div>
        </>
      ) : (
        (voteState === VoteState.Yes || voteState === VoteState.No) && (
          <p data-testid="you-voted">
            <span>{t('youVoted')}:</span>{' '}
            <span className="mx-1 text-white font-bold uppercase">
              {t(`voteState_${voteState}`)}
            </span>{' '}
            {voteDatetime ? (
              <span>on {format(voteDatetime, DATE_FORMAT_LONG)}. </span>
            ) : null}
            {proposalVotable ? (
              <ButtonLink
                className="text-white"
                data-testid="change-vote-button"
                onClick={() => {
                  setChangeVote(true);
                  voteState = VoteState.NotCast;
                }}
              >
                {t('changeVote')}
              </ButtonLink>
            ) : null}
          </p>
        )
      )}
      <VoteTransactionDialog
        voteState={voteState}
        transaction={transaction}
        TransactionDialog={Dialog}
      />
    </>
  );
};
