import { t } from '@vegaprotocol/i18n';
import { VoteState } from './use-user-vote';
import {
  VegaTransactionDialog,
  type VegaTxState,
} from '@vegaprotocol/proposals';

interface VoteTransactionDialogProps {
  voteState: VoteState;
  transaction: VegaTxState;
}

const dialogTitle = (voteState: VoteState): string | undefined => {
  switch (voteState) {
    case VoteState.Requested:
      return t('txRequested');
    case VoteState.Pending:
      return t('votePending');
    default:
      return undefined;
  }
};

export const VoteTransactionDialog = ({
  voteState,
  transaction,
}: VoteTransactionDialogProps) => {
  // Render a custom message if the voting fails otherwise
  // pass undefined so that the default vega transaction dialog UI gets used
  const customMessage =
    voteState === VoteState.Failed ? (
      <p>{transaction.error?.message || t('voteError')}</p>
    ) : undefined;

  return (
    <div data-testid="vote-transaction-dialog">
      <VegaTransactionDialog
        title={dialogTitle(voteState)}
        transaction={transaction}
        content={{
          Complete: customMessage,
        }}
        isOpen={transaction.dialogOpen}
      />
    </div>
  );
};
