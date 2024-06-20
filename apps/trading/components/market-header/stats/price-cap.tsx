import { useDataProvider } from '@vegaprotocol/data-provider';
import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { type HTMLAttributes } from 'react';
import { marketProvider } from '@vegaprotocol/markets';
import { PriceCell } from '@vegaprotocol/datagrid';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

type PriceCapStatProps = HTMLAttributes<HTMLDivElement> & {
  marketId: string;
  decimalPlaces: number;
};

export const PriceCapStat = ({
  marketId,
  decimalPlaces,
  ...props
}: PriceCapStatProps) => {
  const t = useT();
  const { data } = useDataProvider({
    dataProvider: marketProvider,
    variables: { marketId },
  });

  if (
    !data ||
    data.tradableInstrument.instrument.product.__typename !== 'Future' ||
    !data.tradableInstrument.instrument.product.cap?.maxPrice
  ) {
    return null;
  }

  return (
    <HeaderStat heading={t('Price cap')} {...props}>
      <div>
        {data ? (
          <PriceCell
            value={Number(
              data.tradableInstrument.instrument.product.cap?.maxPrice
            )}
            valueFormatted={addDecimalsFormatNumber(
              data.tradableInstrument.instrument.product.cap?.maxPrice,
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
