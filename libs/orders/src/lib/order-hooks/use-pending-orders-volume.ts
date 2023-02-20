import { useState, useCallback } from 'react';
import { OrderStatus, Side } from '@vegaprotocol/types';
import { ordersProvider } from '../components/order-data-provider/order-data-provider';
import type { OrderFieldsFragment } from '../components/order-data-provider/__generated__/Orders';
import type { Edge } from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/react-helpers';

const sumVolume = (orders: (Edge<OrderFieldsFragment> | null)[], side: Side) =>
  orders
    .reduce(
      (sum, order) =>
        order?.node.side === side
          ? sum +
            BigInt(
              order?.node.status === OrderStatus.STATUS_PARTIALLY_FILLED
                ? order?.node.remaining
                : order?.node.size
            )
          : sum,
      BigInt(0)
    )
    .toString();

export const usePendingOrdersVolume = (
  partyId: string | null | undefined,
  marketId: string
) => {
  const [pendingBuyVolume, setPendingBuyVolume] = useState<
    string | undefined
  >();
  const [pendingSellVolume, setPendingSellVolume] = useState<
    string | undefined
  >();
  const update = useCallback(
    ({ data }: { data: (Edge<OrderFieldsFragment> | null)[] | null }) => {
      if (!data) {
        setPendingBuyVolume(undefined);
        setPendingSellVolume(undefined);
      } else {
        setPendingBuyVolume(sumVolume(data, Side.SIDE_BUY));
        setPendingSellVolume(sumVolume(data, Side.SIDE_SELL));
      }
      return true;
    },
    []
  );
  useDataProvider({
    dataProvider: ordersProvider,
    update,
    variables: {
      partyId: partyId || '',
      marketId,
      filter: {
        status: [
          OrderStatus.STATUS_ACTIVE,
          OrderStatus.STATUS_PARTIALLY_FILLED,
        ],
      },
    },
    skip: !partyId,
  });
  return pendingBuyVolume || pendingSellVolume
    ? {
        buy: pendingBuyVolume,
        sell: pendingSellVolume,
      }
    : undefined;
};
