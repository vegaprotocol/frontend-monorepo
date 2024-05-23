import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useExplorerMarketQuery } from '../links/market-link/__generated__/Market';

export type DecimalSource = 'MARKET';

export type SizeInMarketProps = {
  marketId: string;
  size?: string | number;
  decimalSource?: DecimalSource;
};

/**
 * Given a market ID and an order size it will fetch the market
 * order size, and format the size accordingly
 */
export const SizeInMarket = ({
  marketId,
  size,
  decimalSource = 'MARKET',
}: SizeInMarketProps) => {
  const { data } = useExplorerMarketQuery({
    variables: { id: marketId },
    fetchPolicy: 'cache-first',
  });
  if (!size) {
    return <span>-</span>;
  }

  let label = size;

  if (data) {
    if (decimalSource === 'MARKET' && data.market?.positionDecimalPlaces) {
      label = addDecimalsFormatNumber(size, data.market.positionDecimalPlaces);
    }
  }

  return (
    <label>
      <span>{label}</span>
    </label>
  );
};

export default SizeInMarket;
