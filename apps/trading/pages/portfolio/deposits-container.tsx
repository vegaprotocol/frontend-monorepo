import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { DepositsTable } from '@vegaprotocol/deposits';
import { useDeposits } from '@vegaprotocol/deposits';
import { useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import Link from 'next/link';

export const DepositsContainer = () => {
  const { data, loading, error } = useDeposits();
  const deposits = useMemo(() => {
    if (!data?.party?.depositsConnection.edges?.length) {
      return [];
    }

    return orderBy(
      compact(data.party?.depositsConnection.edges?.map((d) => d?.node)),
      [(d) => new Date(d.createdTimestamp).getTime()],
      ['desc']
    );
  }, [data]);

  return (
    <div className="h-full grid gap-4 grid-rows-[min-content_1fr]">
      <header className="flex justify-between items-center p-4">
        <h4 className="text-lg text-black dark:text-white">{t('Deposits')}</h4>
        <Link href="/portfolio/deposit" passHref={true}>
          <Button>Deposit</Button>
        </Link>
      </header>
      <div>
        <AsyncRenderer
          data={deposits}
          loading={loading}
          error={error}
          render={(data) => {
            return <DepositsTable deposits={data} />;
          }}
        />
      </div>
    </div>
  );
};
