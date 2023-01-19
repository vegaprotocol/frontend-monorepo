import { ToastsContainer } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import sortBy from 'lodash/sortBy';
import { useUpdateNetworkParametersToasts } from '@vegaprotocol/governance';

import { useVegaTransactionToasts } from '../lib/hooks/use-vega-transaction-toasts';
import { useEthereumTransactionToasts } from '../lib/hooks/use-ethereum-transaction-toasts';
import { useEthereumWithdrawApprovalsToasts } from '../lib/hooks/use-ethereum-withdraw-approval-toasts';

export const ToastsManager = () => {
  const updateNetworkParametersToasts = useUpdateNetworkParametersToasts();
  const vegaTransactionToasts = useVegaTransactionToasts();
  const ethTransactionToasts = useEthereumTransactionToasts();
  const withdrawApprovalToasts = useEthereumWithdrawApprovalsToasts();

  const toasts = useMemo(() => {
    return sortBy(
      [
        ...vegaTransactionToasts,
        ...ethTransactionToasts,
        ...withdrawApprovalToasts,
        ...updateNetworkParametersToasts,
      ],
      ['createdBy']
    );
  }, [
    vegaTransactionToasts,
    ethTransactionToasts,
    withdrawApprovalToasts,
    updateNetworkParametersToasts,
  ]);

  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
