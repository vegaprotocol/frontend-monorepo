import { captureMessage } from '@sentry/minimal';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { VoteValue } from '@vegaprotocol/types';
import { useEffect, useState } from 'react';
import { useUserVoteQuery } from './__generated__/Vote';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import type {
  FinalizedVote,
  VoteEventFieldsFragment,
} from '@vegaprotocol/proposals';

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

/**
 * Finds the status of a users given vote in a given proposal and provides
 * a function to send a vote transaction to your wallet
 */
export function useUserVote(
  proposalId: string | null | undefined,
  finalizedVote?: FinalizedVote | null
) {
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
  const [userVote, setUserVote] = useState<FinalizedVote | undefined>(
    undefined
  );

  useEffect(() => {
    if (finalizedVote?.vote.value && finalizedVote.pubKey === pubKey) {
      setUserVote(finalizedVote);
    } else if (data?.party?.votesConnection?.edges && pubKey) {
      // This sets the vote (if any) when the user first loads the page
      setUserVote({
        ...(removePaginationWrapper(data?.party?.votesConnection?.edges).find(
          ({ proposalId: pId }) => proposalId === pId
        ) as VoteEventFieldsFragment),
        pubKey,
      });
    }
  }, [
    finalizedVote?.vote.value,
    data?.party?.votesConnection?.edges,
    finalizedVote,
    proposalId,
    pubKey,
  ]);

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
