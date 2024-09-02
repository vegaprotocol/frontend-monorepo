import { Dialog } from '@vegaprotocol/ui-toolkit';
import { type Status, type Result } from '@vegaprotocol/wallet-react';
import { TransactionSteps } from './transaction-steps';
import { useT } from '../../lib/use-t';

type TransactionDialogProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txStatus: Status;
  result?: Result;
  error?: string;
  reset: () => void;
};

export const TransactionDialog = ({
  title,
  open,
  onOpenChange,
  txStatus,
  result,
  error,
  reset,
}: TransactionDialogProps) => {
  const t = useT();
  return (
    <Dialog title={title} open={open} onChange={(open) => onOpenChange(open)}>
      <TransactionSteps
        status={txStatus}
        result={result}
        error={error}
        reset={reset}
        resetLabel={t('Dismiss')}
      />
    </Dialog>
  );
};
