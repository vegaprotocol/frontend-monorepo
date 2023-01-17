import { useExplorerSettlementAssetForMarketQuery } from '../__generated__/Explorer-settlement-asset';
import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import type { VegaSide } from '../liquidity-provision-details';
import type { ExplorerSettlementAssetForMarketQuery } from '../__generated__/Explorer-settlement-asset';

export type LiquidityProvisionOffsetProps = {
  side: VegaSide;
  offset: string;
  marketId: string;
};

/**
 * Correctly formats an LP's offset according to the market settlement decimal places.
 * Initially this will appear unformatted, then when the query loads in the proper formatted
 * value will be displayed
 *
 * @see getFormattedOffset
 */
export function LiquidityProvisionOffset({
  side,
  offset,
  marketId,
}: LiquidityProvisionOffsetProps) {
  const { data } = useExplorerSettlementAssetForMarketQuery({
    variables: {
      id: marketId,
    },
  });

  // getFormattedOffset handles missing results/loading states
  const formattedOffset = getFormattedOffset(offset, data);

  const label = side === 'SIDE_BUY' ? '+' : '-';
  const className = side === 'SIDE_BUY' ? 'text-vega-green' : 'text-vega-pink';
  return <span className={className}>{`${label}${formattedOffset}`}</span>;
}

/**
 * Does the work of formatting the number now we have the settlement decimal places.
 * If no market data is assigned (i.e. during loading, or if the market doesn't exist)
 * this function will return the unformatted number
 *
 * @see LiquidityProvisionOffset
 * @param data the result of a ExplorerSettlementAssetForMarketQuery
 * @param offset the unformatted offset
 * @returns string the offset of this lp order formatted with the settlement decimal places
 */
function getFormattedOffset(
  offset: string,
  data?: ExplorerSettlementAssetForMarketQuery
) {
  const decimals =
    data?.market?.tradableInstrument.instrument.product.settlementAsset
      .decimals;

  if (!decimals) {
    return offset;
  }

  return addDecimalsFormatNumber(offset, decimals);
}
