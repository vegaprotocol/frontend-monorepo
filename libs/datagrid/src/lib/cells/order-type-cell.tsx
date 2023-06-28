import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

interface OrderTypeCellProps {
  value?: Schema.OrderType;
  data?: Schema.Order;
  onClick?: (marketId: string, metaKey?: boolean) => void;
}

export const OrderTypeCell = ({
  value,
  data: order,
  onClick,
}: OrderTypeCellProps) => {
  const id = order?.market?.id ?? '';

  const label = useMemo(() => {
    if (!order) {
      return undefined;
    }
    if (!value) return '-';

    console.log(order);

    if (order?.icebergOrder) {
      return t('%s (Iceberg)', [Schema.OrderTypeMapping[value]]);
    }

    if (order?.peggedOrder) {
      const reference =
        Schema.PeggedReferenceMapping[order.peggedOrder?.reference];
      // the offset (e.g. + 0.001 for a Sell, or -1231.023 for a Buy)
      const side = order.side === Schema.Side.SIDE_BUY ? '-' : '+';
      const offset = addDecimalsFormatNumber(
        order.peggedOrder?.offset,
        order.market.decimalPlaces
      );
      return t('%s %s %s Peg limit', [reference, side, offset]);
    }

    if (order?.liquidityProvision) {
      return t('Liquidity provision');
    }
    return Schema.OrderTypeMapping[value];
  }, [order, value]);

  const handleOnClick = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (onClick) {
        onClick(id, ev.metaKey || ev.ctrlKey);
      }
    },
    [id, onClick]
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
