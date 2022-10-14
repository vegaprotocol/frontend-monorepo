import { gql, useQuery } from '@apollo/client';
import { format } from 'date-fns';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../../lib/bignumber';
import { DATE_FORMAT_LONG } from '../../../../lib/date-formats';
import type {
  VoteButtonsQuery as VoteButtonsQueryResult,
  VoteButtonsQueryVariables,
} from './__generated__/VoteButtonsQuery';
import { VoteState } from './use-user-vote';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import {
  ProposalState,
  ProposalUserAction,
  VoteValue,
} from '@vegaprotocol/types';
import { AsyncRenderer, Button, ButtonLink } from '@vegaprotocol/ui-toolkit';
import { ProposalMinRequirements } from '../shared';
import { addDecimal } from '@vegaprotocol/react-helpers';

interface VoteButtonsContainerProps {
  voteState: VoteState | null;
  castVote: (vote: VoteValue) => void;
  voteDatetime: Date | null;
  proposalState: ProposalState;
  minVoterBalance: string | null;
  spamProtectionMinTokens: string | null;
  className?: string;
}

export const VOTE_BUTTONS_QUERY = gql`
  query VoteButtonsQuery($partyId: ID!) {
    party(id: $partyId) {
      id
      stake {
        currentStakeAvailable
        currentStakeAvailableFormatted @client
      }
    }
  }
`;

export const VoteButtonsContainer = (props: VoteButtonsContainerProps) => {
  const { pubKey } = useVegaWallet();
  const { data, loading, error } = useQuery<
    VoteButtonsQueryResult,
    VoteButtonsQueryVariables
  >(VOTE_BUTTONS_QUERY, {
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <VoteButtons
        {...props}
        currentStakeAvailable={
          new BigNumber(data?.party?.stake.currentStakeAvailableFormatted || 0)
        }
      />
    </AsyncRenderer>
  );
};

interface VoteButtonsProps extends VoteButtonsContainerProps {
  currentStakeAvailable: BigNumber;
}

export const VoteButtons = ({
  voteState,
  castVote,
  voteDatetime,
  proposalState,
  currentStakeAvailable,
  minVoterBalance,
  spamProtectionMinTokens,
}: VoteButtonsProps) => {
  const { t } = useTranslation();
  const { appDispatch } = useAppState();
  const { pubKey } = useVegaWallet();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  const [changeVote, setChangeVote] = React.useState(false);

  const cantVoteUI = React.useMemo(() => {
    if (proposalState !== ProposalState.STATE_OPEN) {
      return t('youDidNotVote');
    }

    if (!pubKey) {
      return (
        <div data-testid="connect-wallet">
          <ButtonLink
            onClick={() => {
              appDispatch({
                type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
                isOpen: true,
              });
              openVegaWalletDialog();
            }}
          >
            {t('connectVegaWallet')}
          </ButtonLink>{' '}
          {t('toVote')}
        </div>
      );
    }

    if (currentStakeAvailable.isLessThanOrEqualTo(0)) {
      return t('noGovernanceTokens');
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
    t,
    pubKey,
    currentStakeAvailable,
    proposalState,
    appDispatch,
    minVoterBalance,
    spamProtectionMinTokens,
    openVegaWalletDialog,
  ]);

  function submitVote(vote: VoteValue) {
    setChangeVote(false);
    castVote(vote);
  }

  // Should only render null for a split second while initial vote state
  // null is set to either Yes, No or NotCast
  if (!voteState) {
    return null;
  }

  if (cantVoteUI) {
    return <div>{cantVoteUI}</div>;
  }

  if (voteState === VoteState.Requested) {
    return <p data-testid="vote-requested">{t('voteRequested')}...</p>;
  }

  if (voteState === VoteState.Pending) {
    return <p data-testid="vote-pending">{t('votePending')}...</p>;
  }

  // If voted show current vote info`
  if (
    !changeVote &&
    (voteState === VoteState.Yes || voteState === VoteState.No)
  ) {
    const className =
      voteState === VoteState.Yes ? 'text-success' : 'text-danger';
    return (
      <p data-testid="you-voted">
        <span>{t('youVoted')}:</span>{' '}
        <span className={className}>{t(`voteState_${voteState}`)}</span>{' '}
        {voteDatetime ? (
          <span>{format(voteDatetime, DATE_FORMAT_LONG)}. </span>
        ) : null}
        {proposalState === ProposalState.STATE_OPEN ? (
          <ButtonLink
            data-testid="change-vote-button"
            onClick={() => {
              setChangeVote(true);
            }}
          >
            {t('changeVote')}
          </ButtonLink>
        ) : null}
      </p>
    );
  }

  if (!changeVote && voteState === VoteState.Failed) {
    return <p data-testid="vote-failure">{t('voteError')}</p>;
  }

  return (
    <div className="flex gap-4" data-testid="vote-buttons">
      <div className="flex-1">
        <Button
          data-testid="vote-for"
          onClick={() => submitVote(VoteValue.VALUE_YES)}
        >
          {t('voteFor')}
        </Button>
      </div>
      <div className="flex-1">
        <Button
          data-testid="vote-against"
          onClick={() => submitVote(VoteValue.VALUE_NO)}
        >
          {t('voteAgainst')}
        </Button>
      </div>
    </div>
  );
};
