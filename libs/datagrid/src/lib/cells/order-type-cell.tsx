import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';

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
  const id = order ? order.market.id : '';

  const label = useMemo(() => {
    if (!order) {
      return undefined;
    }
    if (!value) return '-';
    if (order?.peggedOrder) {
      return t('Pegged');
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
