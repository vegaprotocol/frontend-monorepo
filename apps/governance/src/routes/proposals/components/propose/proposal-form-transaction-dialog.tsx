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
  const title = useGetProposalDialogTitle(finalizedProposal?.state);
  // Render a custom complete UI if the proposal was rejected otherwise
  // pass undefined so that the default vega transaction dialog UI gets used
  const completeContent = finalizedProposal?.rejectionReason ? (
    <p>{ProposalRejectionReasonMapping[finalizedProposal.rejectionReason]}</p>
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
