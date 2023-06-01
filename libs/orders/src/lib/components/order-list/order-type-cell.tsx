import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useMarketsMap } from '@vegaprotocol/markets';
import type { Order } from '../order-data-provider';
interface OrderTypeCellProps {
  data?: Order;
  onClick?: (marketId: string, metaKey?: boolean) => void;
}

export const OrderTypeCell = ({ data: order, onClick }: OrderTypeCellProps) => {
  const marketId = order?.market.id ?? '';
  const market = useMarketsMap((state) => state.get)(marketId);

  const label = useMemo(() => {
    if (!order) {
      return '';
    }
    if (!order.type) return '-';
    if (order?.peggedOrder) {
      const reference =
        Schema.PeggedReferenceMapping[order.peggedOrder?.reference];
      // the offset (e.g. + 0.001 for a Sell, or -1231.023 for a Buy)
      const side = order.side === Schema.Side.SIDE_BUY ? '-' : '+';
      const offset = addDecimalsFormatNumber(
        order.peggedOrder?.offset,
        market?.decimalPlaces ?? 0
      );
      return t('%s %s %s Peg limit', [reference, side, offset]);
    }
    if (order?.liquidityProvision) {
      return t('Liquidity provision');
    }
    return Schema.OrderTypeMapping[order.type];
  }, [order, market]);

  const handleOnClick = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (onClick) {
        onClick(marketId, ev.metaKey || ev.ctrlKey);
      }
    },
    [marketId, onClick]
  );
  if (!order) return null;
  return order?.liquidityProvision ? (
    <button onClick={handleOnClick} tabIndex={0} className="underline">
      {label}
    </button>
  ) : (
    <span>{label}</span>
  );
};
