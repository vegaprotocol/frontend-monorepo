import classnames from 'classnames';
import { useState } from 'react';
import { create } from 'zustand';
import { useTranslation } from 'react-i18next';
import { MarketInfoAccordion } from '@vegaprotocol/markets';
import {
  Button,
  Dialog,
  Icon,
  SyntaxHighlighter,
} from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import type { MarketInfoWithData } from '@vegaprotocol/markets';

type MarketDataDialogState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const useMarketDataDialogStore = create<MarketDataDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const ProposalMarketData = ({
  marketData,
}: {
  marketData: MarketInfoWithData;
}) => {
  const { t } = useTranslation();
  const { isOpen, open, close } = useMarketDataDialogStore();
  const [showDetails, setShowDetails] = useState(false);
  const showDetailsIconClasses = classnames('mb-4', {
    'rotate-180': showDetails,
  });

  if (!marketData) {
    return null;
  }

  return (
    <section className="relative" data-testid="proposal-market-data">
      <button
        onClick={() => setShowDetails(!showDetails)}
        data-testid="proposal-market-data-toggle"
      >
        <div className="flex items-center gap-3">
          <SubHeading title={t('marketDetails')} />
          <div className={showDetailsIconClasses}>
            <Icon name="chevron-down" size={8} />
          </div>
        </div>
      </button>

      {showDetails && (
        <>
          <div className="float-right">
            <Button onClick={open}>{t('viewMarketJson')}</Button>
          </div>
          <div className="-mx-4">
            <MarketInfoAccordion market={marketData} />
          </div>
        </>
      )}

      <Dialog
        title={t('Withdraw')}
        open={isOpen}
        onChange={(isOpen) => (isOpen ? open() : close())}
        size="medium"
      >
        <SyntaxHighlighter data={marketData} />
      </Dialog>
    </section>
  );
};
