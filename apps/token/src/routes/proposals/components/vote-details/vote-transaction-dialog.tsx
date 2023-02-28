import { t } from '@vegaprotocol/i18n';
import { VoteState } from './use-user-vote';
import type { DialogProps } from '@vegaprotocol/wallet';

interface VoteTransactionDialogProps {
  voteState: VoteState;
  TransactionDialog: (props: DialogProps) => JSX.Element;
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
  TransactionDialog,
}: VoteTransactionDialogProps) => {
  // Render a custom message if the voting fails otherwise
  // pass undefined so that the default vega transaction dialog UI gets used
  const customMessage =
    voteState === VoteState.Failed ? <p>{t('voteError')}</p> : undefined;

  return (
    <div data-testid="vote-transaction-dialog">
      <TransactionDialog
        title={dialogTitle(voteState)}
        content={{
          Complete: customMessage,
        }}
      />
    </div>
  );
};
