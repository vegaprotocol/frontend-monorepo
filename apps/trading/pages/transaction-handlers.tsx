import {
  useVegaTransactionManager,
  useVegaTransactionUpdater,
} from '@vegaprotocol/web3';
import {
  useEthTransactionManager,
  useEthTransactionUpdater,
  useEthWithdrawApprovalsManager,
} from '@vegaprotocol/web3';

export const TransactionHandlers = () => {
  useVegaTransactionManager();
  useVegaTransactionUpdater();
  useEthTransactionManager();
  useEthTransactionUpdater();
  useEthWithdrawApprovalsManager();
  return null;
};
