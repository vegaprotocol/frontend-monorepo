import { useCallback, useState } from 'react';
import * as Sentry from '@sentry/react';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { useVoteEvent } from './use-vote-event';
import type { VoteValue } from '@vegaprotocol/types';
import type { VoteEventFieldsFragment } from './__generated__/VoteSubsciption';

export type FinalizedVote = VoteEventFieldsFragment;

export const useVoteSubmit = () => {
  const { pubKey } = useVegaWallet();
  const { send, transaction, setComplete, Dialog } = useVegaTransaction();
  const waitForVoteEvent = useVoteEvent(transaction);

  const [finalizedVote, setFinalizedVote] =
    useState<VoteEventFieldsFragment | null>(null);

  const submit = useCallback(
    async (voteValue: VoteValue, proposalId: string | null) => {
      if (!pubKey || !voteValue || !proposalId) {
        return;
      }

      setFinalizedVote(null);

      try {
        const res = await send(pubKey, {
          voteSubmission: {
            value: voteValue,
            proposalId,
          },
        });

        if (res) {
          waitForVoteEvent(proposalId, pubKey, (v) => {
            setFinalizedVote(v);
            setComplete();
          });
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    },
    [pubKey, send, setComplete, waitForVoteEvent]
  );

  return {
    transaction,
    finalizedVote,
    Dialog,
    submit,
  };
};
