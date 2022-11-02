import { t } from '@vegaprotocol/react-helpers';
import { VoteState } from './use-user-vote';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import type { DialogProps } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';

interface VoteTransactionDialogProps {
  voteState: VoteState;
  TransactionDialog: (props: DialogProps) => JSX.Element;
}

const dialogTitle = (voteState: VoteState): string | undefined => {
  switch (voteState) {
    case VoteState.Requested:
      return t('voteRequested');
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
    <div data-testid="proposal-transaction-dialog">
      <TransactionDialog
        title={dialogTitle(voteState)}
        content={{
          Complete: customMessage,
        }}
      />
    </div>
  );
};
