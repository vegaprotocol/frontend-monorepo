import {
  getProposalDialogIcon,
  getProposalDialogIntent,
  getProposalDialogTitle,
} from '@vegaprotocol/governance';
import type { ProposalEventFieldsFragment } from '@vegaprotocol/governance';
import type { DialogProps } from '@vegaprotocol/wallet';

interface ProposalFormTransactionDialogProps {
  finalizedProposal: ProposalEventFieldsFragment | null;
  TransactionDialog: (props: DialogProps) => JSX.Element;
}

export const ProposalFormTransactionDialog = ({
  finalizedProposal,
  TransactionDialog,
}: ProposalFormTransactionDialogProps) => {
  // Render a custom complete UI if the proposal was rejected other wise
  // pass undefined so that the default vega transaction dialog UI gets used
  const completeContent = finalizedProposal?.rejectionReason ? (
    <p>{finalizedProposal.rejectionReason}</p>
  ) : undefined;

  return (
    <div data-testid="proposal-transaction-dialog">
      <TransactionDialog
        title={getProposalDialogTitle(finalizedProposal?.state)}
        intent={getProposalDialogIntent(finalizedProposal?.state)}
        icon={getProposalDialogIcon(finalizedProposal?.state)}
        content={{
          Complete: completeContent,
        }}
      />
    </div>
  );
};
