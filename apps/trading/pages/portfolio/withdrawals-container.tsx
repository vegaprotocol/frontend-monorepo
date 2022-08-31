import orderBy from 'lodash/orderBy';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useWithdrawals, WithdrawalsTable } from '@vegaprotocol/withdraws';
import Link from 'next/link';
import { t } from '@vegaprotocol/react-helpers';

export const WithdrawalsContainer = () => {
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
        return (
          <div className="grid grid-cols-[1fr_min-content] gap-4 h-full">
            <WithdrawalsTable withdrawals={withdrawals} />
            <div className="p-4">
              <Link href="/portfolio/withdraw" passHref={true}>
                <Button size="md" data-testid="start-withdrawal">
                  {t('Withdraw')}
                </Button>
              </Link>
            </div>
          </div>
        );
      }}
    />
  );
};
