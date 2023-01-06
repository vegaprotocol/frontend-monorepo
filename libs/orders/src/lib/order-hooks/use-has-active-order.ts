import { useState, useEffect, useMemo } from 'react';
import {
  useOrdersUpdateSubscription,
  useOrdersQuery,
} from '../components/order-data-provider/__generated__/Orders';
import { useVegaWallet } from '@vegaprotocol/wallet';
import * as Schema from '@vegaprotocol/types';

export const useHasActiveOrder = (marketId?: string) => {
  const { pubKey } = useVegaWallet();
  const skip = !pubKey;
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const subscriptionVariables = useMemo(
    () => ({
      partyId: pubKey || '',
      marketId,
    }),
    [pubKey, marketId]
  );
  const queryVariables = useMemo(
    () => ({
      ...subscriptionVariables,
      pagination: { first: 1 },
      filter: { status: [Schema.OrderStatus.STATUS_ACTIVE] },
    }),
    [subscriptionVariables]
  );

  const { refetch, data, loading } = useOrdersQuery({
    variables: queryVariables,
    fetchPolicy: 'no-cache',
    skip,
  });
  useEffect(() => {
    if (!loading && data) {
      setHasActiveOrder(!!data.party?.ordersConnection?.edges?.length);
    }
  }, [loading, data]);

  useOrdersUpdateSubscription({
    variables: subscriptionVariables,
    onData: () => refetch(),
    skip,
  });

  return hasActiveOrder;
};
