import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

export type DecimalSource = 'MARKET' | 'SETTLEMENT_ASSET';

export type PriceInMarketProps = {
  price: string;
  decimals: number;
  symbol: string;
};

/**
 * An alternative to PriceInMarket for when you need the price
 * with an asset's decimal places.
 */
export const PriceInAsset = ({
  price,
  decimals,
  symbol,
}: PriceInMarketProps) => {
  const label = addDecimalsFormatNumber(price, decimals);

  return (
    <label>
      <span>{label}</span> <span>{symbol}</span>
    </label>
  );
};

export default PriceInAsset;
