import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import {
  useEthTransactionStore,
  useEthWithdrawApprovalsStore,
  TransactionContent,
} from '@vegaprotocol/web3';

import { VerificationStatus } from '@vegaprotocol/withdraws';
import { VegaTransaction } from '../components/vega-transaction';

export const ToastsManager = () => {
  const vegaTransactions = useVegaTransactionStore(
    (state) => state.transactions
  );
  const ethTransactions = useEthTransactionStore((state) => state.transactions);
  const withdrawApprovals = useEthWithdrawApprovalsStore(
    (state) => state.transactions
  );
  return (
    <div className="fixed right-0 bottom-0 w-96 m-1 bg-inherit">
      <div>
        {vegaTransactions.map(
          (transaction) =>
            transaction && (
              <VegaTransaction key={transaction.id} transaction={transaction} />
            )
        )}
      </div>
      <div>
        {ethTransactions.map(
          (transaction) =>
            transaction && (
              <TransactionContent key={transaction.id} {...transaction} />
            )
        )}
      </div>
      <div>
        {withdrawApprovals.map(
          (transaction) =>
            transaction && (
              <div key={transaction.id}>
                <VerificationStatus state={transaction} />
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default ToastsManager;
