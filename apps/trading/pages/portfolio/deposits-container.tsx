import { t } from '@vegaprotocol/react-helpers';
import { Button } from '@vegaprotocol/ui-toolkit';
import Link from 'next/link';

export const DepositsContainer = () => {
  return (
    <div className="grid grid-cols-[1fr_min-content] gap-12 h-full">
      <div />
      <div className="p-12">
        <Link href="/portfolio/deposit" passHref={true}>
          <Button data-testid="deposit">{t('Deposit')}</Button>
        </Link>
      </div>
    </div>
  );
};
