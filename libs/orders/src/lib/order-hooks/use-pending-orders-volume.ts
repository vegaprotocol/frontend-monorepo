import { useState, useCallback } from 'react';
import { OrderStatus, Side } from '@vegaprotocol/types';
import { ordersProvider } from '../components/order-data-provider/order-data-provider';
import type { OrderFieldsFragment } from '../components/order-data-provider/__generated__/Orders';
import type { Edge } from '@vegaprotocol/utils';
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

export const useActiveOrdersVolumeAndMargin = (
  partyId: string | null | undefined,
  marketId: string
) => {
  const [buyVolume, setBuyVolume] = useState<string | undefined>();
  const [sellVolume, setSellVolume] = useState<string | undefined>();
  const [buyInitialMargin, setBuyInitialMargin] = useState<
    string | undefined
  >();
  const [sellInitialMargin, setSellInitialMargin] = useState<
    string | undefined
  >();
  const update = useCallback(
    ({ data }: { data: (Edge<OrderFieldsFragment> | null)[] | null }) => {
      if (!data) {
        setBuyVolume(undefined);
        setSellVolume(undefined);
        setBuyInitialMargin(undefined);
        setSellInitialMargin(undefined);
      } else {
        setBuyVolume(sumVolume(data, Side.SIDE_BUY));
        setSellVolume(sumVolume(data, Side.SIDE_SELL));
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
      filter: {
        marketIds: [marketId],
        order: {
          status: [
            OrderStatus.STATUS_ACTIVE,
            OrderStatus.STATUS_PARTIALLY_FILLED,
          ],
        },
      },
    },
    skip: !partyId,
  });
  return buyVolume || sellVolume
    ? {
        buyVolume,
        sellVolume,
        buyInitialMargin,
        sellInitialMargin,
      }
    : undefined;
};
