import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { DepositsTable } from '@vegaprotocol/deposits';
import { useDeposits } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';
import Link from 'next/link';

export const DepositsContainer = () => {
  const { deposits, loading, error } = useDeposits();

  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      <header className="flex justify-between items-center p-3">
        <h4 className="text-lg text-black dark:text-white">{t('Deposits')}</h4>
        <Link href="/portfolio/deposit" passHref={true}>
          <Button
              size="sm"
              variant="secondary"
          >
            Make deposit
          </Button>
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
