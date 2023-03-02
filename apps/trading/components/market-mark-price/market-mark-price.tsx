import type { RefObject } from 'react';
import { useInView } from 'react-intersection-observer';
import { addDecimalsFormatNumber, isNumeric } from '@vegaprotocol/utils';
import { useThrottledDataProvider } from '@vegaprotocol/react-helpers';
import { PriceCell } from '@vegaprotocol/datagrid';
import { marketDataProvider } from '@vegaprotocol/market-list';
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
      skip: !inView,
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
