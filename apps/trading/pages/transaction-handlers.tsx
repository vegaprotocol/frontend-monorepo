import {
  useVegaTransactionManager,
  useVegaTransactionUpdater,
} from '@vegaprotocol/web3';
import { useLedgerDownloadManager } from '@vegaprotocol/ledger';

export const TransactionHandlers = () => {
  useVegaTransactionManager();
  useVegaTransactionUpdater();
  useLedgerDownloadManager();
  return null;
};
