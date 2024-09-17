import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useExplorerMarketQuery } from '../links/market-link/__generated__/Market';

export type DecimalSource = 'MARKET' | 'ASSET';

export type SizeInMarketProps = {
  marketId: string;
  size?: string | number;
  decimalSource?: DecimalSource;
  showAssetLabel?: boolean;
};

/**
 * Given a market ID and an order size it will fetch the market
 * order size, and format the size accordingly
 */
export const SizeInMarket = ({
  marketId,
  size,
  decimalSource = 'MARKET',
  showAssetLabel = false,
}: SizeInMarketProps) => {
  const { data } = useExplorerMarketQuery({
    variables: { id: marketId },
    fetchPolicy: 'cache-first',
  });
  if (!size) {
    return <span>-</span>;
  }

  let label = size;
  let assetLabel = '';
  if (
    data?.market?.tradableInstrument.instrument.product.__typename === 'Future'
  ) {
    assetLabel = data?.market.tradableInstrument.instrument.product.quoteName;
  } else if (
    data?.market?.tradableInstrument.instrument.product.__typename ===
    'Perpetual'
  ) {
    assetLabel = data?.market.tradableInstrument.instrument.product.quoteName;
  }

  if (data) {
    if (decimalSource === 'MARKET' && data.market?.positionDecimalPlaces) {
      label = addDecimalsFormatNumber(size, data.market.positionDecimalPlaces);
    } else if (decimalSource === 'ASSET') {
      let decimals = 0;
      if (
        data.market?.tradableInstrument.instrument.product.__typename ===
        'Future'
      ) {
        decimals =
          data.market.tradableInstrument.instrument.product.settlementAsset
            .decimals;
      } else if (
        data.market?.tradableInstrument.instrument.product.__typename ===
        'Perpetual'
      ) {
        decimals =
          data.market.tradableInstrument.instrument.product.settlementAsset
            .decimals;
      }
      label = addDecimalsFormatNumber(size, decimals);
    }
  }

  return (
    <label>
      <span>{label}</span>
      {showAssetLabel && assetLabel !== '' && (
        <code className="ml-1">{assetLabel}</code>
      )}
    </label>
  );
};

export default SizeInMarket;
