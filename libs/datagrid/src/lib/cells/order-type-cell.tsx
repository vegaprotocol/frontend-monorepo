/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import get from 'lodash/get';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';

interface OrderTypeCellProps {
  value?: Schema.OrderType;
  data?: {
    id?: string;
    marketId?: string;
    market?: { id: string };
    peggedOrder?: any;
    liquidityProvision?: any;
  };
  idPath?: string;
  onClick?: (marketId: string, metaKey?: boolean) => void;
}

export const OrderTypeCell = ({
  value,
  data: order,
  idPath,
  onClick,
}: OrderTypeCellProps) => {
  const id = order ? get(order, idPath ?? 'id', 'all') : '';

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
    <button onClick={handleOnClick} tabIndex={0}>
      {label}
    </button>
  ) : (
    <span>{label}</span>
  );
};
