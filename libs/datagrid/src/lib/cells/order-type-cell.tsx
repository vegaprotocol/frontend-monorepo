import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import * as Schema from '@vegaprotocol/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../use-t';

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
  const t = useT();

  const label = useMemo(() => {
    if (!order) {
      return undefined;
    }
    if (!value) return '-';

    if (order?.icebergOrder) {
      return t('{{orderType}} (Iceberg)', {
        orderType: Schema.OrderTypeMapping[value],
      });
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
      return t('{{reference}} {{side}} {{offset}} Peg limit', {
        reference,
        side,
        offset,
      });
    }

    if (order?.liquidityProvision) {
      return t('Liquidity provision');
    }
    return Schema.OrderTypeMapping[value];
  }, [order, value, t]);

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
