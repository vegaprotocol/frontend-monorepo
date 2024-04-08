import { type HTMLAttributes } from 'react';
import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { MarketMarkPrice } from '../../market-mark-price';

type MarkPriceStatProps = HTMLAttributes<HTMLDivElement> & {
  marketId: string;
  decimalPlaces: number;
};

export const MarkPriceStat = ({
  marketId,
  decimalPlaces,
}: MarkPriceStatProps) => {
  const t = useT();
  return (
    <HeaderStat heading={t('Mark Price')} data-testid="market-price">
      <MarketMarkPrice marketId={marketId} decimalPlaces={decimalPlaces} />
    </HeaderStat>
  );
};
