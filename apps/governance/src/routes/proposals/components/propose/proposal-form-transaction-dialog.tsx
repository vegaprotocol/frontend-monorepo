import {
  VegaTransactionDialog,
  getProposalDialogIcon,
  getProposalDialogIntent,
  useGetProposalDialogTitle,
} from '@vegaprotocol/proposals';
import type {
  ProposalEventFieldsFragment,
  VegaTxState,
} from '@vegaprotocol/proposals';
import { ProposalRejectionReasonMapping } from '@vegaprotocol/types';
import { useProposalQuery } from '../../__generated__/Proposals';
import compact from 'lodash/compact';
import { DApp, EXPLORER_TX, useLinks } from '@vegaprotocol/environment';
import { useTranslation } from 'react-i18next';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

interface ProposalFormTransactionDialogProps {
  finalizedProposal: ProposalEventFieldsFragment | null;
  transaction: VegaTxState;
  onChange: (open: boolean) => void;
}

export const ProposalFormTransactionDialog = ({
  finalizedProposal,
  transaction,
  onChange,
}: ProposalFormTransactionDialogProps) => {
  const { t } = useTranslation();
  const link = useLinks(DApp.Explorer);
  const explorerLink = transaction.txHash ? (
    <a
      className="underline"
      data-testid="tx-block-explorer"
      href={link(EXPLORER_TX.replace(':hash', transaction.txHash))}
      target="_blank"
      rel="noreferrer"
    >
      {t('View in block explorer')}
    </a>
  ) : null;

  // There's not enough data for batch proposals from the subscription that
  // provides `finalizedProposal`, hence in order to get whole picture of
  // the sub-proposals rejection reason and error data we need to query for it.
  const { data } = useProposalQuery({
    variables: {
      proposalId: finalizedProposal?.id || '',
    },
    skip: !finalizedProposal?.id,
    fetchPolicy: 'cache-and-network',
  });

  let additionalRejectionReason = finalizedProposal?.errorDetails ? (
    <p className="text-sm mb-2">{finalizedProposal.errorDetails}</p>
  ) : null;

  if (
    data?.proposal?.__typename === 'BatchProposal' &&
    data.proposal.subProposals
  ) {
    const rejections = compact(
      data.proposal.subProposals.map((sub, i) => {
        if (!sub?.rejectionReason) {
          return null;
        }

        return (
          <li key={i} className="flex flex-col text-sm">
            <span className="font-bold">
              {sub.terms?.change.__typename}{' '}
              <span
                className="font-normal text-xs text-gs-400"
                title={sub.id || ''}
              >
                {truncateMiddle(sub.id || '')}
              </span>
            </span>

            <span>{ProposalRejectionReasonMapping[sub.rejectionReason]}</span>
            {sub.errorDetails ? (
              <span className="text-xs italic">{sub.errorDetails}</span>
            ) : null}
          </li>
        );
      })
    );
    additionalRejectionReason = (
      <ul className="mb-2 flex flex-col gap-2">{rejections}</ul>
    );
  }

  const title = useGetProposalDialogTitle(finalizedProposal?.state);
  // Render a custom complete UI if the proposal was rejected otherwise
  // pass undefined so that the default vega transaction dialog UI gets used
  const completeContent = finalizedProposal?.rejectionReason ? (
    <div className="flex flex-col">
      <p>{ProposalRejectionReasonMapping[finalizedProposal.rejectionReason]}</p>
      {additionalRejectionReason}
      {explorerLink}
    </div>
  ) : undefined;

  return (
    <div data-testid="proposal-transaction-dialog">
      <VegaTransactionDialog
        title={title}
        intent={getProposalDialogIntent(finalizedProposal?.state)}
        icon={getProposalDialogIcon(finalizedProposal?.state)}
        content={{
          Complete: completeContent,
        }}
        transaction={transaction}
        isOpen={transaction.dialogOpen}
        onChange={onChange}
      />
    </div>
  );
};
