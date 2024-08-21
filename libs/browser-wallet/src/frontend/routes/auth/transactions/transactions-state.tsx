import { TransactionState } from '@/types/backend';

export const locators = {
  transactionState: 'transaction-state',
};

const TRANSACTION_STATE_COLOR = {
  [TransactionState.Confirmed]: 'text-vega-blue-500',
  [TransactionState.Rejected]: 'text-surface-0-fg-muted',
  [TransactionState.Error]: 'text-vega-pink-500',
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
