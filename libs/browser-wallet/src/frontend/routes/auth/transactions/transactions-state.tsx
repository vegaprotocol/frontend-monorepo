import { TransactionState } from '@/types/backend';

export const locators = {
  transactionState: 'transaction-state',
};

const TRANSACTION_STATE_COLOR = {
  [TransactionState.Confirmed]: 'text-intent-info-background',
  [TransactionState.Rejected]: 'text-surface-1-fg',
  [TransactionState.Error]: 'text-intent-danger-background',
};

export const VegaTransactionState = ({
  state,
}: {
  state: TransactionState;
}) => {
  const color = TRANSACTION_STATE_COLOR[state];
  return (
    <span data-testid={locators.transactionState} className={color}>
      {state}
    </span>
  );
};
