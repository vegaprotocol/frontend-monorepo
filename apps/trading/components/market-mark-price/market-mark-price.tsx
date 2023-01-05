import { useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  t,
  PriceCell,
  isNumeric,
} from '@vegaprotocol/react-helpers';
import { HeaderStat } from '../header';
interface Props {
  decimalPlaces?: number;
  marketPrice?: string;
  isHeader?: boolean;
}

export const MarketMarkPrice = ({
  decimalPlaces,
  marketPrice,
  isHeader = false,
}: Props) => {
  const content = useMemo(() => {
    if (!marketPrice || !isNumeric(decimalPlaces)) {
      return <>-</>;
    }
    return isHeader ? (
      <div>{addDecimalsFormatNumber(marketPrice, decimalPlaces)}</div>
    ) : (
      <PriceCell
        value={Number(marketPrice)}
        valueFormatted={addDecimalsFormatNumber(marketPrice, decimalPlaces, 2)}
      />
    );
  }, [marketPrice, decimalPlaces, isHeader]);

  return isHeader ? (
    <HeaderStat heading={t('Price')} testId="market-price">
      {content}
    </HeaderStat>
  ) : (
    content
  );
};
