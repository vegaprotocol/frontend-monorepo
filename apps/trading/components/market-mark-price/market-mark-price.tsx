import type { RefObject } from 'react';
import { useInView } from 'react-intersection-observer';
import { addDecimalsFormatNumber, isNumeric } from '@vegaprotocol/utils';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import { PriceCell } from '@vegaprotocol/datagrid';
import { marketDataProvider } from '@vegaprotocol/markets';
import { THROTTLE_UPDATE_TIME } from '../constants';

interface Props {
  marketId?: string;
  decimalPlaces?: number;
  asPriceCell?: boolean;
  inViewRoot?: RefObject<Element>;
  initialValue?: string;
}

export const MarketMarkPrice = ({
  marketId,
  decimalPlaces,
  initialValue,
  inViewRoot,
  asPriceCell,
}: Props) => {
  const [ref, inView] = useInView({ root: inViewRoot?.current });
  const { data } = useThrottledDataProvider(
    {
      dataProvider: marketDataProvider,
      variables: { marketId: marketId || '' },
      skip: !inView || !marketId,
    },
    THROTTLE_UPDATE_TIME
  );

  const marketPrice = data?.markPrice || initialValue;

  if (!marketPrice || !isNumeric(decimalPlaces)) {
    return <span ref={ref}>-</span>;
  }
  if (asPriceCell) {
    return (
      <PriceCell
        ref={ref}
        value={Number(marketPrice)}
        valueFormatted={addDecimalsFormatNumber(marketPrice, decimalPlaces, 2)}
      />
    );
  }
  return (
    <span ref={ref}>{addDecimalsFormatNumber(marketPrice, decimalPlaces)}</span>
  );
};
