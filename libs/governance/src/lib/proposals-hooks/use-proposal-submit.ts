import { useCallback, useState } from 'react';
import * as Sentry from '@sentry/react';
import { useVegaWallet, useVegaTransaction } from '@vegaprotocol/wallet';
import { determineId } from '@vegaprotocol/react-helpers';
import { useProposalEvent } from './use-proposal-event';
import type { ProposalSubmission } from '@vegaprotocol/wallet';
import type { ProposalEvent_busEvents_event_Proposal } from './__generated__/ProposalEvent';

export const useProposalSubmit = () => {
  const { pubKey } = useVegaWallet();

  const { send, transaction, setComplete, Dialog } = useVegaTransaction();
  const waitForProposalEvent = useProposalEvent(transaction);

  const [finalizedProposal, setFinalizedProposal] =
    useState<ProposalEvent_busEvents_event_Proposal | null>(null);

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

        if (res?.signature) {
          const resId = determineId(res.signature);
          if (resId) {
            waitForProposalEvent(resId, pubKey, (p) => {
              setFinalizedProposal(p);
              setComplete();
            });
          }
        }
        return res;
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [pubKey, send, setComplete, waitForProposalEvent]
  );

  return {
    transaction,
    finalizedProposal,
    Dialog,
    submit,
  };
};
