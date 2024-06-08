import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { type HTMLAttributes } from 'react';
import { PriceCell } from '@vegaprotocol/datagrid';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useMarket } from '../../../lib/hooks/use-markets';

type LastTradeStatProps = HTMLAttributes<HTMLDivElement> & {
  marketId: string;
  decimalPlaces: number;
};

export const LastTradeStat = ({
  marketId,
  decimalPlaces,
  ...props
}: LastTradeStatProps) => {
  const t = useT();
  const { data } = useMarket({ marketId });

  return (
    <HeaderStat heading={t('Last trade')} {...props}>
      <div>
        {data?.data ? (
          <PriceCell
            value={Number(data.data.lastTradedPrice)}
            valueFormatted={addDecimalsFormatNumber(
              data.data.lastTradedPrice,
              decimalPlaces
            )}
          />
        ) : (
          '-'
        )}
      </div>
    </HeaderStat>
  );
};
