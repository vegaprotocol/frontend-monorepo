import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import {
  useEthTransactionStore,
  useEthWithdrawApprovalsStore,
} from '@vegaprotocol/web3';
import { VegaTransaction } from '../components/vega-transaction';

export const ToastsContainer = () => {
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
              <div key={transaction.id}>
                {transaction.txHash} - {transaction.status}
              </div>
            )
        )}
      </div>
      <div>
        {withdrawApprovals.map(
          (transaction) =>
            transaction && (
              <div key={transaction.id}>
                {transaction.withdrawal.id} - {transaction.status}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default ToastsContainer;
