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
import type { DialogProps } from '@vegaprotocol/wallet';

interface VoteButtonsContainerProps {
  voteState: VoteState | null;
  voteDatetime: Date | null;
  proposalId: string | null;
  proposalState: ProposalState;
  minVoterBalance: string | null | undefined;
  spamProtectionMinTokens: string | null | undefined;
  submit: (voteValue: VoteValue, proposalId: string | null) => Promise<void>;
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

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <VoteButtons
        {...props}
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
            <span
              className={
                voteState === VoteState.Yes ? 'text-success' : 'text-danger'
              }
            >
              {t(`voteState_${voteState}`)}
            </span>{' '}
            {voteDatetime ? (
              <span>{format(voteDatetime, DATE_FORMAT_LONG)}. </span>
            ) : null}
            {proposalVotable ? (
              <ButtonLink
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
      <VoteTransactionDialog voteState={voteState} TransactionDialog={Dialog} />
    </>
  );
};
