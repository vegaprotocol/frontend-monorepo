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
  VoteButtons as VoteButtonsQueryResult,
  VoteButtonsVariables,
} from './__generated__/VoteButtons';
import { VoteState } from './use-user-vote';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ProposalState, VoteValue } from '@vegaprotocol/types';
import { Button, ButtonLink } from '@vegaprotocol/ui-toolkit';

interface VoteButtonsContainerProps {
  voteState: VoteState | null;
  castVote: (vote: VoteValue) => void;
  voteDatetime: Date | null;
  proposalState: ProposalState;
  className?: string;
}

const VOTE_BUTTONS_QUERY = gql`
  query VoteButtons($partyId: ID!) {
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
  const { keypair } = useVegaWallet();
  const { data, loading } = useQuery<
    VoteButtonsQueryResult,
    VoteButtonsVariables
  >(VOTE_BUTTONS_QUERY, {
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
  });

  if (loading) return null;

  return (
    <VoteButtons
      {...props}
      currentStakeAvailable={
        new BigNumber(data?.party?.stake.currentStakeAvailableFormatted || 0)
      }
    />
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
}: VoteButtonsProps) => {
  const { t } = useTranslation();
  const { appDispatch } = useAppState();
  const { keypair } = useVegaWallet();
  const [changeVote, setChangeVote] = React.useState(false);

  const cantVoteUI = React.useMemo(() => {
    if (proposalState !== ProposalState.STATE_OPEN) {
      return t('youDidNotVote');
    }

    if (!keypair) {
      return (
        <>
          <ButtonLink
            onClick={() =>
              appDispatch({
                type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
                isOpen: true,
              })
            }
          >
            {t('connectVegaWallet')}
          </ButtonLink>{' '}
          {t('toVote')}
        </>
      );
    }

    if (currentStakeAvailable.isLessThanOrEqualTo(0)) {
      return t('noGovernanceTokens');
    }

    return false;
  }, [t, keypair, currentStakeAvailable, proposalState, appDispatch]);

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
    return <p>{cantVoteUI}</p>;
  }

  if (voteState === VoteState.Requested) {
    return <p>{t('voteRequested')}...</p>;
  }

  if (voteState === VoteState.Pending) {
    return <p>{t('votePending')}...</p>;
  }

  // If voted show current vote info`
  if (
    !changeVote &&
    (voteState === VoteState.Yes || voteState === VoteState.No)
  ) {
    const className =
      voteState === VoteState.Yes ? 'text-success' : 'text-danger';
    return (
      <p>
        <span>{t('youVoted')}:</span>{' '}
        <span className={className}>{t(`voteState_${voteState}`)}</span>{' '}
        {voteDatetime ? (
          <span>{format(voteDatetime, DATE_FORMAT_LONG)}. </span>
        ) : null}
        {proposalState === ProposalState.STATE_OPEN ? (
          <ButtonLink
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
    return <p>{t('voteError')}</p>;
  }

  return (
    <div className="flex gap-4" data-testid="vote-buttons">
      <div className="flex-1">
        <Button onClick={() => submitVote(VoteValue.VALUE_YES)}>
          {t('voteFor')}
        </Button>
      </div>
      <div className="flex-1">
        <Button onClick={() => submitVote(VoteValue.VALUE_NO)}>
          {t('voteAgainst')}
        </Button>
      </div>
    </div>
  );
};
