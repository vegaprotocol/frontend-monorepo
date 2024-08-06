import { useFormatSizeAmount } from '@/hooks/format-size-amount';

import { AmountWithSymbol } from '../string-amounts/amount-with-symbol';
import { SizeWithTooltip } from '../string-amounts/size-with-tooltip';

export const OrderSize = ({
  size,
  marketId,
}: {
  size: string;
  marketId: string;
}) => {
  const formattedSize = useFormatSizeAmount(marketId, size);

  if (!formattedSize) {
    return (
      <SizeWithTooltip
        key="order-details-size"
        marketId={marketId}
        size={size}
      />
    );
  }

  return <AmountWithSymbol amount={formattedSize} />;
};
