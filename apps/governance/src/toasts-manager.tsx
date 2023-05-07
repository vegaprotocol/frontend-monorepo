import { ToastsContainer, useToasts } from '@vegaprotocol/ui-toolkit';
import {
  useEthereumTransactionToasts,
  useEthereumWithdrawApprovalsToasts,
  useVegaTransactionToasts,
} from '@vegaprotocol/web3';

export const ToastsManager = () => {
  useVegaTransactionToasts();
  useEthereumTransactionToasts();
  useEthereumWithdrawApprovalsToasts();

  const toasts = useToasts((store) => store.toasts);
  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
