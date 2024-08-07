import { useAssetsStore } from '@/stores/assets-store';

import { AsyncRenderer } from '../../async-renderer';
import type { ReceiptComponentProperties } from '../receipts';
import { BasicWithdrawal } from './basic-withdrawal';
import { EnrichedWithdrawal } from './enriched-withdrawal';

export const Withdraw = ({ transaction }: ReceiptComponentProperties) => {
  const { loading } = useAssetsStore((state) => ({
    loading: state.loading,
  }));

  if (!transaction.withdrawSubmission.ext?.erc20) return null;
  const { receiverAddress } = transaction.withdrawSubmission.ext.erc20;
  return (
    <AsyncRenderer
      loading={loading}
      renderLoading={() => (
        <BasicWithdrawal
          receiverAddress={receiverAddress}
          amount={transaction.withdrawSubmission.amount}
          assetId={transaction.withdrawSubmission.asset}
        />
      )}
      render={() => (
        <EnrichedWithdrawal
          receiverAddress={receiverAddress}
          amount={transaction.withdrawSubmission.amount}
          assetId={transaction.withdrawSubmission.asset}
        />
      )}
    />
  );
};
