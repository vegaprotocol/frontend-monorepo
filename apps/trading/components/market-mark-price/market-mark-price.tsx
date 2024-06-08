import { addDecimalsFormatNumber, isNumeric } from '@vegaprotocol/utils';
import { PriceCell } from '@vegaprotocol/datagrid';
import { useMarket } from '../../lib/hooks/use-markets';

interface Props {
  marketId?: string;
  decimalPlaces?: number;
  asPriceCell?: boolean;
  initialValue?: string;
}

export const MarketMarkPrice = ({
  marketId,
  decimalPlaces,
  initialValue,
  asPriceCell,
}: Props) => {
  const { data } = useMarket({ marketId });

  const marketPrice = data?.data?.markPrice || initialValue;

  if (!marketPrice || !isNumeric(decimalPlaces)) {
    return <span>-</span>;
  }
  if (asPriceCell) {
    return (
      <PriceCell
        value={Number(marketPrice)}
        valueFormatted={addDecimalsFormatNumber(marketPrice, decimalPlaces, 2)}
      />
    );
  }
  return <span>{addDecimalsFormatNumber(marketPrice, decimalPlaces)}</span>;
};
