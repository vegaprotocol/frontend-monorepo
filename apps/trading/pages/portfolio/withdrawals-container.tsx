import orderBy from 'lodash/orderBy';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useWithdrawals, WithdrawalsTable } from '@vegaprotocol/withdraws';
import Link from 'next/link';
import { t } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';

export const WithdrawalsContainer = () => {
  const { data, loading, error } = useWithdrawals();
  const withdrawals = useMemo(() => {
    return orderBy(
      data?.party?.withdrawals || [],
      (w) => new Date(w.createdTimestamp).getTime(),
      'desc'
    );
  }, [data]);

  return (
    <div className="h-full grid gap-4 grid-rows-[min-content_1fr]">
      <header className="flex justify-between items-center p-4">
        <h4 className="text-lg text-black dark:text-white">
          {t('Withdrawals')}
        </h4>
        <Link href="/portfolio/withdraw" passHref={true}>
          <Button>Withdraw</Button>
        </Link>
      </header>
      <div>
        <AsyncRenderer
          data={withdrawals}
          loading={loading}
          error={error}
          render={(data) => {
            return <WithdrawalsTable withdrawals={data} />;
          }}
        />
      </div>
    </div>
  );
};
