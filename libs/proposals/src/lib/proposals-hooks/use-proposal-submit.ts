import { useCallback, useState } from 'react';
import * as Sentry from '@sentry/react';
import { determineId } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useVegaTransaction } from './use-vega-transaction';
import { useProposalEvent } from './use-proposal-event';
import { type ProposalSubmission } from '@vegaprotocol/wallet';
import { type ProposalEventFieldsFragment } from './__generated__/Proposal';

export const useProposalSubmit = () => {
  const { pubKey } = useVegaWallet();

  const { send, transaction, setComplete, setTransaction } =
    useVegaTransaction();
  const waitForProposalEvent = useProposalEvent(transaction);

  const [finalizedProposal, setFinalizedProposal] =
    useState<ProposalEventFieldsFragment | null>(null);

  const submit = useCallback(
    async (proposal: ProposalSubmission) => {
      if (!pubKey || !proposal) {
        return;
      }

      setFinalizedProposal(null);

      try {
        const res = await send(pubKey, {
          proposalSubmission: proposal,
        });

        if (res) {
          if ('error' in res) {
            throw new Error('proposal failed');
          }

          const proposalId = determineId(res.signature);

          if (proposalId) {
            waitForProposalEvent(proposalId, pubKey, (p) => {
              setFinalizedProposal(p);
              setComplete();
            });
          }
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    },
    [pubKey, send, setComplete, waitForProposalEvent]
  );

  return {
    transaction,
    finalizedProposal,
    submit,
    setTransaction,
  };
};
