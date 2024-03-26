import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { type HTMLAttributes } from 'react';
import { Last24hPriceChange } from '@vegaprotocol/markets';

type Last24hPriceChangeStatProps = HTMLAttributes<HTMLDivElement> & {
  marketId: string;
  decimalPlaces: number;
};

export const Last24hPriceChangeStat = ({
  marketId,
  decimalPlaces,
}: Last24hPriceChangeStatProps) => {
  const t = useT();

  return (
    <HeaderStat heading={t('Change (24h)')} data-testid="market-change">
      <Last24hPriceChange marketId={marketId} decimalPlaces={decimalPlaces} />
    </HeaderStat>
  );
};
