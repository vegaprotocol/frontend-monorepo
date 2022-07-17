import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';

export const DepositsContainer = () => {
  return (
    <div className="grid grid-cols-[1fr_min-content] gap-12 h-full">
      <div />
      <div className="p-12">
        <AnchorButton data-testid="deposit" href="/portfolio/deposit">
          {t('Deposit')}
        </AnchorButton>
      </div>
    </div>
  );
};
