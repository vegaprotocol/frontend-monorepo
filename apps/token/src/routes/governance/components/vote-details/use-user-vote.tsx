import { captureException, captureMessage } from '@sentry/minimal';

import { useVegaWallet } from '@vegaprotocol/wallet';
import { VoteValue } from '@vegaprotocol/types';
import { useEffect, useMemo, useState } from 'react';

export type Vote = {
  value: VoteValue;
  datetime: string;
  party: { id: string };
};

export type Votes = Array<Vote | null>;

export enum VoteState {
  NotCast = 'NotCast',
  Yes = 'Yes',
  No = 'No',
  Requested = 'Requested',
  Pending = 'Pending',
  Failed = 'Failed',
}

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
export function useUserVote(
  proposalId: string | null,
  yesVotes: Votes | null,
  noVotes: Votes | null
) {
  const { keypair, sendTx } = useVegaWallet();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [timeout, setTimeoutValue] = useState<any>(null);
  const yes = useMemo(() => yesVotes || [], [yesVotes]);
  const no = useMemo(() => noVotes || [], [noVotes]);

  const [voteState, setVoteState] = useState<VoteState | null>(
    VoteState.NotCast
  );

  // Find the users vote everytime yes or no votes change
  const userVote = useMemo(() => {
    if (keypair) {
      return getUserVote(keypair, yes, no);
    }
    return null;
  }, [keypair, yes, no]);

  // If user vote changes update the vote state
  useEffect(() => {
    if (!userVote) {
      setVoteState(VoteState.NotCast);
    } else {
      setVoteState(
        userVote.value === VoteValue.VALUE_YES ? VoteState.Yes : VoteState.No
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

  /**
   * Casts a vote using the users connected wallet
   */
  async function castVote(value: VoteValue) {
    if (!proposalId || !keypair) return;

    setVoteState(VoteState.Requested);

    try {
      const variables = {
        pubKey: keypair
        propagate: true,
        voteSubmission: {
          value: value,
          proposalId,
        },
      };
      await sendTx(variables);
      setVoteState(VoteState.Pending);

      // Now await vote via poll in parent component
    } catch (err) {
      setVoteState(VoteState.Failed);
      captureException(err);
    }
  }

  return {
    voteState,
    castVote,
    userVote,
    voteDatetime: userVote ? new Date(userVote.datetime) : null,
  };
}
