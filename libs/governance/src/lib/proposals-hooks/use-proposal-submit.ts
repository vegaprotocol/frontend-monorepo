import { useCallback, useState } from 'react';
import * as Sentry from '@sentry/react';
import { useVegaWallet, useVegaTransaction } from '@vegaprotocol/wallet';
import { determineId } from '@vegaprotocol/react-helpers';
import { useProposalEvent } from './use-proposal-event';
import type { ProposalSubmission } from '@vegaprotocol/wallet';
import type { ProposalEvent_busEvents_event_Proposal } from './__generated__';

export const useProposalSubmit = () => {
  const { keypair } = useVegaWallet();
  const waitForProposalEvent = useProposalEvent();

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    TransactionDialog,
  } = useVegaTransaction();

  const [finalizedProposal, setFinalizedProposal] =
    useState<ProposalEvent_busEvents_event_Proposal | null>(null);

  const reset = useCallback(() => {
    resetTransaction();
    setFinalizedProposal(null);
  }, [resetTransaction]);

  const submit = useCallback(
    async (proposal: ProposalSubmission) => {
      if (!keypair || !proposal) {
        return;
      }

      setFinalizedProposal(null);

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          proposalSubmission: proposal,
        });

        if (res?.signature) {
          const resId = determineId(res.signature);
          if (resId) {
            waitForProposalEvent(resId, keypair.pub, (p) => {
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
    [keypair, send, setComplete, waitForProposalEvent]
  );

  return {
    transaction,
    finalizedProposal,
    TransactionDialog,
    submit,
    reset,
  };
};
