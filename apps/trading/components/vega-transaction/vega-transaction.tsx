import { WithdrawalFeedback } from '@vegaprotocol/withdraws';
import { OrderFeedback } from '@vegaprotocol/orders';

import {
  VegaDialog,
  VegaTxStatus,
  isWithdrawTransaction,
  isOrderCancellationTransaction,
  isOrderSubmissionTransaction,
  isOrderAmendmentTransaction,
} from '@vegaprotocol/wallet';
import type { VegaStoredTxState } from '@vegaprotocol/wallet';
import { useEthWithdrawApprovalsStore } from '@vegaprotocol/web3';

export const VegaTransaction = ({
  transaction,
}: {
  transaction: VegaStoredTxState;
}) => {
  const createEthWithdrawalApproval = useEthWithdrawApprovalsStore(
    (state) => state.create
  );
  if (isWithdrawTransaction(transaction.body)) {
    if (
      transaction.status === VegaTxStatus.Complete &&
      transaction.withdrawal
    ) {
      return (
        <WithdrawalFeedback
          transaction={transaction}
          withdrawal={transaction.withdrawal}
          availableTimestamp={null}
          submitWithdraw={() => {
            if (!transaction?.withdrawal) {
              return;
            }
            createEthWithdrawalApproval(
              transaction.withdrawal,
              transaction.withdrawalApproval
            );
          }}
        />
      );
    }
  } else if (
    (isOrderCancellationTransaction(transaction.body) ||
      isOrderSubmissionTransaction(transaction.body) ||
      isOrderAmendmentTransaction(transaction.body)) &&
    transaction.status === VegaTxStatus.Complete &&
    transaction.order
  ) {
    return (
      <OrderFeedback transaction={transaction} order={transaction.order} />
    );
  }
  return <VegaDialog transaction={transaction} />;
};
