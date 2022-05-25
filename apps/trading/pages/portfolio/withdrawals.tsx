import orderBy from 'lodash/orderBy';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useWithdrawals, WithdrawalsTable } from '@vegaprotocol/withdraws';

export const Withdrawals = () => {
  const { data, loading, error } = useWithdrawals();

  return (
    <AsyncRenderer
      data={data}
      loading={loading}
      error={error}
      render={(data) => {
        const withdrawals = orderBy(
          data.party?.withdrawals || [],
          (w) => new Date(w.createdTimestamp).getTime(),
          'desc'
        );
        return <WithdrawalsTable withdrawals={withdrawals} />;
      }}
    />
  );
};
