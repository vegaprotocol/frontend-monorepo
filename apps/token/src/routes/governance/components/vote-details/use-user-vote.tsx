import { captureMessage } from '@sentry/minimal';

import { useVegaWallet } from '@vegaprotocol/wallet';
import { VoteValue } from '@vegaprotocol/types';
import { useEffect, useState } from 'react';
import { useUserVoteQuery } from './__generated__/Vote';
import { removePaginationWrapper } from '@vegaprotocol/react-helpers';

export enum VoteState {
  NotCast = 'NotCast',
  Yes = 'Yes',
  No = 'No',
  Requested = 'Requested',
  Pending = 'Pending',
  Failed = 'Failed',
}

export type Vote = {
  value: VoteValue;
  datetime: string;
  party: { id: string };
};

export type Votes = Array<Vote | null>;

export function getUserVote(pubkey: string, yesVotes?: Votes, noVotes?: Votes) {
  const yesVote = yesVotes?.find((v) => v && v.party.id === pubkey);
  const noVote = noVotes?.find((v) => v && v.party.id === pubkey);
  if (yesVote) {
    return yesVote;
  } else if (noVote) {
    return noVote;
  } else {
    return null;
  }
}

/**
 * Finds the status of a users given vote in a given proposal and provides
 * a function to send a vote transaction to your wallet
 */
export function useUserVote(proposalId: string | null | undefined) {
  const { pubKey } = useVegaWallet();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [timeout, setTimeoutValue] = useState<any>(null);
  const [voteState, setVoteState] = useState<VoteState | null>(
    VoteState.NotCast
  );
  const { data } = useUserVoteQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !proposalId,
  });

  const userVote = removePaginationWrapper(
    data?.party?.votesConnection?.edges
  ).find(({ proposalId: pId }) => proposalId === pId);

  // If user vote changes update the vote state
  useEffect(() => {
    if (!userVote) {
      setVoteState(VoteState.NotCast);
    } else {
      setVoteState(
        userVote.vote.value === VoteValue.VALUE_YES
          ? VoteState.Yes
          : VoteState.No
      );
    }
  }, [userVote]);

  // Starts a timeout of 30s to set a failed message if
  // the vote is not seen by the time the callback is invoked
  useEffect(() => {
    if (voteState === VoteState.Pending && !timeout) {
      const timeout = setTimeout(() => {
        setVoteState(VoteState.Failed);
        captureMessage('Vote not seen after 30s');
      }, 1000 * 30);
      setTimeoutValue(timeout);
    } else if (voteState !== VoteState.Pending) {
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, [timeout, voteState]);

  return {
    voteState,
    userVote,
    voteDatetime: userVote ? new Date(userVote.vote.datetime) : null,
  };
}
