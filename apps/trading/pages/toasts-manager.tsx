import { ToastsContainer, useToasts } from '@vegaprotocol/ui-toolkit';
import { useUpdateNetworkParametersToasts } from '@vegaprotocol/governance';
import { useVegaTransactionToasts } from '../lib/hooks/use-vega-transaction-toasts';
import { useEthereumTransactionToasts } from '../lib/hooks/use-ethereum-transaction-toasts';
import { useEthereumWithdrawApprovalsToasts } from '../lib/hooks/use-ethereum-withdraw-approval-toasts';

export const ToastsManager = () => {
  useUpdateNetworkParametersToasts();
  useVegaTransactionToasts();
  useEthereumTransactionToasts();
  useEthereumWithdrawApprovalsToasts();

  const toasts = useToasts((store) => store.toasts);
  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
