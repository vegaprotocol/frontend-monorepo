import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import {
  useEthTransactionStore,
  useEthWithdrawApprovalsStore,
  TransactionContent,
} from '@vegaprotocol/web3';

import { VerificationStatus } from '@vegaprotocol/withdraws';
import { VegaTransaction } from '../components/vega-transaction';

export const ToastsManager = () => {
  const vegaTransactions = useVegaTransactionStore((state) =>
    state.transactions.filter((transaction) => transaction?.dialogOpen)
  );
  const dismissVegaTransaction = useVegaTransactionStore(
    (state) => state.dismiss
  );
  const ethTransactions = useEthTransactionStore((state) =>
    state.transactions.filter((transaction) => transaction?.dialogOpen)
  );
  const dismissEthTransaction = useEthTransactionStore(
    (state) => state.dismiss
  );
  const withdrawApprovals = useEthWithdrawApprovalsStore((state) =>
    state.transactions.filter((transaction) => transaction?.dialogOpen)
  );
  const dismissWithdrawApproval = useEthWithdrawApprovalsStore(
    (state) => state.dismiss
  );
  return (
    <div className="fixed right-0 bottom-0 w-96 p-1 bg-inherit">
      <div>
        {vegaTransactions.map(
          (transaction) =>
            transaction && (
              <div
                key={transaction.id}
                className="m-1 p-1 border border-indigo-500"
              >
                <VegaTransaction transaction={transaction} />
                <button onClick={() => dismissVegaTransaction(transaction.id)}>
                  dismiss
                </button>
              </div>
            )
        )}
      </div>
      <div>
        {ethTransactions.map(
          (transaction) =>
            transaction && (
              <div
                key={transaction.id}
                className="m-1 p-1 border border-indigo-500"
              >
                <TransactionContent {...transaction} />
                <button onClick={() => dismissEthTransaction(transaction.id)}>
                  dismiss
                </button>
              </div>
            )
        )}
      </div>
      <div>
        {withdrawApprovals.map(
          (transaction) =>
            transaction && (
              <div
                key={transaction.id}
                className="m-1 p-1 border border-indigo-500"
              >
                <VerificationStatus state={transaction} />
                <button onClick={() => dismissWithdrawApproval(transaction.id)}>
                  dismiss
                </button>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default ToastsManager;
