import { WithdrawalFeedback } from '@vegaprotocol/withdraws';
import { VegaDialog, VegaTxStatus, isWithdraw } from '@vegaprotocol/wallet';
import type { VegaStoredTxState } from '@vegaprotocol/wallet';

export const VegaTransaction = (transaction: VegaStoredTxState) => {
  if (isWithdraw(transaction.body)) {
    if (
      transaction.status === VegaTxStatus.Complete &&
      transaction.withdrawal
    ) {
      return (
        <WithdrawalFeedback
          transaction={transaction}
          withdrawal={transaction.withdrawal}
          availableTimestamp={null}
          // eslint-disable-next-line
          submitWithdraw={() => {}}
        />
      );
    }
  }
  return <VegaDialog transaction={transaction} />;
};
