import { t } from '@vegaprotocol/react-helpers';
import { Button } from '@vegaprotocol/ui-toolkit';
import Link from 'next/link';

export const DepositsContainer = () => {
  return (
    <div className="grid grid-cols-[1fr_min-content] gap-4 h-full">
      <div />
      <div className="p-4">
        <Link href="/portfolio/deposit" passHref={true}>
          <Button size="md" data-testid="deposit">
            {t('Deposit')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
