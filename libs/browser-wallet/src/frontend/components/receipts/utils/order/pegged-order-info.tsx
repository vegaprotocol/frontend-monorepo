import get from 'lodash/get';

import { useFormatMarketPrice } from '@/hooks/format-market-price';
import { useMarketPriceAsset } from '@/hooks/market-settlement-asset';
import { PEGGED_REFERENCE_MAP, processPeggedReference } from '@/lib/enums';
import type { PeggedOrderOptions } from '@/types/transactions';

import { AmountWithSymbol } from '../string-amounts/amount-with-symbol';
import { PriceWithTooltip } from '../string-amounts/price-with-tooltip';

interface PeggedOrderInfoProperties {
  peggedOrder: PeggedOrderOptions;
  marketId: string;
}

export const PeggedOrderInfo = ({
  peggedOrder,
  marketId,
}: PeggedOrderInfoProperties) => {
  const { offset, reference } = peggedOrder;
  const formattedOffset = useFormatMarketPrice(marketId, offset);
  const settlementAsset = useMarketPriceAsset(marketId);
  const symbol = get(settlementAsset, 'details.symbol');

  const priceToDisplay = formattedOffset ? (
    <AmountWithSymbol amount={formattedOffset} symbol={symbol} />
  ) : (
    <PriceWithTooltip price={offset} marketId={marketId} />
  );
  const peggedReference = processPeggedReference(reference);

  return (
    <span className="flex items-center">
      {priceToDisplay}
      <span className="pl-1 text-surface-0-fg-muted">
        from {PEGGED_REFERENCE_MAP[peggedReference]}
      </span>
    </span>
  );
};
