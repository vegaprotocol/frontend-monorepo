import { useDataProvider } from '@vegaprotocol/data-provider';
import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { type HTMLAttributes } from 'react';
import { marketDataProvider } from '@vegaprotocol/markets';
import { PriceCell } from '@vegaprotocol/datagrid';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

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
  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId },
  });

  return (
    <HeaderStat heading={t('Last trade')} {...props}>
      <div>
        {data ? (
          <PriceCell
            value={Number(data.lastTradedPrice)}
            valueFormatted={addDecimalsFormatNumber(
              data.lastTradedPrice,
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
