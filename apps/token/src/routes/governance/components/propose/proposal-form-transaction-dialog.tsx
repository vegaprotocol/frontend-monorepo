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
}: ProposalFormTransactionDialogProps) => (
  <div data-testid="proposal-transaction-dialog">
    <TransactionDialog
      title={getProposalDialogTitle(finalizedProposal?.state)}
      intent={getProposalDialogIntent(finalizedProposal?.state)}
      icon={getProposalDialogIcon(finalizedProposal?.state)}
    >
      {finalizedProposal?.rejectionReason ? (
        <p>{finalizedProposal.rejectionReason}</p>
      ) : undefined}
    </TransactionDialog>
  </div>
);
