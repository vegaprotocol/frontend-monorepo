import {
  useVegaTransactionManager,
  useVegaTransactionUpdater,
} from '@vegaprotocol/web3';
import {
  useEthTransactionManager,
  useEthTransactionUpdater,
  useEthWithdrawApprovalsManager,
} from '@vegaprotocol/web3';
import { useLedgerDownloadManager } from '@vegaprotocol/ledger';

export const TransactionHandlers = () => {
  useVegaTransactionManager();
  useVegaTransactionUpdater();
  useEthTransactionManager();
  useEthTransactionUpdater();
  useEthWithdrawApprovalsManager();
  useLedgerDownloadManager();
  return null;
};
