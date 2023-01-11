import { useLocalStorage } from '@vegaprotocol/react-helpers';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useCallback, useMemo } from 'react';

type OrderData = OrderSubmissionBody['orderSubmission'] | null;

export const usePersistedOrder = (
  marketId: string
): [OrderData, (value: OrderData) => void] => {
  const [value, setValue] = useLocalStorage(`deal-ticket-order-${marketId}`);
  const order = value != null ? (JSON.parse(value) as OrderData) : null;
  const setOrder = useCallback(
    (order: OrderData) => setValue(JSON.stringify(order)),
    [setValue]
  );
  return useMemo<[OrderData, (value: OrderData) => void]>(
    () => [order, setOrder],
    [order, setOrder]
  );
};
